/**
 * 情绪配置
 *
 * 定义5种情绪的视觉配置：
 * - gradient: Tailwind 渐变类名
 * - label: 中文显示标签
 *
 * 同时提供 LLM 返回的中文情绪到英文 key 的映射
 */

import type { Mood, MoodConfig } from '@/types/mood';

/**
 * 情绪视觉配置映射表
 *
 * 设计考量：
 * - calm (平静): 紫色渐变 - 宁静、治愈
 * - happy (开心): 蓝白绿渐变 - 清新、愉悦
 * - unhappy (不开心): 灰色渐变 - 低沉、灰暗
 * - anxious (焦虑): 深灰渐变 - 压抑、紧张
 * - excited (兴奋): 橙粉渐变 - 热烈、活力
 */
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

/** 默认情绪（应用启动时的初始状态） */
export const DEFAULT_MOOD: Mood = 'calm';

/**
 * LLM 返回的中文情绪 -> Mood key 映射
 *
 * 为什么需要映射：
 * - LLM 返回的是中文（如"开心"、"不高兴"）
 * - 代码中使用的是英文 key（如 'happy'）
 * - 这个映射表处理同义词（如"不高兴"、"难过"都映射到'unhappy'）
 */
export const CHINESE_MOOD_MAP: Record<string, Mood> = {
  平静: 'calm',
  开心: 'happy',
  不高兴: 'unhappy',
  不开心: 'unhappy',
  难过: 'unhappy',
  焦虑: 'anxious',
  兴奋: 'excited',
};
