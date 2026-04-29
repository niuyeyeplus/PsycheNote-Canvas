import type { Mood } from '@/types/mood';

export interface MoodCount {
  mood: Mood;
  count: number;
  percentage: number;
}

export interface WeekReport {
  weekLabel: string;
  weekStart: Date;
  moodCounts: MoodCount[];
  totalNotes: number;
  primaryMood: Mood | null;
  summary: string;
}

export interface WeekComparison {
  currentWeek: WeekReport;
  previousWeek: WeekReport | null;
  moodChange: Record<Mood, number>;
}
