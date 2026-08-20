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

import { readJSON, writeJSON } from '@/lib/storage';
import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';
import { sortNotesByCreatedAt } from '@/utils/noteUtils';

const STORAGE_KEY = 'psychenote-notes';

/**
 * 生成唯一 ID
 * 格式: 时间戳 + 随机字符串
 * 保证在极短时间内创建多条便签时 ID 也不会冲突
 */
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const isNoteArray = (value: unknown): value is Note[] => Array.isArray(value);

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

  // 初始化：从 localStorage 恢复数据（损坏的数据会被忽略）
  useEffect(() => {
    const stored = readJSON<Note[]>(STORAGE_KEY, isNoteArray);
    if (stored) {
      setNotes(sortNotesByCreatedAt(stored));
    }
  }, []);

  /**
   * 更新便签列表并同步到 localStorage
   *
   * @param update - 基于当前列表返回新列表的函数
   */
  const persist = useCallback((update: (prev: Note[]) => Note[]) => {
    setNotes(prev => {
      const updated = update(prev);
      writeJSON(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  /**
   * 添加新便签（带唯一 ID 和时间戳），追加后按时间重新排序
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

      persist(prev => sortNotesByCreatedAt([...prev, newNote]));
    },
    [persist]
  );

  /**
   * 删除便签
   *
   * @param id - 要删除的便签 ID
   * @note 如果 ID 不存在，filter 会忽略，不会报错
   */
  const deleteNote = useCallback(
    (id: string) => {
      persist(prev => prev.filter(n => n.id !== id));
    },
    [persist]
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
      persist(prev => prev.map(n => (n.id === id ? { ...n, content } : n)));
    },
    [persist]
  );

  return { notes, addNote, deleteNote, updateNote };
};
