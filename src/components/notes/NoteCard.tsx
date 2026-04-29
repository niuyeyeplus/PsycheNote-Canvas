'use client';

import { useCallback } from 'react';

import { MOOD_CONFIG } from '@/config/moodConfig';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  // eslint-disable-next-line react/require-default-props
  onDelete?: (id: string) => void;
}

const MOOD_EMOJI: Record<string, string> = {
  calm: '😌',
  happy: '😊',
  unhappy: '😢',
  anxious: '😰',
  excited: '🤩',
};

const NoteCard = ({ note, onDelete }: NoteCardProps) => {
  const config = MOOD_CONFIG[note.mood];
  const emoji = MOOD_EMOJI[note.mood] || '😌';

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(note.id);
    }
  }, [note.id, onDelete]);

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
      {/* 情绪标签 */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm">{emoji}</span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)' }}
        >
          {config.label}
        </span>
      </div>

      {/* 内容 */}
      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{note.content}</p>

      {/* 日期 */}
      <p className="text-gray-400 text-xs mt-2">
        {new Date(note.createdAt).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {/* 删除按钮 */}
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default NoteCard;
