import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotes } from '@/hooks/useNotes';
import type { Mood } from '@/types/mood';

describe('useNotes', () => {
  const localStorageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
  const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('应该在没有 localStorage 值时返回空数组', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual([]);
    });

    it('应该从 localStorage 恢复便签列表', () => {
      const storedNotes = [
        { id: '1', content: 'test1', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
        { id: '2', content: 'test2', mood: 'calm', createdAt: '2026-04-29T11:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toHaveLength(2);
    });

    it('仅恢复数据时不应该写入 localStorage', () => {
      localStorageGetSpy.mockReturnValue(
        JSON.stringify([
          { id: '1', content: 'test', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
        ])
      );

      renderHook(() => useNotes());

      expect(localStorageSetSpy).not.toHaveBeenCalled();
    });

    it('应该按 createdAt 升序排列', () => {
      const storedNotes = [
        { id: '2', content: 'later', mood: 'happy', createdAt: '2026-04-29T12:00:00.000Z' },
        { id: '1', content: 'earlier', mood: 'calm', createdAt: '2026-04-29T10:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes[0].id).toBe('1');
      expect(result.current.notes[1].id).toBe('2');
    });

    it('应该忽略无效的 localStorage JSON', () => {
      localStorageGetSpy.mockReturnValue('invalid-json{');

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual([]);
    });

    it('应该忽略非数组的 localStorage 值', () => {
      localStorageGetSpy.mockReturnValue('{"not":"array"}');

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual([]);
    });

    it('不应该在损坏的 localStorage 数据恢复时覆盖原始值', () => {
      localStorageGetSpy.mockReturnValue('invalid-json{');

      renderHook(() => useNotes());

      expect(localStorageSetSpy).not.toHaveBeenCalled();
    });

    it('应该保留有效记录并丢弃无效记录', () => {
      localStorageGetSpy.mockReturnValue(
        JSON.stringify([
          { id: 'valid', content: '保留', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
          { id: 'invalid', content: 42, mood: 'calm', createdAt: '2026-04-29T11:00:00.000Z' },
        ])
      );

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].id).toBe('valid');
    });
  });

  describe('addNote', () => {
    it('应该添加新便签', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.addNote('新便签内容', 'happy');
      });

      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].content).toBe('新便签内容');
      expect(result.current.notes[0].mood).toBe('happy');
    });

    it('应该生成唯一ID', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.addNote('test1', 'happy');
        result.current.addNote('test2', 'calm');
      });

      expect(result.current.notes[0].id).not.toBe(result.current.notes[1].id);
    });

    it('应该保存到 localStorage', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.addNote('test', 'excited');
      });

      expect(localStorageSetSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSetSpy).toHaveBeenCalledWith(
        'psychenote-notes',
        expect.stringContaining('test')
      );
    });

    it('应该支持所有情绪类型', () => {
      localStorageGetSpy.mockReturnValue(null);
      const moods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

      const { result } = renderHook(() => useNotes());

      moods.forEach(mood => {
        act(() => {
          result.current.addNote(`test-${mood}`, mood);
        });
        expect(result.current.notes[result.current.notes.length - 1].mood).toBe(mood);
      });
    });
  });

  describe('deleteNote', () => {
    it('应该删除指定便签', () => {
      const storedNotes = [
        { id: '1', content: 'test1', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
        { id: '2', content: 'test2', mood: 'calm', createdAt: '2026-04-29T11:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.deleteNote('1');
      });

      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].id).toBe('2');
    });

    it('应该更新 localStorage', () => {
      const storedNotes = [
        { id: '1', content: 'test1', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.deleteNote('1');
      });

      expect(localStorageSetSpy).toHaveBeenCalledWith('psychenote-notes', '[]');
    });

    it('删除不存在ID应该不报错', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.addNote('test', 'happy');
      });

      act(() => {
        result.current.deleteNote('non-existent-id');
      });

      expect(result.current.notes).toHaveLength(1);
    });
  });

  describe('updateNote', () => {
    it('应该更新便签内容', () => {
      const storedNotes = [
        { id: '1', content: '原始内容', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.updateNote('1', '更新后的内容');
      });

      expect(result.current.notes[0].content).toBe('更新后的内容');
    });

    it('应该保留原有情绪和时间', () => {
      const originalDate = '2026-04-29T10:00:00.000Z';
      const storedNotes = [{ id: '1', content: '原始', mood: 'excited', createdAt: originalDate }];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.updateNote('1', '新内容');
      });

      expect(result.current.notes[0].mood).toBe('excited');
      expect(result.current.notes[0].createdAt).toBe(originalDate);
    });

    it('应该更新 localStorage', () => {
      const storedNotes = [
        { id: '1', content: 'test', mood: 'happy', createdAt: '2026-04-29T10:00:00.000Z' },
      ];
      localStorageGetSpy.mockReturnValue(JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.updateNote('1', 'updated');
      });

      expect(localStorageSetSpy).toHaveBeenCalledWith(
        'psychenote-notes',
        expect.stringContaining('updated')
      );
    });

    it('更新不存在ID应该不报错', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.addNote('test', 'happy');
      });

      act(() => {
        result.current.updateNote('non-existent-id', 'new content');
      });

      expect(result.current.notes[0].content).toBe('test');
    });
  });

  it('应该报告便签保存失败', async () => {
    localStorageGetSpy.mockReturnValue(null);
    localStorageSetSpy.mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.addNote('无法保存', 'happy');
    });

    await waitFor(() => {
      expect(result.current.storageError).toContain('便签保存失败');
    });
  });
});
