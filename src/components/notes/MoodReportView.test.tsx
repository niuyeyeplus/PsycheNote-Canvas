import { render, screen } from '@testing-library/react';

import MoodReportView from '@/components/notes/MoodReportView';
import type { WeekComparison } from '@/types/moodReport';

describe('MoodReportView', () => {
  const createMockComparison = (overrides: Partial<WeekComparison> = {}): WeekComparison => {
    const defaultComparison: WeekComparison = {
      currentWeek: {
        weekLabel: '2026年4月第18周',
        weekStart: new Date('2026-04-27'),
        moodCounts: [
          { mood: 'happy', count: 5, percentage: 50 },
          { mood: 'calm', count: 3, percentage: 30 },
          { mood: 'excited', count: 2, percentage: 20 },
        ],
        totalNotes: 10,
        primaryMood: 'happy',
        summary: '开心是你本周的主旋律！50%的记录都是开心时刻，继续保持这份快乐吧！',
      },
      previousWeek: null,
      moodChange: { calm: 0, happy: 0, unhappy: 0, anxious: 0, excited: 0 },
    };

    if (overrides.currentWeek) {
      Object.assign(defaultComparison.currentWeek, overrides.currentWeek);
    }
    if (overrides.previousWeek !== undefined) {
      defaultComparison.previousWeek = overrides.previousWeek as WeekComparison['previousWeek'];
    }
    if (overrides.moodChange) {
      Object.assign(defaultComparison.moodChange, overrides.moodChange);
    }

    return defaultComparison;
  };

  describe('渲染状态', () => {
    it('null comparison 应该显示空状态消息', () => {
      render(<MoodReportView comparison={null} />);

      expect(screen.getByText(/本周还没有记录/)).toBeInTheDocument();
      expect(screen.getByText(/开始记录你的心情/)).toBeInTheDocument();
    });

    it('isLoading 应该显示加载状态', () => {
      render(<MoodReportView comparison={null} isLoading />);

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  describe('正常数据渲染', () => {
    it('应该显示周标签', () => {
      const comparison = createMockComparison();
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText('2026年4月第18周')).toBeInTheDocument();
    });

    it('应该显示总记录数', () => {
      const comparison = createMockComparison();
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText('共 10 条记录')).toBeInTheDocument();
    });

    it('应该显示情绪分布标题', () => {
      const comparison = createMockComparison();
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText('情绪分布')).toBeInTheDocument();
    });

    it('应该显示本周总结', () => {
      const comparison = createMockComparison();
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText(/开心是你本周的主旋律/)).toBeInTheDocument();
    });
  });

  describe('周对比', () => {
    it('没有上周数据时不应该显示对比区域', () => {
      const comparison = createMockComparison({ previousWeek: null });
      render(<MoodReportView comparison={comparison} />);

      expect(screen.queryByText('与上周对比')).not.toBeInTheDocument();
    });

    it('有上周数据时应该显示对比区域', () => {
      const comparison = createMockComparison({
        previousWeek: {
          weekLabel: '2026年4月第17周',
          weekStart: new Date('2026-04-20'),
          moodCounts: [{ mood: 'happy', count: 3, percentage: 30 }],
          totalNotes: 10,
          primaryMood: 'happy',
          summary: '上周总结',
        },
      });
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText('与上周对比')).toBeInTheDocument();
    });

    it('应该显示正变化为绿色', () => {
      const comparison = createMockComparison({
        previousWeek: {
          weekLabel: '2026年4月第17周',
          weekStart: new Date('2026-04-20'),
          moodCounts: [{ mood: 'happy', count: 3, percentage: 30 }],
          totalNotes: 10,
          primaryMood: 'happy',
          summary: '上周总结',
        },
        moodChange: { calm: 0, happy: 20, unhappy: 0, anxious: 0, excited: 0 },
      });
      render(<MoodReportView comparison={comparison} />);

      const happyChange = screen.getByText('+20%');
      expect(happyChange).toHaveClass('text-green-500');
    });

    it('应该显示负变化为红色', () => {
      const comparison = createMockComparison({
        previousWeek: {
          weekLabel: '2026年4月第17周',
          weekStart: new Date('2026-04-20'),
          moodCounts: [{ mood: 'happy', count: 7, percentage: 70 }],
          totalNotes: 10,
          primaryMood: 'happy',
          summary: '上周总结',
        },
        moodChange: { calm: 0, happy: -20, unhappy: 0, anxious: 0, excited: 0 },
      });
      render(<MoodReportView comparison={comparison} />);

      const happyChange = screen.getByText('-20%');
      expect(happyChange).toHaveClass('text-red-400');
    });
  });

  describe('边界情况', () => {
    it('空 moodCounts 应该显示暂无数据', () => {
      const comparison = createMockComparison({
        currentWeek: {
          weekLabel: '2026年4月第18周',
          weekStart: new Date('2026-04-27'),
          moodCounts: [],
          totalNotes: 0,
          primaryMood: null,
          summary: '本周还没有记录哦，开始记录你的心情吧！',
        },
      });
      render(<MoodReportView comparison={comparison} />);

      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });
  });
});
