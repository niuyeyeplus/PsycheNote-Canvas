'use client';

/**
 * 便签状态管理 Hook
 *
 * 功能：
 * - 从 localStorage 恢复便签列表
 * - 提供 addNote / deleteNote / updateNote 方法
 * - 自动排序（按创建时间升序）与持久化
 *
 * 存储格式：
 * localStorage['psychenote-notes'] = JSON.stringify(Note[])
 */

import { useState, useEffect, useCallback } from 'react';

import { readStorage, writeStorage } from '@/lib/storage';
import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';

const STORAGE_KEY = 'psychenote-notes';
const VALID_MOODS: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

const isValidNote = (value: unknown): value is Note => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.mood === 'string' &&
    VALID_MOODS.includes(candidate.mood as Mood) &&
    typeof candidate.createdAt === 'string'
  );
};

/**
 * 生成唯一 ID
 * 格式: 时间戳 + 随机字符串
 * 保证在极短时间内创建多条便签时 ID 也不会冲突
 */
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * 便签管理 Hook
 *
 * @example
 * const { notes, addNote, deleteNote, updateNote } = useNotes();
 *
 * // 添加便签
 * addNote('今天心情不错', 'happy');
 *
 * // 更新便签
 * updateNote('note-id', '修改后的内容');
 *
 * // 删除便签
 * deleteNote('note-id');
 */
export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  const persistNotes = useCallback((nextNotes: Note[]) => {
    const succeeded = writeStorage(STORAGE_KEY, JSON.stringify(nextNotes));
    setStorageError(succeeded ? null : '便签保存失败，可能是浏览器存储空间不足。');
  }, []);

  // 初始化：从 localStorage 恢复数据
  useEffect(() => {
    const storedNotes = readStorage(STORAGE_KEY, rawValue => {
      try {
        const parsed: unknown = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
          console.error('本地便签数据不是有效数组');
          return [];
        }
        const validNotes = parsed.filter(isValidNote);
        const droppedCount = parsed.length - validNotes.length;
        if (droppedCount > 0) {
          console.error(`本地便签数据有 ${droppedCount} 条无效记录，已忽略`);
        }
        return validNotes.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } catch (error) {
        console.error('本地便签数据解析失败:', error);
        return [];
      }
    });
    if (storedNotes) setNotes(storedNotes);
  }, []);

  /**
   * 添加新便签
   *
   * 逻辑：
   * 1. 创建新便签对象（带唯一ID和时间戳）
   * 2. 追加到现有列表并重新排序
   * 3. 同步到 localStorage
   *
   * @param content - 便签内容
   * @param mood - 情绪类型
   */
  const addNote = useCallback(
    (content: string, mood: Mood) => {
      const newNote: Note = {
        id: generateId(),
        content,
        mood,
        createdAt: new Date().toISOString(),
      };

      setNotes(prev => {
        const nextNotes = [...prev, newNote].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        persistNotes(nextNotes);
        return nextNotes;
      });
    },
    [persistNotes]
  );

  /**
   * 删除便签
   *
   * @param id - 要删除的便签 ID
   * @note 如果 ID 不存在，filter 会忽略，不会报错
   */
  const deleteNote = useCallback(
    (id: string) => {
      setNotes(prev => {
        const nextNotes = prev.filter(n => n.id !== id);
        if (nextNotes.length === prev.length) return prev;
        persistNotes(nextNotes);
        return nextNotes;
      });
    },
    [persistNotes]
  );

  /**
   * 更新便签内容
   *
   * 特点：
   * - 只更新 content 字段，保留 mood 和 createdAt 不变
   * - 如果 ID 不存在，map 会忽略，不会报错
   *
   * @param id - 要更新的便签 ID
   * @param content - 新的便签内容
   */
  const updateNote = useCallback(
    (id: string, content: string) => {
      setNotes(prev => {
        let didUpdate = false;
        const nextNotes = prev.map(note => {
          if (note.id !== id || note.content === content) return note;
          didUpdate = true;
          return { ...note, content };
        });
        if (!didUpdate) return prev;
        persistNotes(nextNotes);
        return nextNotes;
      });
    },
    [persistNotes]
  );

  return { notes, addNote, deleteNote, storageError, updateNote };
};
