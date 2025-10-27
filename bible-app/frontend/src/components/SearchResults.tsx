import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '../api';

interface SearchResultsProps {
  translation: string | null;
  query: string;
  results: SearchResult[];
  onClose: () => void;
  loading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ translation, query, results, onClose, loading }) => {
  const navigate = useNavigate();

  if (!translation) {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 text-sm text-slate-600">
        <span>
          Suche nach <strong>„{query}“</strong>{' '}
          {loading ? '…' : `– ${results.length} Treffer`}
        </span>
        <button type="button" onClick={onClose} className="text-indigo-600 hover:underline">
          Schließen
        </button>
      </div>
      <ul className="max-h-64 overflow-y-auto border-t border-slate-100 px-4">
        {results.map((result) => (
          <li key={`${result.bookId}-${result.chapter}-${result.verse}`} className="border-b border-slate-100 py-3 last:border-b-0">
            <button
              type="button"
              className="text-left"
              onClick={() => {
                navigate(`/${translation}/${result.bookId}/${result.chapter}`);
                onClose();
              }}
            >
              <p className="text-sm font-semibold text-indigo-600">
                {result.bookName} {result.chapter},{result.verse}
              </p>
              <p className="text-sm text-slate-700">{result.snippet}</p>
            </button>
          </li>
        ))}
        {results.length === 0 && !loading && (
          <li className="py-6 text-center text-sm text-slate-500">Keine Treffer gefunden.</li>
        )}
      </ul>
    </div>
  );
};

export default SearchResults;
