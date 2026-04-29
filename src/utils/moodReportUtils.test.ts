import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';
import {
  getWeekStart,
  formatWeekLabel,
  calculateMoodCounts,
  getWeekReport,
  compareWeeks,
  type WeekGroup,
} from '@/utils/moodReportUtils';

describe('moodReportUtils', () => {
  describe('getWeekStart', () => {
    it('应该返回周一作为周开始', () => {
      // 2026年4月29日是周三
      const date = new Date('2026-04-29T12:00:00');
      const weekStart = getWeekStart(date);

      expect(weekStart.getDay()).toBe(1); // 周一
      expect(weekStart.getDate()).toBe(27); // 4月27日是周一
    });

    it('周日应该返回上周一', () => {
      // 2026年4月26日是周日
      const date = new Date('2026-04-26T12:00:00');
      const weekStart = getWeekStart(date);

      expect(weekStart.getDay()).toBe(1);
      expect(weekStart.getDate()).toBe(20); // 4月20日是周一
    });

    it('周一应该返回当天', () => {
      const date = new Date('2026-04-27T12:00:00');
      const weekStart = getWeekStart(date);

      expect(weekStart.getDay()).toBe(1);
      expect(weekStart.getDate()).toBe(27);
    });
  });

  describe('formatWeekLabel', () => {
    it('应该格式化为年/月/第N周', () => {
      const weekStart = new Date('2026-04-27');
      const label = formatWeekLabel(weekStart);

      expect(label).toContain('2026年');
      expect(label).toContain('月');
      expect(label).toContain('周');
    });
  });

  describe('calculateMoodCounts', () => {
    const createNote = (mood: Mood, createdAt: string): Note => ({
      id: `note-${Math.random()}`,
      content: 'test',
      mood,
      createdAt,
    });

    it('应该计算空数组返回空结果', () => {
      const result = calculateMoodCounts([]);
      expect(result).toEqual([]);
    });

    it('应该正确计算单种情绪', () => {
      const notes: Note[] = [
        createNote('happy', '2026-04-29T10:00:00'),
        createNote('happy', '2026-04-29T11:00:00'),
        createNote('happy', '2026-04-29T12:00:00'),
      ];

      const result = calculateMoodCounts(notes);

      expect(result).toHaveLength(1);
      expect(result[0].mood).toBe('happy');
      expect(result[0].count).toBe(3);
      expect(result[0].percentage).toBe(100);
    });

    it('应该正确计算多种情绪及百分比', () => {
      const notes: Note[] = [
        createNote('happy', '2026-04-29T10:00:00'),
        createNote('happy', '2026-04-29T11:00:00'),
        createNote('calm', '2026-04-29T12:00:00'),
        createNote('calm', '2026-04-29T13:00:00'),
      ];

      const result = calculateMoodCounts(notes);

      expect(result).toHaveLength(2);
      const happyMood = result.find(r => r.mood === 'happy');
      const calmMood = result.find(r => r.mood === 'calm');
      expect(happyMood?.count).toBe(2);
      expect(happyMood?.percentage).toBe(50);
      expect(calmMood?.count).toBe(2);
      expect(calmMood?.percentage).toBe(50);
    });

    it('应该四舍五入百分比', () => {
      const notes: Note[] = [
        createNote('happy', '2026-04-29T10:00:00'),
        createNote('calm', '2026-04-29T11:00:00'),
        createNote('excited', '2026-04-29T12:00:00'),
      ];

      const result = calculateMoodCounts(notes);

      expect(result).toHaveLength(3);
      result.forEach(r => {
        expect(r.percentage).toBe(33); // 33.33... 四舍五入
      });
    });

    it('应该过滤掉计数为0的情绪', () => {
      const notes: Note[] = [createNote('happy', '2026-04-29T10:00:00')];

      const result = calculateMoodCounts(notes);

      expect(result).toHaveLength(1);
      expect(result[0].mood).toBe('happy');
    });
  });

  describe('getWeekReport', () => {
    const createWeekGroup = (mood: Mood, count: number): WeekGroup => {
      const notes: Note[] = Array.from({ length: count }, (_, i) => ({
        id: `note-${i}`,
        content: 'test',
        mood,
        createdAt: '2026-04-29T10:00:00',
      }));

      return {
        label: '2026年4月第18周',
        notes,
        weekStart: new Date('2026-04-27'),
      };
    };

    it('应该生成正确的周报告', () => {
      const weekGroup = createWeekGroup('happy', 3);

      const report = getWeekReport(weekGroup);

      expect(report.weekLabel).toBe('2026年4月第18周');
      expect(report.totalNotes).toBe(3);
      expect(report.primaryMood).toBe('happy');
      expect(report.moodCounts).toHaveLength(1);
    });

    it('空周应该返回空报告', () => {
      const emptyGroup: WeekGroup = {
        label: '2026年4月第18周',
        notes: [],
        weekStart: new Date('2026-04-27'),
      };

      const report = getWeekReport(emptyGroup);

      expect(report.totalNotes).toBe(0);
      expect(report.primaryMood).toBeNull();
      expect(report.moodCounts).toEqual([]);
      expect(report.summary).toContain('还没有记录');
    });

    it('应该生成正确的总结文字', () => {
      const weekGroup = createWeekGroup('excited', 5);

      const report = getWeekReport(weekGroup);

      expect(report.summary).toContain('兴奋');
      expect(report.summary).toContain('100%');
    });
  });

  describe('compareWeeks', () => {
    const createReport = (
      moodCounts: { mood: Mood; count: number; percentage: number }[],
      label: string
    ) => ({
      weekLabel: label,
      weekStart: new Date(),
      moodCounts,
      totalNotes: moodCounts.reduce((sum, m) => sum + m.count, 0),
      primaryMood: moodCounts.length > 0 ? moodCounts[0].mood : null,
      summary: 'test summary',
    });

    it('没有上周数据时返回null previousWeek', () => {
      const current = createReport([{ mood: 'happy', count: 3, percentage: 100 }], '本周');
      const result = compareWeeks(current, null);

      expect(result.previousWeek).toBeNull();
      expect(result.currentWeek).toBe(current);
    });

    it('应该计算情绪变化', () => {
      const current = createReport(
        [
          { mood: 'happy', count: 6, percentage: 60 },
          { mood: 'calm', count: 4, percentage: 40 },
        ],
        '本周'
      );
      const previous = createReport(
        [
          { mood: 'happy', count: 4, percentage: 50 },
          { mood: 'calm', count: 4, percentage: 50 },
        ],
        '上周'
      );

      const result = compareWeeks(current, previous);

      expect(result.moodChange.happy).toBe(10); // 60 - 50
      expect(result.moodChange.calm).toBe(-10); // 40 - 50
    });

    it('新增情绪应该有正确的变化值', () => {
      const current = createReport([{ mood: 'excited', count: 5, percentage: 100 }], '本周');
      const previous = createReport([], '上周');

      const result = compareWeeks(current, previous);

      expect(result.moodChange.excited).toBe(100);
    });

    it('消失的情绪应该有负的变化值', () => {
      const current = createReport([], '本周');
      const previous = createReport([{ mood: 'unhappy', count: 5, percentage: 100 }], '上周');

      const result = compareWeeks(current, previous);

      expect(result.moodChange.unhappy).toBe(-100);
    });
  });
});
