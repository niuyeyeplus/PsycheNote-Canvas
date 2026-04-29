'use client';

import { MOOD_CONFIG } from '@/config/moodConfig';
import type { MoodCount } from '@/types/moodReport';

interface MoodBarChartProps {
  moodCounts: MoodCount[];
  // eslint-disable-next-line react/require-default-props
  maxPercentage?: number;
}

const MOOD_EMOJI: Record<string, string> = {
  calm: '😌',
  happy: '😊',
  unhappy: '😢',
  anxious: '😰',
  excited: '🤩',
};

const MoodBarChart = ({ moodCounts, maxPercentage = 100 }: MoodBarChartProps) => (
  <div className="space-y-3">
    {moodCounts.map(({ mood, count, percentage }) => {
      const config = MOOD_CONFIG[mood];
      const barWidth = (percentage / maxPercentage) * 100;

      return (
        <div key={mood} className="flex items-center gap-3">
          <span className="text-xl w-8 text-center">{MOOD_EMOJI[mood]}</span>
          <span className="text-sm text-gray-600 w-12">{config.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-500 w-12 text-right">{percentage}%</span>
          <span className="text-xs text-gray-400 w-8 text-right">({count})</span>
        </div>
      );
    })}
  </div>
);

export default MoodBarChart;
