'use client';

import CatCompanion from '@/components/CatCompanion';
import FloatingDecorations from '@/components/FloatingDecorations';
import MoodBackground from '@/components/MoodBackground';
import { MOOD_CONFIG } from '@/config/moodConfig';
import { useMood } from '@/hooks/useMood';
import type { Mood } from '@/types/mood';

const MOODS: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

const MoodTestPage = () => {
  const { currentMood, setMood } = useMood();

  return (
    <MoodBackground mood={currentMood}>
      <FloatingDecorations />
      <CatCompanion mood={currentMood} />

      <div className="flex flex-col items-center pt-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">📝</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-700 tracking-tight">
            PsycheNote Canvas
          </h1>
        </div>
        <p className="text-gray-600 font-medium">你的情绪气象站 · 记录每一刻的心情</p>

        {/* 心情切换按钮 (测试用) */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center max-w-lg">
          {MOODS.map(m => (
            <button
              type="button"
              key={m}
              onClick={() => setMood(m)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentMood === m
                  ? 'bg-white/80 shadow-lg scale-105 text-purple-600'
                  : 'bg-white/40 text-gray-600 hover:bg-white/60'
              }`}
            >
              {MOOD_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* 当前心情提示 */}
        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-gray-700">
            当前心情：{MOOD_CONFIG[currentMood].label}
          </p>
        </div>
      </div>
    </MoodBackground>
  );
};

export default MoodTestPage;
