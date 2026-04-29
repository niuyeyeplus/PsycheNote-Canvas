import { useMemo } from 'react';

import type { Note } from '@/types/note';

import NoteCard from './NoteCard';

interface HistoryModalProps {
  notes: Note[];
  onClose: () => void;
  // eslint-disable-next-line react/require-default-props
  onDeleteNote?: (id: string) => void;
  // eslint-disable-next-line react/require-default-props
  onEditNote?: (note: Note) => void;
}

interface WeekGroup {
  label: string;
  notes: Note[];
  weekStart: Date;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekLabel = (weekStart: Date): string => {
  const year = weekStart.getFullYear();
  const month = weekStart.getMonth() + 1;
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (weekStart.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}年${month}月第${weekNum}周`;
};

const HistoryModal = ({ notes, onClose, onDeleteNote, onEditNote }: HistoryModalProps) => {
  const weekGroups = useMemo<WeekGroup[]>(() => {
    const groups: Map<string, WeekGroup> = new Map();

    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const weekStart = getWeekStart(date);
      const key = weekStart.toISOString().slice(0, 10);

      if (!groups.has(key)) {
        groups.set(key, {
          label: formatWeekLabel(weekStart),
          notes: [],
          weekStart,
        });
      }
      groups.get(key)!.notes.push(note);
    });

    return Array.from(groups.values()).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    );
  }, [notes]);

  const currentGroup = weekGroups[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-purple-600">历史便签</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-400 hover:text-purple-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {currentGroup && (
            <div>
              <p className="text-sm text-gray-400 mb-3">{currentGroup.label}</p>
              <div className="grid grid-cols-3 gap-3">
                {currentGroup.notes.map(note => (
                  <NoteCard key={note.id} note={note} onDelete={onDeleteNote} onEdit={onEditNote} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
