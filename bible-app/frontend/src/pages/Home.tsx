import React, { useEffect, useState } from 'react';
import { BookMeta, ChapterResponse, getBooks, getChapter } from '../api';
import BookPicker from '../components/BookPicker';
import ChapterPicker from '../components/ChapterPicker';
import VerseList from '../components/VerseList';

interface HomeProps {
  translation: string | null;
}

const Home: React.FC<HomeProps> = ({ translation }) => {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterData, setChapterData] = useState<ChapterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!translation) {
      return;
    }
    setSelectedBook(null);
    setSelectedChapter(null);
    setChapterData(null);
    setError(null);
    setLoading(true);
    getBooks(translation)
      .then((response) => {
        setBooks(response.books);
        if (response.books.length > 0) {
          setSelectedBook(response.books[0].id);
          setSelectedChapter(1);
        }
      })
      .catch((err) => {
        console.error(err);
        setBooks([]);
        setSelectedBook(null);
        setSelectedChapter(null);
        setError('Bücher konnten nicht geladen werden.');
      })
      .finally(() => setLoading(false));
  }, [translation]);

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

  if (!translation) {
    return <p className="p-4 text-sm text-slate-600">Bitte eine Übersetzung auswählen.</p>;
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
        {loading && <p className="text-sm text-slate-500">Lade Inhalte…</p>}
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
          <p className="text-sm text-slate-500">
            Wählen Sie ein Buch und Kapitel, um den Text anzuzeigen.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
