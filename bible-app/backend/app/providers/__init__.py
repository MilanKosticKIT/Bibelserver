from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, Protocol

from ..models import Translation


class TranslationProvider(Protocol):
    """Protocol for translation providers."""

    def load(self) -> Dict[str, Translation]:
        """Return a mapping of translation id to Translation objects."""


def discover_translation_files(directory: Path, pattern: str = "*.xml") -> Iterable[Path]:
    for path in sorted(directory.glob(pattern)):
        if path.is_file():
            yield path
