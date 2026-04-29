import { render, screen } from '@testing-library/react';

import MoodBarChart from '@/components/notes/MoodBarChart';
import type { MoodCount } from '@/types/moodReport';

describe('MoodBarChart', () => {
  const mockMoodCounts: MoodCount[] = [
    { mood: 'happy', count: 5, percentage: 50 },
    { mood: 'calm', count: 3, percentage: 30 },
    { mood: 'excited', count: 2, percentage: 20 },
  ];

  it('应该渲染所有情绪条', () => {
    render(<MoodBarChart moodCounts={mockMoodCounts} />);

    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('😌')).toBeInTheDocument();
    expect(screen.getByText('🤩')).toBeInTheDocument();
  });

  it('应该显示情绪标签', () => {
    render(<MoodBarChart moodCounts={mockMoodCounts} />);

    expect(screen.getByText('开心')).toBeInTheDocument();
    expect(screen.getByText('平静')).toBeInTheDocument();
    expect(screen.getByText('兴奋')).toBeInTheDocument();
  });

  it('应该显示百分比', () => {
    render(<MoodBarChart moodCounts={mockMoodCounts} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('应该显示计数', () => {
    render(<MoodBarChart moodCounts={mockMoodCounts} />);

    expect(screen.getByText('(5)')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('空数据时应该不渲染条形', () => {
    render(<MoodBarChart moodCounts={[]} />);

    // 无 emoji 渲染
    const emojis = document.querySelectorAll('.text-xl');
    expect(emojis).toHaveLength(0);
  });

  it('应该使用自定义 maxPercentage 计算条形宽度', () => {
    const counts: MoodCount[] = [{ mood: 'happy', count: 5, percentage: 50 }];
    const { container } = render(<MoodBarChart moodCounts={counts} maxPercentage={100} />);

    const bar = container.querySelector('.rounded-full');
    expect(bar).toBeInTheDocument();
  });
});
