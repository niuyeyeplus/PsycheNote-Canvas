import { render, screen } from '@testing-library/react';

import NoteCard from '@/components/notes/NoteCard';
import type { Note } from '@/types/note';

describe('NoteCard', () => {
  const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: 'test-id',
    content: '测试便签内容',
    mood: 'happy',
    createdAt: '2026-04-29T10:30:00.000Z',
    ...overrides,
  });

  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该显示便签内容', () => {
      const note = createMockNote({ content: '这是一条测试便签' });

      render(<NoteCard note={note} />);

      expect(screen.getByText('这是一条测试便签')).toBeInTheDocument();
    });

    it('应该显示情绪标签', () => {
      const note = createMockNote({ mood: 'excited' });

      render(<NoteCard note={note} />);

      expect(screen.getByText('兴奋')).toBeInTheDocument();
    });

    it('应该显示情绪 emoji', () => {
      const note = createMockNote({ mood: 'anxious' });

      render(<NoteCard note={note} />);

      expect(screen.getByText('😰')).toBeInTheDocument();
    });

    it('应该格式化日期显示', () => {
      const note = createMockNote({ createdAt: '2026-04-29T10:30:00.000Z' });

      render(<NoteCard note={note} />);

      // 应该显示 4月29日 10:30 格式
      expect(screen.getByText(/4月29日/)).toBeInTheDocument();
    });

    it('所有5种情绪都应该正确显示', () => {
      const moods: Note['mood'][] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];
      const labels = ['平静', '开心', '不开心', '焦虑', '兴奋'];

      moods.forEach((mood, index) => {
        const note = createMockNote({ id: `note-${mood}`, mood });
        const { container } = render(<NoteCard note={note} />);
        expect(container.textContent).toContain(labels[index]);
      });
    });
  });

  describe('交互', () => {
    it('点击卡片应该调用 onEdit', () => {
      const note = createMockNote();
      render(<NoteCard note={note} onEdit={mockOnEdit} />);

      screen.getByText('测试便签内容').click();

      expect(mockOnEdit).toHaveBeenCalledWith(note);
    });

    it('没有 onEdit 时点击不应该报错', () => {
      const note = createMockNote();

      render(<NoteCard note={note} />);

      expect(() => screen.getByText('测试便签内容').click()).not.toThrow();
    });

    it('有 onDelete 时应该显示删除按钮', () => {
      const note = createMockNote();
      render(<NoteCard note={note} onDelete={mockOnDelete} />);

      // 删除按钮在 hover 时显示，需要通过 container 查询
      const deleteButtons = document.querySelectorAll('button');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('点击删除按钮应该调用 onDelete', () => {
      const note = createMockNote();
      render(<NoteCard note={note} onDelete={mockOnDelete} />);

      const deleteBtn = document.querySelector('button');
      deleteBtn?.click();

      expect(mockOnDelete).toHaveBeenCalledWith('test-id');
    });

    it('删除按钮点击应该阻止冒泡', () => {
      const note = createMockNote();
      const editSpy = jest.fn();
      render(<NoteCard note={note} onDelete={mockOnDelete} onEdit={editSpy} />);

      // 删除按钮在 group 内，点击删除按钮会触发冒泡到卡片
      const deleteBtn = document.querySelector('button');
      deleteBtn?.click();

      // 如果冒泡了，edit 也会被调用，但实际上不应该
      expect(editSpy).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('长内容应该被截断', () => {
      const longContent =
        '这是一条非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的便签内容';
      const note = createMockNote({ content: longContent });

      render(<NoteCard note={note} />);

      const content = screen.getByText(longContent);
      expect(content).toHaveClass('line-clamp-4');
    });

    it('空内容应该正常显示', () => {
      const note = createMockNote({ content: '' });

      render(<NoteCard note={note} />);

      // 空字符串也会渲染，只是看不见
      expect(document.querySelector('.line-clamp-4')).toBeInTheDocument();
    });

    it('特殊日期格式应该被处理', () => {
      const note = createMockNote({ createdAt: 'invalid-date' });

      // 不应该崩溃
      expect(() => render(<NoteCard note={note} />)).not.toThrow();
    });
  });
});
