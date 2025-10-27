import React from 'react';

interface VerseListProps {
  verses: { v: number; t: string }[];
}

const VerseList: React.FC<VerseListProps> = ({ verses }) => {
  return (
    <ol className="space-y-4">
      {verses.map((verse) => (
        <li key={verse.v} className="flex gap-3 text-lg leading-relaxed">
          <span className="font-semibold text-indigo-600">{verse.v}</span>
          <p className="text-justify">{verse.t}</p>
        </li>
      ))}
    </ol>
  );
};

export default VerseList;
