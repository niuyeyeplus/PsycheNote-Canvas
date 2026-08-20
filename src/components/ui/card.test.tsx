import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

describe('Card', () => {
  it('应该渲染完整的卡片结构', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>标题</CardTitle>
          <CardDescription>描述</CardDescription>
        </CardHeader>
        <CardContent>内容</CardContent>
        <CardFooter>底部</CardFooter>
      </Card>
    );

    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('描述')).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
    expect(screen.getByText('底部')).toBeInTheDocument();
  });

  it('CardTitle 应该渲染为 h3', () => {
    render(<CardTitle>标题</CardTitle>);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('标题');
  });

  it('应该合并自定义 className 与默认样式', () => {
    render(<Card className="custom-class">内容</Card>);

    const card = screen.getByText('内容');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-lg');
  });

  it('应该透传额外的 DOM 属性', () => {
    render(<CardContent data-testid="content-node">内容</CardContent>);

    expect(screen.getByTestId('content-node')).toBeInTheDocument();
  });

  it('所有子组件都应该转发 ref', () => {
    const cardRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLDivElement>();
    const titleRef = createRef<HTMLParagraphElement>();
    const descriptionRef = createRef<HTMLParagraphElement>();
    const contentRef = createRef<HTMLDivElement>();
    const footerRef = createRef<HTMLDivElement>();

    render(
      <Card ref={cardRef}>
        <CardHeader ref={headerRef}>
          <CardTitle ref={titleRef}>标题</CardTitle>
          <CardDescription ref={descriptionRef}>描述</CardDescription>
        </CardHeader>
        <CardContent ref={contentRef}>内容</CardContent>
        <CardFooter ref={footerRef}>底部</CardFooter>
      </Card>
    );

    expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
    expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
    expect(descriptionRef.current).toBeInstanceOf(HTMLParagraphElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('所有子组件都应该设置 displayName', () => {
    expect(Card.displayName).toBe('Card');
    expect(CardHeader.displayName).toBe('CardHeader');
    expect(CardTitle.displayName).toBe('CardTitle');
    expect(CardDescription.displayName).toBe('CardDescription');
    expect(CardContent.displayName).toBe('CardContent');
    expect(CardFooter.displayName).toBe('CardFooter');
  });
});
