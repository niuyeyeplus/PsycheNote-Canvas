import { render, screen } from '@testing-library/react';

import MoodBackground from '@/components/MoodBackground';
import type { Mood } from '@/types/mood';

describe('MoodBackground', () => {
  const moods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

  const TestChild = () => <div data-testid="test-child">Test Content</div>;

  describe('渲染', () => {
    it('应该渲染子组件', () => {
      render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('应该包含相对定位和最小高度', () => {
      const { container } = render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('relative');
      expect(div).toHaveClass('min-h-screen');
    });

    it('应该应用过渡动画类', () => {
      const { container } = render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('transition-all');
      expect(div).toHaveClass('duration-1000');
    });
  });

  describe('情绪背景类名', () => {
    it.each(moods as Mood[])('mood-bg-%s 应该被应用', mood => {
      const { container } = render(
        <MoodBackground mood={mood}>
          <TestChild />
        </MoodBackground>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass(`mood-bg-${mood}`);
    });
  });

  describe('calm 情绪粒子', () => {
    it('calm 情绪应该渲染 calm-dot 粒子', () => {
      const { container } = render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      const dots = container.querySelectorAll('.calm-dot');
      expect(dots.length).toBeGreaterThan(0);
    });

    it('calm 情绪不应该有云朵', () => {
      const { container } = render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      const clouds = container.querySelectorAll('.happy-cloud');
      expect(clouds.length).toBe(0);
    });
  });

  describe('happy 情绪动画', () => {
    it('happy 情绪应该渲染云朵', () => {
      const { container } = render(
        <MoodBackground mood="happy">
          <TestChild />
        </MoodBackground>
      );

      const clouds = container.querySelectorAll('.happy-cloud');
      expect(clouds.length).toBeGreaterThan(0);
    });

    it('happy 情绪应该渲染太阳', () => {
      const { container } = render(
        <MoodBackground mood="happy">
          <TestChild />
        </MoodBackground>
      );

      const sun = container.querySelectorAll('.happy-sun');
      expect(sun.length).toBe(1);
    });
  });

  describe('excited 情绪动画', () => {
    it('excited 情绪应该渲染火焰粒子', () => {
      const { container } = render(
        <MoodBackground mood="excited">
          <TestChild />
        </MoodBackground>
      );

      const flames = container.querySelectorAll('.excited-flame');
      expect(flames.length).toBeGreaterThan(0);
    });
  });

  describe('unhappy 情绪动画', () => {
    it('unhappy 情绪应该渲染乌云', () => {
      const { container } = render(
        <MoodBackground mood="unhappy">
          <TestChild />
        </MoodBackground>
      );

      const clouds = container.querySelectorAll('.unhappy-cloud');
      expect(clouds.length).toBeGreaterThan(0);
    });
  });

  describe('anxious 情绪动画', () => {
    it('anxious 情绪应该渲染焦虑短语', () => {
      const { container } = render(
        <MoodBackground mood="anxious">
          <TestChild />
        </MoodBackground>
      );

      const phrases = container.querySelectorAll('.anxious-phrase');
      expect(phrases.length).toBeGreaterThan(0);
    });
  });

  describe('子元素层级', () => {
    it('子元素应该在 z-10 层', () => {
      render(
        <MoodBackground mood="calm">
          <TestChild />
        </MoodBackground>
      );

      const childContainer = screen.getByTestId('test-child').parentElement;
      expect(childContainer).toHaveClass('relative');
      expect(childContainer).toHaveClass('z-10');
    });
  });
});
