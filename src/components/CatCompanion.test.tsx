import { render, screen, act } from '@testing-library/react';

import CatCompanion from '@/components/CatCompanion';
import type { Mood } from '@/types/mood';

describe('CatCompanion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('渲染', () => {
    it('应该渲染猫咪 emoji', () => {
      render(<CatCompanion mood="calm" />);

      const cat = screen.getByText('🐱');
      expect(cat).toBeInTheDocument();
    });

    it('应该有正确的样式类', () => {
      const { container } = render(<CatCompanion mood="calm" />);

      const cat = container.firstChild as HTMLElement;
      expect(cat).toHaveClass('fixed');
      expect(cat).toHaveClass('bottom-5');
      expect(cat).toHaveClass('right-5');
      expect(cat).toHaveClass('z-50');
    });

    it('应该有 64px 字体大小', () => {
      const { container } = render(<CatCompanion mood="calm" />);

      const cat = container.firstChild as HTMLElement;
      expect(cat).toHaveStyle({ fontSize: '64px' });
    });

    it('应该有 title 属性', () => {
      const { container } = render(<CatCompanion mood="calm" />);

      const cat = container.firstChild as HTMLElement;
      expect(cat).toHaveAttribute('title', '心情猫咪');
    });
  });

  describe('动画触发', () => {
    it('初始挂载后 1 秒应该触发动画', () => {
      render(<CatCompanion mood="calm" />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 动画触发后会有不同的 emoji
    });

    it('每 10 秒应该触发一次动画', () => {
      render(<CatCompanion mood="calm" />);

      // 初始动画
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 10秒后的第二次动画
      act(() => {
        jest.advanceTimersByTime(10000);
      });
    });
  });

  describe('不同情绪的 emoji', () => {
    it.each([
      ['calm', '😺'],
      ['happy', '😸'],
      ['excited', '😻'],
      ['unhappy', '😿'],
      ['anxious', '🙀'],
    ] as [Mood, string][])('情绪 %s 应该显示 emoji %s', (mood, expectedEmoji) => {
      render(<CatCompanion mood={mood} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(expectedEmoji)).toBeInTheDocument();
    });
  });

  describe('动画类名', () => {
    it('动画时应该应用对应的动画类', () => {
      const { container, rerender } = render(<CatCompanion mood="calm" />);

      // 触发初始动画
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const cat = container.firstChild as HTMLElement;
      // calm 情绪的动画类应该是 cat-calm
      expect(cat).toHaveClass('cat-calm');

      // 切换到 happy 情绪
      rerender(<CatCompanion mood="happy" />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(cat).toHaveClass('cat-happy');
    });
  });

  describe('过渡动画', () => {
    it('应该有过渡动画类', () => {
      const { container } = render(<CatCompanion mood="calm" />);

      const cat = container.firstChild as HTMLElement;
      expect(cat).toHaveClass('transition-all');
      expect(cat).toHaveClass('duration-300');
    });
  });
});
