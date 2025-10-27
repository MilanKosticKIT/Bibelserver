import React from 'react';

interface TranslationPickerProps {
  translations: string[];
  selected: string | null;
  onChange: (translation: string) => void;
}

const TranslationPicker: React.FC<TranslationPickerProps> = ({ translations, selected, onChange }) => {
  return (
    <select
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
      value={selected ?? ''}
      onChange={(event) => onChange(event.target.value)}
    >
      {translations.length === 0 && <option value="">Lade Übersetzungen…</option>}
      {translations.length > 0 && selected === null && (
        <option value="" disabled>
          Bitte wählen…
        </option>
      )}
      {translations.map((translation) => (
        <option key={translation} value={translation}>
          {translation}
        </option>
      ))}
    </select>
  );
};

export default TranslationPicker;
