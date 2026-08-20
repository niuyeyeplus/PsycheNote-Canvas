import { fireEvent, render, screen } from '@testing-library/react';

import HistoryModal from '@/components/notes/HistoryModal';
import type { Note } from '@/types/note';

describe('HistoryModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  // 2026-04-29 是周三，2026-04-22 属于上一周
  const createNote = (overrides: Partial<Note> = {}): Note => ({
    id: 'note-1',
    content: '本周的便签',
    mood: 'happy',
    createdAt: '2026-04-29T10:30:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该显示标题和两个 Tab', () => {
      render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      expect(screen.getAllByText('历史便签').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('本周报告')).toBeInTheDocument();
    });

    it('没有便签时应该显示空状态', () => {
      render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      expect(screen.getByText('暂无历史便签')).toBeInTheDocument();
    });

    it('应该显示最近一周的便签内容和周标签', () => {
      render(
        <HistoryModal notes={[createNote({ content: '开心的一天' })]} onClose={mockOnClose} />
      );

      expect(screen.getByText('开心的一天')).toBeInTheDocument();
      expect(screen.getByText(/年.*月第.*周/)).toBeInTheDocument();
    });

    it('只应该显示最新一周的便签', () => {
      const notes = [
        createNote({ id: 'old', content: '上周的便签', createdAt: '2026-04-22T10:00:00.000Z' }),
        createNote({ id: 'new', content: '本周的便签', createdAt: '2026-04-29T10:00:00.000Z' }),
      ];

      render(<HistoryModal notes={notes} onClose={mockOnClose} />);

      expect(screen.getByText('本周的便签')).toBeInTheDocument();
      expect(screen.queryByText('上周的便签')).not.toBeInTheDocument();
    });

    it('同一周的多条便签应该全部显示', () => {
      const notes = [
        createNote({ id: 'a', content: '便签A', createdAt: '2026-04-28T10:00:00.000Z' }),
        createNote({ id: 'b', content: '便签B', createdAt: '2026-04-29T10:00:00.000Z' }),
      ];

      render(<HistoryModal notes={notes} onClose={mockOnClose} />);

      expect(screen.getByText('便签A')).toBeInTheDocument();
      expect(screen.getByText('便签B')).toBeInTheDocument();
    });
  });

  describe('Tab 切换', () => {
    it('切换到本周报告应该显示报告内容', () => {
      render(<HistoryModal notes={[createNote({ mood: 'happy' })]} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('本周报告'));

      expect(screen.getByText('情绪分布')).toBeInTheDocument();
      expect(screen.getByText('共 1 条记录')).toBeInTheDocument();
    });

    it('没有便签时报告 Tab 应该显示空报告提示', () => {
      render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('本周报告'));

      expect(screen.getByText('本周还没有记录')).toBeInTheDocument();
    });

    it('有上一周数据时报告应该显示周对比', () => {
      const notes = [
        createNote({ id: 'old', mood: 'unhappy', createdAt: '2026-04-22T10:00:00.000Z' }),
        createNote({ id: 'new', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' }),
      ];

      render(<HistoryModal notes={notes} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('本周报告'));

      expect(screen.getByText('与上周对比')).toBeInTheDocument();
    });

    it('切回历史便签 Tab 应该重新显示便签列表', () => {
      render(<HistoryModal notes={[createNote({ content: '我的便签' })]} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('本周报告'));
      expect(screen.queryByText('我的便签')).not.toBeInTheDocument();

      const historyTab = screen.getAllByText('历史便签')[1];
      fireEvent.click(historyTab);

      expect(screen.getByText('我的便签')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击遮罩层应该调用 onClose', () => {
      const { container } = render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      fireEvent.click(container.firstChild as HTMLElement);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('点击弹窗内容不应该调用 onClose', () => {
      render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('暂无历史便签'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('点击关闭按钮应该调用 onClose', () => {
      render(<HistoryModal notes={[]} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('✕'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('删除便签应该透传 onDeleteNote', () => {
      render(
        <HistoryModal
          notes={[createNote({ id: 'to-delete' })]}
          onClose={mockOnClose}
          onDeleteNote={mockOnDelete}
        />
      );

      // 第一个 ✕ 是弹窗关闭按钮，第二个是便签卡片的删除按钮
      fireEvent.click(screen.getAllByText('✕')[1]);

      expect(mockOnDelete).toHaveBeenCalledWith('to-delete');
    });

    it('点击便签应该透传 onEditNote', () => {
      const note = createNote({ content: '待编辑' });

      render(<HistoryModal notes={[note]} onClose={mockOnClose} onEditNote={mockOnEdit} />);

      fireEvent.click(screen.getByText('待编辑'));

      expect(mockOnEdit).toHaveBeenCalledWith(note);
    });
  });
});
