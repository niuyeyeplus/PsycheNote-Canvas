import RootLayout, { metadata } from '@/app/layout';

describe('RootLayout', () => {
  it('应该导出页面 metadata', () => {
    expect(metadata.title).toBe('PsycheNote Canvas');
    expect(metadata.description).toContain('情绪气象站');
  });

  it('应该以 zh-CN 语言渲染 html 与 body，并包含 children', () => {
    const element = RootLayout({ children: <div>子节点</div> });

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('zh-CN');

    const body = element.props.children;
    expect(body.type).toBe('body');
    expect(body.props.children).toEqual(<div>子节点</div>);
  });
});
