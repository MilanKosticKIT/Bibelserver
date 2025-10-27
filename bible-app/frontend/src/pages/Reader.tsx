import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookMeta, ChapterResponse, getBooks, getChapter } from '../api';
import BookPicker from '../components/BookPicker';
import ChapterPicker from '../components/ChapterPicker';
import VerseList from '../components/VerseList';

const Reader: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const translation = params.translation ?? null;
  const initialBook = params.bookId ?? null;
  const parsedChapter = params.chapter ? Number(params.chapter) : NaN;
  const initialChapter = Number.isNaN(parsedChapter) ? null : parsedChapter;

  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(initialChapter);
  const [chapterData, setChapterData] = useState<ChapterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!translation) {
      return;
    }
    setError(null);
    getBooks(translation).then((response) => {
      setBooks(response.books);
      if (!response.books.find((book) => book.id === initialBook) && response.books.length > 0) {
        setSelectedBook(response.books[0].id);
        setSelectedChapter(1);
      }
    }).catch((err) => {
      console.error(err);
      setBooks([]);
      setSelectedBook(null);
      setSelectedChapter(null);
      setError('Bücher konnten nicht geladen werden.');
    });
  }, [translation, initialBook]);

  useEffect(() => {
    if (!selectedBook) {
      return;
    }
    const book = books.find((item) => item.id === selectedBook);
    if (!book) {
      return;
    }
    if (!selectedChapter || selectedChapter > book.chaptersCount) {
      setSelectedChapter(1);
    }
  }, [books, selectedBook]);

  useEffect(() => {
    if (!translation || !selectedBook || !selectedChapter) {
      return;
    }
    setLoading(true);
    setError(null);
    getChapter(translation, selectedBook, selectedChapter)
      .then((response) => {
        setChapterData(response);
      })
      .catch((err) => {
        console.error(err);
        setChapterData(null);
        setError('Kapitel konnte nicht geladen werden.');
      })
      .finally(() => setLoading(false));
  }, [translation, selectedBook, selectedChapter]);

  useEffect(() => {
    if (!translation || !selectedBook || !selectedChapter) {
      return;
    }
    navigate(`/${translation}/${selectedBook}/${selectedChapter}`, { replace: true });
  }, [navigate, translation, selectedBook, selectedChapter]);

  if (!translation) {
    return <p className="p-4 text-sm text-slate-600">Keine Übersetzung gewählt.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:flex-row">
      <div className="w-full md:w-72">
        <div className="space-y-6 rounded-lg bg-white p-4 shadow">
          <BookPicker
            books={books}
            selectedBookId={selectedBook}
            onSelect={(bookId) => setSelectedBook(bookId || null)}
          />
          {selectedBook && (
            <ChapterPicker
              chaptersCount={books.find((book) => book.id === selectedBook)?.chaptersCount || 0}
              selectedChapter={selectedChapter}
              onSelect={setSelectedChapter}
            />
          )}
        </div>
      </div>
      <div className="flex-1 rounded-lg bg-white p-6 shadow">
        {loading && <p className="text-sm text-slate-500">Lade Kapitel…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}
        {!loading && chapterData && (
          <>
            <h1 className="mb-4 text-2xl font-bold text-slate-800">
              {chapterData.book.name} {chapterData.chapter}
            </h1>
            <VerseList verses={chapterData.verses} />
          </>
        )}
        {!loading && !chapterData && (
          <p className="text-sm text-slate-500">Kapitel konnte nicht geladen werden.</p>
        )}
      </div>
    </div>
  );
};

export default Reader;
