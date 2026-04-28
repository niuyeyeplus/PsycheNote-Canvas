'use client';

import { useState, useEffect, useCallback } from 'react';

import { DEFAULT_MOOD } from '@/config/moodConfig';
import type { Mood } from '@/types/mood';

const STORAGE_KEY = 'psychenote-current-mood';

export const useMood = () => {
  const [currentMood, setCurrentMoodState] = useState<Mood>(DEFAULT_MOOD);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mood | null;
    if (stored) {
      setCurrentMoodState(stored);
    }
  }, []);

  const setMood = useCallback((mood: Mood) => {
    setCurrentMoodState(mood);
    localStorage.setItem(STORAGE_KEY, mood);
  }, []);

  return { currentMood, setMood };
};
