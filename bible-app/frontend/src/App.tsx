import React, { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getTranslations, search as searchApi, SearchResult } from './api';
import TranslationPicker from './components/TranslationPicker';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Home from './pages/Home';
import Reader from './pages/Reader';

const App: React.FC = () => {
  const [translations, setTranslations] = useState<string[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getTranslations()
      .then((response) => {
        setTranslations(response.translations);
        if (response.translations.length > 0) {
          setSelectedTranslation((current) => current ?? response.translations[0]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (translations.length === 0) {
      return;
    }
    const match = location.pathname.match(/^\/([^/]+)/);
    if (match && translations.includes(match[1])) {
      setSelectedTranslation(match[1]);
    }
  }, [location.pathname, translations]);

  const handleTranslationChange = (translation: string) => {
    if (!translation) {
      return;
    }
    setSelectedTranslation(translation);
    clearSearch();
    navigate('/');
  };

  const handleSearch = async (query: string) => {
    if (!selectedTranslation) {
      return;
    }
    setSearching(true);
    setSearchError(null);
    setSearchQuery(query);
    setSearchResults([]);
    try {
      const response = await searchApi(selectedTranslation, query);
      setSearchResults(response.results);
    } catch (error) {
      setSearchResults([]);
      setSearchError('Suche fehlgeschlagen.');
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const headerTitle = useMemo(() => 'Offline Bibel App', []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{headerTitle}</h1>
            <p className="text-sm text-slate-500">Schnellzugriff auf offline gespeicherte Bibeltexte</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <TranslationPicker
              translations={translations}
              selected={selectedTranslation}
              onChange={handleTranslationChange}
            />
            <SearchBar
              disabled={!selectedTranslation || searching}
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(value) => {
                setSearchInput(value);
                return handleSearch(value);
              }}
            />
          </div>
        </div>
        {searchQuery && (
          <SearchResults
            translation={selectedTranslation}
            query={searchQuery}
            results={searchResults}
            loading={searching}
            onClose={clearSearch}
          />
        )}
        {searchError && (
          <div className="bg-red-50 px-4 py-2 text-sm text-red-700">{searchError}</div>
        )}
      </header>
      <main className="flex-1 bg-slate-100">
        <Routes>
          <Route path="/" element={<Home translation={selectedTranslation} />} />
          <Route path="/:translation/:bookId/:chapter" element={<Reader />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
          Datenquelle: Zefania XML – komplett offline nutzbar.
        </div>
      </footer>
    </div>
  );
};

export default App;
