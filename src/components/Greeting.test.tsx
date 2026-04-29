import { render, screen } from '@testing-library/react';

import Greeting from '@/components/Greeting';

describe('Greeting', () => {
  it('应该渲染带有名字的问候语', () => {
    render(<Greeting name="小明" />);
    expect(screen.getByText('Hello, 小明!')).toBeInTheDocument();
  });

  it('应该正确处理空名字', () => {
    render(<Greeting name="" />);
    expect(screen.getByText('Hello, !')).toBeInTheDocument();
  });

  it('应该正确处理中文名字', () => {
    render(<Greeting name="张三" />);
    expect(screen.getByText('Hello, 张三!')).toBeInTheDocument();
  });

  it('应该正确处理英文名字', () => {
    render(<Greeting name="John" />);
    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
  });

  it('应该处理特殊字符名字', () => {
    render(<Greeting name="张三-李四" />);
    expect(screen.getByText('Hello, 张三-李四!')).toBeInTheDocument();
  });
});
