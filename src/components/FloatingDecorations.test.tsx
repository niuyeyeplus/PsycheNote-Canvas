import { render, screen } from '@testing-library/react';

import FloatingDecorations from '@/components/FloatingDecorations';

describe('FloatingDecorations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染装饰元素容器', () => {
    const { container } = render(<FloatingDecorations />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该包含正确的 CSS 类', () => {
    const { container } = render(<FloatingDecorations />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('fixed');
    expect(div).toHaveClass('inset-0');
    expect(div).toHaveClass('pointer-events-none');
    expect(div).toHaveClass('overflow-hidden');
    expect(div).toHaveClass('z-0');
  });

  it('应该包含 emoji 装饰物', () => {
    render(<FloatingDecorations />);

    const emojis = ['✈️', '⭐', '💫', '🎈', '🎀', '🌈', '💭', '🎯', '✨', '🌸', '🎶', '🦋'];
    emojis.forEach(emoji => {
      expect(screen.getAllByText(emoji).length).toBeGreaterThan(0);
    });
  });

  it('应该渲染多个装饰元素', () => {
    const { container } = render(<FloatingDecorations />);
    const decorations = container.querySelectorAll('.float-decoration');
    expect(decorations.length).toBeGreaterThan(10);
  });

  it('应该有 float-decoration 类名', () => {
    const { container } = render(<FloatingDecorations />);
    const decorations = container.querySelectorAll('.float-decoration');
    decorations.forEach(dec => {
      expect(dec).toHaveClass('float-decoration');
    });
  });

  it('装饰物应该从不同位置升起', () => {
    const { container } = render(<FloatingDecorations />);
    const decorations = container.querySelectorAll('.float-decoration');
    const leftPositions = new Set<string>();
    decorations.forEach(dec => {
      const style = window.getComputedStyle(dec as HTMLElement);
      leftPositions.add(style.left);
    });
    expect(leftPositions.size).toBeGreaterThan(5);
  });
});
