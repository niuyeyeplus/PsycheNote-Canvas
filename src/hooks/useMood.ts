'use client';

import { useState, useEffect, useCallback } from 'react';

import { DEFAULT_MOOD } from '@/config/moodConfig';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Mood } from '@/types/mood';

const STORAGE_KEY = 'psychenote-current-mood';

const VALID_MOODS: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

export const useMood = () => {
  const [currentMood, setCurrentMoodState] = useState<Mood>(DEFAULT_MOOD);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStorage(STORAGE_KEY, value => value as Mood);
    if (stored && VALID_MOODS.includes(stored)) {
      setCurrentMoodState(stored);
    }
  }, []);

  const setMood = useCallback((mood: Mood) => {
    if (VALID_MOODS.includes(mood)) {
      setCurrentMoodState(mood);
      const succeeded = writeStorage(STORAGE_KEY, mood);
      setStorageError(succeeded ? null : '当前情绪保存失败，可能是浏览器存储空间不足。');
    }
  }, []);

  return { currentMood, setMood, storageError };
};
