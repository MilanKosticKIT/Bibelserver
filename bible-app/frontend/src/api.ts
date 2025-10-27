export interface BookMeta {
  id: string;
  name: string;
  chaptersCount: number;
}

export interface ChapterResponse {
  translation: string;
  book: BookMeta;
  chapter: number;
  verses: { v: number; t: string }[];
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  snippet: string;
}

export interface SearchResponse {
  translation: string;
  query: string;
  results: SearchResult[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request<T>(path: string, params?: Record<string, string | number>) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getTranslations() {
  return request<{ translations: string[] }>('/api/translations');
}

export function getBooks(translation: string) {
  return request<{ translation: string; books: BookMeta[] }>('/api/books', { translation });
}

export function getChapter(translation: string, book: string, chapter: number) {
  return request<ChapterResponse>('/api/text', { translation, book, chapter });
}

export function search(translation: string, query: string, limit = 50) {
  return request<SearchResponse>('/api/search', { translation, q: query, limit });
}
