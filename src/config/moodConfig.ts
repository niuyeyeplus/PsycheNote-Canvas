import type { Mood, MoodConfig } from '@/types/mood';

export const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  calm: {
    gradient: 'from-purple-400 via-purple-200 to-pink-200',
    label: '平静',
  },
  happy: {
    gradient: 'from-blue-100 via-white to-green-100',
    label: '开心',
  },
  unhappy: {
    gradient: 'from-gray-300 via-gray-200 to-gray-100',
    label: '不开心',
  },
  anxious: {
    gradient: 'from-gray-400 via-gray-300 to-gray-200',
    label: '焦虑',
  },
  excited: {
    gradient: 'from-orange-100 via-pink-100 to-pink-200',
    label: '兴奋',
  },
};

export const DEFAULT_MOOD: Mood = 'calm';

// LLM返回的中文情绪 -> Mood key 映射
export const CHINESE_MOOD_MAP: Record<string, Mood> = {
  平静: 'calm',
  开心: 'happy',
  不高兴: 'unhappy',
  不开心: 'unhappy',
  难过: 'unhappy',
  焦虑: 'anxious',
  兴奋: 'excited',
};
