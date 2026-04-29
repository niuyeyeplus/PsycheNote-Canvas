import type { Note } from '@/types/note';

import NoteCard from './NoteCard';

interface NoteGridProps {
  notes: Note[];
  onViewHistory: () => void;
  // eslint-disable-next-line react/require-default-props
  onDeleteNote?: (id: string) => void;
}

const VISIBLE_COUNT = 6; // 3列 × 2行

const NoteGrid = ({ notes, onViewHistory, onDeleteNote }: NoteGridProps) => {
  const visibleNotes = notes.slice(0, VISIBLE_COUNT);
  const hasHistory = notes.length > VISIBLE_COUNT;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      {visibleNotes.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {visibleNotes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={onDeleteNote} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <p className="text-lg mb-1">还没有便签</p>
          <p className="text-sm">点击右上角&quot;记录下今日的便签吧！&quot;开始记录</p>
        </div>
      )}

      {hasHistory && (
        <button
          type="button"
          onClick={onViewHistory}
          className="mt-4 mx-auto block px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 text-sm font-medium transition-colors"
        >
          历史便签（{notes.length}条）
        </button>
      )}
    </div>
  );
};

export default NoteGrid;
