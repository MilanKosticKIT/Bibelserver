import React from 'react';

interface ChapterPickerProps {
  chaptersCount: number;
  selectedChapter: number | null;
  onSelect: (chapter: number) => void;
}

const ChapterPicker: React.FC<ChapterPickerProps> = ({ chaptersCount, selectedChapter, onSelect }) => {
  if (!chaptersCount) {
    return null;
  }

  const chapters = Array.from({ length: chaptersCount }, (_, index) => index + 1);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Kapitel</h3>
      <div className="grid grid-cols-6 gap-2 text-sm md:grid-cols-8">
        {chapters.map((chapter) => (
          <button
            key={chapter}
            type="button"
            onClick={() => onSelect(chapter)}
            className={`rounded border px-2 py-1 ${
              selectedChapter === chapter
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            {chapter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChapterPicker;
