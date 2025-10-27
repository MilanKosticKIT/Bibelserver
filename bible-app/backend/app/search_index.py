from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, Iterable, List, Set


_TOKEN_RE = re.compile(r"[\w']+")


@dataclass
class SearchEntry:
    translation: str
    book_id: str
    book_name: str
    chapter: int
    verse: int
    text: str


class SearchIndex:
    def __init__(self) -> None:
        self._entries: List[SearchEntry] = []
        self._token_map: Dict[str, Set[int]] = {}

    def add_entry(self, entry: SearchEntry) -> None:
        entry_id = len(self._entries)
        self._entries.append(entry)
        for token in self._tokenize(entry.text):
            bucket = self._token_map.setdefault(token, set())
            bucket.add(entry_id)

    def add_verse(
        self,
        translation: str,
        book_id: str,
        book_name: str,
        chapter: int,
        verse: int,
        text: str,
    ) -> None:
        self.add_entry(
            SearchEntry(
                translation=translation,
                book_id=book_id,
                book_name=book_name,
                chapter=chapter,
                verse=verse,
                text=text,
            )
        )

    def search(self, translation: str, query: str, limit: int = 50) -> List[SearchEntry]:
        tokens = list(self._tokenize(query))
        if not tokens:
            return []

        matching_ids: Set[int] | None = None
        for token in tokens:
            ids = self._token_map.get(token)
            if not ids:
                return []
            matching_ids = ids if matching_ids is None else matching_ids & ids
            if not matching_ids:
                return []

        results: List[SearchEntry] = []
        if not matching_ids:
            return results

        for entry_id in sorted(matching_ids):
            entry = self._entries[entry_id]
            if entry.translation != translation:
                continue
            results.append(entry)
            if len(results) >= limit:
                break
        return results

    def _tokenize(self, text: str) -> Iterable[str]:
        for match in _TOKEN_RE.finditer(text.lower()):
            yield match.group(0)


def build_index() -> SearchIndex:
    return SearchIndex()
