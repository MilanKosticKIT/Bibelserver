import React from 'react';

interface SearchBarProps {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<void> | void;
}

const SearchBar: React.FC<SearchBarProps> = ({ disabled, value, onChange, onSearch }) => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    await onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-2">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Suche in der Bibel…"
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        disabled={disabled}
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none"
        disabled={disabled}
      >
        Suche
      </button>
    </form>
  );
};

export default SearchBar;
