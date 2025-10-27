from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict

from ..models import Book, Chapter, Translation, Verse
from . import TranslationProvider, discover_translation_files

_WHITESPACE_RE = re.compile(r"\s+")


def _clean_text(text: str) -> str:
    text = _WHITESPACE_RE.sub(" ", text.strip())
    return text


def _infer_translation_id(path: Path) -> str:
    stem = path.stem
    return stem.split("_")[0] if "_" in stem else stem


def _infer_translation_name(root: ET.Element, default: str) -> str:
    return root.attrib.get("biblename") or default


class ZefaniaProvider(TranslationProvider):
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def load(self) -> Dict[str, Translation]:
        translations: Dict[str, Translation] = {}
        for xml_file in discover_translation_files(self.data_dir):
            translation = self._parse_file(xml_file)
            translations[translation.id] = translation
        return translations

    def _parse_file(self, path: Path) -> Translation:
        tree = ET.parse(path)
        root = tree.getroot()
        translation_id = _infer_translation_id(path)
        translation_name = _infer_translation_name(root, translation_id)

        books: Dict[str, Book] = {}
        for book_element in root.iterfind(".//BIBLEBOOK"):
            book_id = book_element.attrib.get("osis") or book_element.attrib.get("bsname")
            if not book_id:
                name_attr = book_element.attrib.get("bname") or "Unknown"
                book_id = re.sub(r"[^A-Za-z0-9]", "", name_attr)[:6] or "BOOK"
            book_name = book_element.attrib.get("bname") or book_id
            chapters: Dict[int, Chapter] = {}

            for chapter_element in book_element.findall("CHAPTER"):
                chapter_number = int(chapter_element.attrib.get("cnumber", "0") or 0)
                if chapter_number <= 0:
                    continue
                verses = []
                for verse_element in chapter_element.findall("VERS"):
                    verse_number = int(verse_element.attrib.get("vnumber", "0") or 0)
                    if verse_number <= 0:
                        continue
                    verse_text = _clean_text("".join(verse_element.itertext()))
                    if not verse_text:
                        continue
                    verses.append(Verse(number=verse_number, text=verse_text))
                if verses:
                    chapters[chapter_number] = Chapter(number=chapter_number, verses=verses)

            if chapters:
                books[book_id] = Book(id=book_id, name=book_name, chapters=chapters)

        return Translation(id=translation_id, name=translation_name, books=books)
