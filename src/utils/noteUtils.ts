/**
 * 便签通用工具函数
 */

import type { Note } from '@/types/note';

/**
 * 按创建时间升序排序（最旧的在前，最新的在后）
 *
 * @param notes - 便签数组（不会被修改）
 * @returns 排序后的新数组
 */
export const sortNotesByCreatedAt = (notes: Note[]): Note[] =>
  [...notes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
