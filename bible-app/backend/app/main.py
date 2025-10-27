from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    BookListResponse,
    BookMeta,
    ChapterResponse,
    SearchResponse,
    Translation,
    TranslationList,
    VerseResponse,
)
from .providers.zefania import ZefaniaProvider
from .search_index import SearchEntry, SearchIndex, build_index

logger = logging.getLogger(__name__)

DATA_DIR = Path("/app/data")

app = FastAPI(title="Offline Bible API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslationStore:
    def __init__(self) -> None:
        self.translations: Dict[str, Translation] = {}
        self.index: SearchIndex = build_index()

    def load(self) -> None:
        provider = ZefaniaProvider(DATA_DIR)
        translations = provider.load()
        self.translations = translations
        self.index = build_index()
        for translation in translations.values():
            for book in translation.books.values():
                for chapter in book.chapters.values():
                    for verse in chapter.verses:
                        self.index.add_verse(
                            translation=translation.id,
                            book_id=book.id,
                            book_name=book.name,
                            chapter=chapter.number,
                            verse=verse.number,
                            text=verse.text,
                        )


store = TranslationStore()


@app.on_event("startup")
async def load_translations() -> None:
    logger.info("Loading translations from %s", DATA_DIR)
    store.load()
    logger.info("Loaded %d translations", len(store.translations))


def get_translation_store() -> TranslationStore:
    if not store.translations:
        store.load()
    return store


def _get_translation(translation_id: str, translation_store: TranslationStore) -> Translation:
    translation = translation_store.translations.get(translation_id)
    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")
    return translation


@app.get("/api/translations", response_model=TranslationList)
def list_translations(translation_store: TranslationStore = Depends(get_translation_store)):
    return TranslationList(translations=sorted(translation_store.translations.keys()))


@app.get("/api/books", response_model=BookListResponse)
def list_books(
    translation: str = Query(..., alias="translation"),
    translation_store: TranslationStore = Depends(get_translation_store),
):
    translation_obj = _get_translation(translation, translation_store)
    books = [
        BookMeta(
            id=book.id,
            name=book.name,
            chaptersCount=len(book.chapters),
        )
        for book in translation_obj.books.values()
    ]
    return BookListResponse(translation=translation_obj.id, books=books)


@app.get("/api/text", response_model=ChapterResponse)
def get_chapter(
    translation: str,
    book: str,
    chapter: int,
    translation_store: TranslationStore = Depends(get_translation_store),
):
    translation_obj = _get_translation(translation, translation_store)
    book_obj = translation_obj.books.get(book)
    if not book_obj:
        raise HTTPException(status_code=404, detail="Book not found")
    chapter_obj = book_obj.chapters.get(chapter)
    if not chapter_obj:
        raise HTTPException(status_code=404, detail="Chapter not found")

    verses = [VerseResponse(v=verse.number, t=verse.text) for verse in chapter_obj.verses]
    book_meta = BookMeta(id=book_obj.id, name=book_obj.name, chaptersCount=len(book_obj.chapters))
    return ChapterResponse(
        translation=translation_obj.id,
        book=book_meta,
        chapter=chapter_obj.number,
        verses=verses,
    )


@app.get("/api/search", response_model=SearchResponse)
def search(
    translation: str,
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=200),
    translation_store: TranslationStore = Depends(get_translation_store),
):
    _get_translation(translation, translation_store)
    entries = translation_store.index.search(translation, q, limit=limit)
    results = [
        {
            "bookId": entry.book_id,
            "bookName": entry.book_name,
            "chapter": entry.chapter,
            "verse": entry.verse,
            "snippet": _create_snippet(entry, q),
        }
        for entry in entries
    ]
    return SearchResponse(translation=translation, query=q, results=results)


def _create_snippet(entry: SearchEntry, query: str, window: int = 120) -> str:
    text = entry.text
    lower_text = text.lower()
    lower_query = query.lower()
    pos = lower_text.find(lower_query)
    if pos == -1:
        return text[:window].rstrip() + ("…" if len(text) > window else "")
    start = max(0, pos - window // 2)
    end = min(len(text), pos + len(query) + window // 2)
    snippet = text[start:end]
    if start > 0:
        snippet = "…" + snippet
    if end < len(text):
        snippet = snippet + "…"
    return snippet
