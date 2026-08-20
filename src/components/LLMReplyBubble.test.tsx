import { act, render, screen } from '@testing-library/react';

import LLMReplyBubble from '@/components/LLMReplyBubble';
import type { Mood } from '@/types/mood';

describe('LLMReplyBubble', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染', () => {
    it('不可见且没有文本时不应该渲染', () => {
      const { container } = render(
        <LLMReplyBubble replyText="" mood={null} isVisible={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('可见时应该渲染气泡', () => {
      render(<LLMReplyBubble replyText="" mood={null} isVisible onClose={mockOnClose} />);

      expect(document.querySelector('.cloud-bubble')).toBeInTheDocument();
    });

    it('没有回复文本时应该显示省略号占位', () => {
      render(<LLMReplyBubble replyText="" mood={null} isVisible onClose={mockOnClose} />);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('应该显示回复文本', () => {
      render(
        <LLMReplyBubble replyText="今天也要好好休息" mood={null} isVisible onClose={mockOnClose} />
      );

      expect(screen.getByText(/今天也要好好休息/)).toBeInTheDocument();
    });

    it('没有情绪时不应该显示情绪标签', () => {
      render(<LLMReplyBubble replyText="回复" mood={null} isVisible onClose={mockOnClose} />);

      expect(screen.queryByText('平静')).not.toBeInTheDocument();
    });

    it('所有5种情绪都应该显示对应的中文标签', () => {
      const cases: Array<[Mood, string]> = [
        ['calm', '平静'],
        ['happy', '开心'],
        ['unhappy', '不开心'],
        ['anxious', '焦虑'],
        ['excited', '兴奋'],
      ];

      cases.forEach(([mood, label]) => {
        const { container, unmount } = render(
          <LLMReplyBubble replyText="回复" mood={mood} isVisible onClose={mockOnClose} />
        );

        expect(container.textContent).toContain(label);
        unmount();
      });
    });
  });

  describe('交互', () => {
    it('点击关闭按钮应该调用 onClose', () => {
      render(<LLMReplyBubble replyText="回复" mood="calm" isVisible onClose={mockOnClose} />);

      const closeBtn = screen.getByRole('button');
      closeBtn.click();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('动画', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('显示时应该添加弹出动画类，500ms 后移除', () => {
      render(<LLMReplyBubble replyText="" mood={null} isVisible onClose={mockOnClose} />);

      expect(document.querySelector('.animate-bubble-pop')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(document.querySelector('.animate-bubble-pop')).not.toBeInTheDocument();
    });
  });

  describe('流式文本', () => {
    it('文本变长时应该更新显示内容', () => {
      const { rerender } = render(
        <LLMReplyBubble replyText="你好" mood={null} isVisible onClose={mockOnClose} />
      );

      rerender(
        <LLMReplyBubble replyText="你好呀，今天" mood={null} isVisible onClose={mockOnClose} />
      );

      expect(screen.getByText(/你好呀，今天/)).toBeInTheDocument();
    });

    it('文本变短时应该保留已显示的内容', () => {
      const { rerender } = render(
        <LLMReplyBubble replyText="完整的回复内容" mood={null} isVisible onClose={mockOnClose} />
      );

      rerender(<LLMReplyBubble replyText="完整" mood={null} isVisible onClose={mockOnClose} />);

      expect(screen.getByText(/完整的回复内容/)).toBeInTheDocument();
    });

    it('不可见时不应该更新文本', () => {
      const { rerender } = render(
        <LLMReplyBubble replyText="" mood={null} isVisible={false} onClose={mockOnClose} />
      );

      rerender(
        <LLMReplyBubble replyText="新文本" mood={null} isVisible={false} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/新文本/)).not.toBeInTheDocument();
    });

    it('流式结束（文本完整）时应该显示装饰符号', () => {
      render(<LLMReplyBubble replyText="回复完成" mood={null} isVisible onClose={mockOnClose} />);

      expect(screen.getByText('✿')).toBeInTheDocument();
    });

    it('从可见切换为不可见时应该保留已有文本', () => {
      const { rerender } = render(
        <LLMReplyBubble replyText="已有回复" mood={null} isVisible onClose={mockOnClose} />
      );

      rerender(
        <LLMReplyBubble replyText="已有回复" mood={null} isVisible={false} onClose={mockOnClose} />
      );

      expect(screen.getByText(/已有回复/)).toBeInTheDocument();
    });
  });
});
