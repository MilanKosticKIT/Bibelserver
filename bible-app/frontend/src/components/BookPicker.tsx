import React from 'react';
import { BookMeta } from '../api';

interface BookPickerProps {
  books: BookMeta[];
  selectedBookId: string | null;
  onSelect: (bookId: string) => void;
}

const BookPicker: React.FC<BookPickerProps> = ({ books, selectedBookId, onSelect }) => {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="book-picker">
        Buch
      </label>
      <select
        id="book-picker"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        value={selectedBookId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="">Bitte wählen…</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BookPicker;
