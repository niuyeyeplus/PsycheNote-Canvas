/**
 * 情绪报告工具函数
 * 提供周分组、情绪统计、周对比等功能
 */

import { createMoodRecord, MOODS } from '@/config/moodConfig';
import type { Mood } from '@/types/mood';
import type { MoodCount, WeekReport, WeekComparison } from '@/types/moodReport';
import type { Note } from '@/types/note';

/**
 * 周分组接口 - 用于按自然周聚合便签
 * @example
 * // 2026年4月27日(周一) 至 5月3日(周日) 为同一周
 * const group: WeekGroup = {
 *   label: '2026年4月第18周',
 *   weekStart: new Date('2026-04-27'),
 *   notes: [...]
 * }
 */
export interface WeekGroup {
  /** 格式化的周标签，如 "2026年4月第18周" */
  label: string;
  /** 该周内的所有便签 */
  notes: Note[];
  /** 周开始日期（周一） */
  weekStart: Date;
}

/**
 * 获取给定日期所在周的周一
 *
 * 逻辑说明：
 * - 周一作为周的第一天 (day === 1)
 * - 周日需要特殊处理，跳到上周一 (day === 0 时 diff = -6)
 *
 * @param date - 任意日期
 * @returns 同一周的周一日期（小时、分钟、秒、毫秒都设为0）
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // day: 0=周日, 1=周一, ..., 6=周六
  // 周一(1)到周日(0)的差值分别为0,1,2,3,4,5,-6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * 格式化周标签
 *
 * 计算逻辑：
 * 1. 从年初计算已过去的天数
 * 2. 加上年初第一天的星期几
 * 3. 除以7向上取整得到第几周
 *
 * @param weekStart - getWeekStart 返回的周一日期
 * @returns 格式化的周标签，如 "2026年4月第18周"
 */
export const formatWeekLabel = (weekStart: Date): string => {
  const year = weekStart.getFullYear();
  const month = weekStart.getMonth() + 1;
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (weekStart.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}年${month}月第${weekNum}周`;
};

/**
 * 计算情绪分布统计
 *
 * 遍历所有便签，统计每种情绪的出现次数和百分比
 * 只返回有数据的情绪（count > 0）
 *
 * @param notes - 便签数组
 * @returns 情绪计数数组，按 count 降序排列
 */
export const calculateMoodCounts = (notes: Note[]): MoodCount[] => {
  // 初始化5种情绪的计数器
  const counts = createMoodRecord(0);

  notes.forEach(note => {
    counts[note.mood] += 1;
  });

  const total = notes.length;

  return (
    MOODS.map(mood => ({
      mood,
      count: counts[mood],
      // 百分比四舍五入到整数，total为0时返回0避免除零
      percentage: total > 0 ? Math.round((counts[mood] / total) * 100) : 0,
    }))
      // 过滤掉没有记录的的情绪，保持数组简洁
      .filter(item => item.count > 0)
  );
};

/**
 * 根据主要情绪生成周总结文字
 *
 * 情绪对应的总结模板：
 * - calm: 平静 - 鼓励继续保持
 * - happy: 开心 - 赞扬积极状态
 * - unhappy: 不开心 - 共情但不鸡汤
 * - anxious: 焦虑 - 正常化焦虑感
 * - excited: 兴奋 - 转化为学习动力
 *
 * @param primaryMood - 主要情绪（出现频率最高的）
 * @param totalNotes - 总记录数
 * @param moodCounts - 情绪统计结果
 * @returns 温馨的周总结文字
 */
const generateWeekSummary = (
  primaryMood: Mood | null,
  totalNotes: number,
  moodCounts: MoodCount[]
): string => {
  if (totalNotes === 0) return '本周还没有记录哦，开始记录你的心情吧！';
  if (!primaryMood) return '本周记录了一些心情，继续保持记录的习惯吧！';

  // 查找主要情绪的百分比
  const percentage = moodCounts.find(m => m.mood === primaryMood)?.percentage || 0;

  const summaries: Record<Mood, string> = {
    calm: `本周你大部分时间都保持平静，这是很好的状态。${percentage}%的记录显示平静心情，说明你内心比较稳定。`,
    happy: `开心是你本周的主旋律！${percentage}%的记录都是开心时刻，继续保持这份快乐吧！`,
    unhappy: `本周有些不开心的时刻（${percentage}%）。别担心，记录下来是一种很好的情绪释放方式。`,
    anxious: `本周有${percentage}%的焦虑情绪。适当的焦虑是正常的，但如果感到困扰，记得给自己一些放松时间。`,
    excited: `兴奋的状态占据了本周的${percentage}%！这种积极的能量很棒，可以转化为学习动力哦！`,
  };

  return summaries[primaryMood];
};

/**
 * 从周分组生成完整周报告
 *
 * 报告包含：
 * - 周标签（格式化的时间范围）
 * - 情绪分布统计
 * - 总记录数
 * - 主要情绪
 * - AI生成的总结文字
 *
 * @param weekGroup - 周分组数据
 * @returns 完整的周报告
 */
export const getWeekReport = (weekGroup: WeekGroup): WeekReport => {
  const moodCounts = calculateMoodCounts(weekGroup.notes);
  // 按出现次数降序排列，主要情绪在第一位
  const sortedCounts = [...moodCounts].sort((a, b) => b.count - a.count);
  const primaryMood = sortedCounts.length > 0 ? sortedCounts[0].mood : null;

  return {
    weekLabel: weekGroup.label,
    weekStart: weekGroup.weekStart,
    moodCounts,
    totalNotes: weekGroup.notes.length,
    primaryMood,
    // 生成主要情绪对应的温馨总结
    summary: generateWeekSummary(primaryMood, weekGroup.notes.length, moodCounts),
  };
};

/**
 * 对比本周与上周的情绪变化
 *
 * 计算逻辑：
 * 1. 对于本周和上周都有的情绪：计算百分比差值
 * 2. 对于本周有但上周没有的情绪：变化 = 本周百分比
 * 3. 对于上周有但本周没有的情绪：变化 = -上周百分比
 *
 * @param current - 本周报告
 * @param previous - 上周报告（可能为null）
 * @returns 包含变化值的对比结果
 */
export const compareWeeks = (current: WeekReport, previous: WeekReport | null): WeekComparison => {
  // 初始化所有情绪变化为0
  const moodChange = createMoodRecord(0);

  if (previous) {
    // 计算本周各情绪与上周的差值
    current.moodCounts.forEach(currentMood => {
      const prev = previous.moodCounts.find(p => p.mood === currentMood.mood);
      moodChange[currentMood.mood] = currentMood.percentage - (prev?.percentage || 0);
    });
    // 处理本周消失的情绪（上周有，本周没有）
    previous.moodCounts.forEach(prev => {
      const curr = current.moodCounts.find(c => c.mood === prev.mood);
      if (!curr) {
        moodChange[prev.mood] = -prev.percentage;
      }
    });
  }

  return { currentWeek: current, previousWeek: previous, moodChange };
};
