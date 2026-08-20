'use client';

import { MOOD_CONFIG, MOOD_EMOJI } from '@/config/moodConfig';
import type { WeekComparison } from '@/types/moodReport';

import MoodBarChart from './MoodBarChart';

interface MoodReportViewProps {
  comparison: WeekComparison | null;
  // eslint-disable-next-line react/require-default-props
  isLoading?: boolean;
}

const getChangeClass = (isPositive: boolean, isNegative: boolean): string => {
  if (isPositive) return 'text-green-500';
  if (isNegative) return 'text-red-400';
  return 'text-gray-400';
};

const MoodReportView = ({ comparison, isLoading }: MoodReportViewProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">加载中...</div>;
  }

  if (!comparison) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">本周还没有记录</p>
        <p className="text-sm text-gray-400">开始记录你的心情，获取第一份周报吧！</p>
      </div>
    );
  }

  const { currentWeek, previousWeek, moodChange } = comparison;

  return (
    <div className="space-y-6">
      {/* 本周标题 */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-purple-600">{currentWeek.weekLabel}</h3>
        <p className="text-sm text-gray-400">共 {currentWeek.totalNotes} 条记录</p>
      </div>

      {/* 情绪分布柱状图 */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-4">情绪分布</h4>
        {currentWeek.moodCounts.length > 0 ? (
          <MoodBarChart moodCounts={currentWeek.moodCounts} />
        ) : (
          <p className="text-center text-gray-400 py-4">暂无数据</p>
        )}
      </div>

      {/* 周对比 */}
      {previousWeek && (
        <div className="bg-purple-50 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-purple-600 mb-3">与上周对比</h4>
          <div className="space-y-2">
            {currentWeek.moodCounts.map(({ mood }) => {
              const change = moodChange[mood];
              const isPositive = change > 0;
              const isNegative = change < 0;
              const changeClass = getChangeClass(isPositive, isNegative);

              return (
                <div key={mood} className="flex items-center justify-between text-sm">
                  <span>
                    {MOOD_EMOJI[mood]} {MOOD_CONFIG[mood].label}
                  </span>
                  <span className={changeClass}>
                    {isPositive && '+'}
                    {change}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 本周总结 */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 text-center">
        <p className="text-gray-700 leading-relaxed">{currentWeek.summary}</p>
      </div>
    </div>
  );
};

export default MoodReportView;
