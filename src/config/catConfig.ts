import type { Mood } from '@/types/mood';

export interface CatAnimation {
  duration: number;
  className: string;
}

export const CAT_ANIMATIONS: Record<Mood, CatAnimation> = {
  calm: {
    duration: 3000,
    className: 'cat-calm',
  },
  happy: {
    duration: 2500,
    className: 'cat-happy',
  },
  excited: {
    duration: 2000,
    className: 'cat-excited',
  },
  unhappy: {
    duration: 3500,
    className: 'cat-unhappy',
  },
  anxious: {
    duration: 3000,
    className: 'cat-anxious',
  },
};

export const CAT_IDLE_DURATION = 10000; // 10秒触发一次

export const CAT_IDLE_EMOJI = '🐱';
export const CAT_SIZE = '64px';
