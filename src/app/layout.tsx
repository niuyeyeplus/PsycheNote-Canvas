import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'PsycheNote Canvas',
  description: '情绪气象站 - 情绪数据长期积累和洞察',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="zh-CN">
    <body>{children}</body>
  </html>
);

export default RootLayout;
