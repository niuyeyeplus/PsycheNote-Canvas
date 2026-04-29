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

import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';

const STORAGE_KEY = 'psychenote-notes';

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

  // 初始化：从 localStorage 恢复数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Note[];
        // 验证是数组类型
        if (Array.isArray(parsed)) {
          // 按创建时间升序排列（最旧的在前，最新的在后）
          parsed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setNotes(parsed);
        }
      } catch {
        // JSON 解析失败时忽略，使用空数组
        // 这确保了损坏的 localStorage 数据不会导致应用崩溃
      }
    }
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
  const addNote = useCallback((content: string, mood: Mood) => {
    const newNote: Note = {
      id: generateId(),
      content,
      mood,
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => {
      // 追加新便签并按时间排序
      const updated = [...prev, newNote].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      // 持久化到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * 删除便签
   *
   * @param id - 要删除的便签 ID
   * @note 如果 ID 不存在，filter 会忽略，不会报错
   */
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

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
  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, content } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { notes, addNote, deleteNote, updateNote };
};
