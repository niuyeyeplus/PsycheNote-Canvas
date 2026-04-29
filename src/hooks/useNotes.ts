import { useState, useEffect, useCallback } from 'react';

import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';

const STORAGE_KEY = 'psychenote-notes';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Note[];
        if (Array.isArray(parsed)) {
          // Sort by createdAt ascending (oldest first, newest last)
          parsed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setNotes(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const addNote = useCallback((content: string, mood: Mood) => {
    const newNote: Note = {
      id: generateId(),
      content,
      mood,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => {
      const updated = [...prev, newNote].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, content } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { notes, addNote, deleteNote, updateNote };
};
