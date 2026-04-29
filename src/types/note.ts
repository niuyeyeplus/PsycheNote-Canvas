import type { Mood } from '@/types/mood';

export interface Note {
  id: string;
  content: string;
  mood: Mood;
  createdAt: string; // ISO date string
}
