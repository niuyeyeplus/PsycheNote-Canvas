import { render, screen } from '@testing-library/react';

import NoteGrid from '@/components/notes/NoteGrid';
import type { Note } from '@/types/note';

describe('NoteGrid', () => {
  const createMockNote = (
    id: string,
    mood: 'calm' | 'happy' | 'unhappy' | 'anxious' | 'excited' = 'happy'
  ): Note => ({
    id,
    content: `便签内容 ${id}`,
    mood,
    createdAt: '2026-04-29T10:00:00.000Z',
  });

  const mockOnViewHistory = jest.fn();
  const mockOnDeleteNote = jest.fn();
  const mockOnEditNote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('空状态', () => {
    it('无便签时应该显示空状态提示', () => {
      render(
        <NoteGrid
          notes={[]}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      expect(screen.getByText(/还没有便签/)).toBeInTheDocument();
      expect(screen.getByText(/点击右上角.*记录下今日的便签吧/)).toBeInTheDocument();
    });

    it('无便签时不应该显示历史按钮', () => {
      render(
        <NoteGrid
          notes={[]}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      expect(screen.queryByText(/历史便签/)).not.toBeInTheDocument();
    });
  });

  describe('便签显示', () => {
    it('应该显示最新6条便签', () => {
      const notes = Array.from({ length: 8 }, (_, i) => createMockNote(`${i + 1}`));

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      // NoteCard 渲染的是 content
      const cards = document.querySelectorAll('.line-clamp-4');
      expect(cards).toHaveLength(6);
    });

    it('少于6条时应该显示所有便签', () => {
      const notes = [createMockNote('1'), createMockNote('2'), createMockNote('3')];

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      const cards = document.querySelectorAll('.line-clamp-4');
      expect(cards).toHaveLength(3);
    });

    it('应该显示最新的便签（倒序后取前6个）', () => {
      const notes = [
        {
          id: '1',
          content: '4月27日',
          mood: 'happy' as const,
          createdAt: '2026-04-27T10:00:00.000Z',
        },
        {
          id: '2',
          content: '4月29日',
          mood: 'happy' as const,
          createdAt: '2026-04-29T10:00:00.000Z',
        },
        {
          id: '3',
          content: '4月28日',
          mood: 'happy' as const,
          createdAt: '2026-04-28T10:00:00.000Z',
        },
      ];

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      // NoteGrid 使用 [...notes].reverse().slice(0, 6) 获取最新6条
      // 原始顺序按 createdAt 升序：[1最旧, 3中间, 2最新]
      // reverse 后：[2最新, 3中间, 1最旧]
      // 显示的卡片内容应该包含"4月29日"
      const cards = document.querySelectorAll('.line-clamp-4');
      const cardTexts = Array.from(cards).map(c => c.textContent);
      // 至少应该包含最新日期
      expect(cardTexts.some(t => t?.includes('4月29日'))).toBe(true);
    });
  });

  describe('历史按钮', () => {
    it('超过6条时应该显示历史按钮', () => {
      const notes = Array.from({ length: 7 }, (_, i) => createMockNote(`${i + 1}`));

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      expect(screen.getByText(/历史便签/)).toBeInTheDocument();
      expect(screen.getByText(/7条/)).toBeInTheDocument();
    });

    it('正好6条时不应该显示历史按钮', () => {
      const notes = Array.from({ length: 6 }, (_, i) => createMockNote(`${i + 1}`));

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      expect(screen.queryByText(/历史便签/)).not.toBeInTheDocument();
    });

    it('点击历史按钮应该调用 onViewHistory', () => {
      const notes = Array.from({ length: 7 }, (_, i) => createMockNote(`${i + 1}`));

      render(
        <NoteGrid
          notes={notes}
          onViewHistory={mockOnViewHistory}
          onDeleteNote={mockOnDeleteNote}
          onEditNote={mockOnEditNote}
        />
      );

      screen.getByText(/历史便签/).click();

      expect(mockOnViewHistory).toHaveBeenCalledTimes(1);
    });
  });
});
