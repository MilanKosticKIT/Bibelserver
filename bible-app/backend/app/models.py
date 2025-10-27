from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from pydantic import BaseModel


@dataclass
class Verse:
    number: int
    text: str


@dataclass
class Chapter:
    number: int
    verses: List[Verse]


@dataclass
class Book:
    id: str
    name: str
    chapters: Dict[int, Chapter]


@dataclass
class Translation:
    id: str
    name: str
    books: Dict[str, Book]


class TranslationList(BaseModel):
    translations: List[str]


class BookMeta(BaseModel):
    id: str
    name: str
    chaptersCount: int


class BookListResponse(BaseModel):
    translation: str
    books: List[BookMeta]


class VerseResponse(BaseModel):
    v: int
    t: str


class ChapterResponse(BaseModel):
    translation: str
    book: BookMeta
    chapter: int
    verses: List[VerseResponse]


class SearchResult(BaseModel):
    bookId: str
    bookName: str
    chapter: int
    verse: int
    snippet: str


class SearchResponse(BaseModel):
    translation: str
    query: str
    results: List[SearchResult]
