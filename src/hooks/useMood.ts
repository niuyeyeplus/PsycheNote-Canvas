'use client';

import { useState, useEffect, useCallback } from 'react';

import { DEFAULT_MOOD, isMood } from '@/config/moodConfig';
import { readString, writeString } from '@/lib/storage';
import type { Mood } from '@/types/mood';

const STORAGE_KEY = 'psychenote-current-mood';

export const useMood = () => {
  const [currentMood, setCurrentMoodState] = useState<Mood>(DEFAULT_MOOD);

  useEffect(() => {
    const stored = readString(STORAGE_KEY);
    if (isMood(stored)) {
      setCurrentMoodState(stored);
    }
  }, []);

  const setMood = useCallback((mood: Mood) => {
    if (isMood(mood)) {
      setCurrentMoodState(mood);
      writeString(STORAGE_KEY, mood);
    }
  }, []);

  return { currentMood, setMood };
};
