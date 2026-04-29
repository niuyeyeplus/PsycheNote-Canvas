import { renderHook, act } from '@testing-library/react';

import { useMood } from '@/hooks/useMood';
import type { Mood } from '@/types/mood';

describe('useMood', () => {
  const localStorageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
  const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('应该在没有 localStorage 值时默认为 calm', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());

      expect(result.current.currentMood).toBe('calm');
    });

    it('应该从 localStorage 读取存储的情绪值', () => {
      localStorageGetSpy.mockReturnValue('happy');

      const { result } = renderHook(() => useMood());

      expect(result.current.currentMood).toBe('happy');
    });

    it('应该使用 localStorage 存储的任何值（包括非法值）', () => {
      // 注意：当前实现不验证 Mood 类型有效性，只要是 truthy 值就使用
      localStorageGetSpy.mockReturnValue('invalid-mood');

      const { result } = renderHook(() => useMood());

      // 当前实现：直接使用 localStorage 值，不做类型校验
      expect(result.current.currentMood).toBe('invalid-mood');
    });

    it('localStorage.getItem 应该只被调用一次', () => {
      localStorageGetSpy.mockReturnValue(null);

      renderHook(() => useMood());

      expect(localStorageGetSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('setMood', () => {
    it('应该更新当前情绪状态', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());

      act(() => {
        result.current.setMood('happy');
      });

      expect(result.current.currentMood).toBe('happy');
    });

    it('应该将新情绪保存到 localStorage', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());

      act(() => {
        result.current.setMood('excited');
      });

      expect(localStorageSetSpy).toHaveBeenCalledWith('psychenote-current-mood', 'excited');
    });

    it('应该支持所有五种情绪', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());
      const validMoods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

      validMoods.forEach(mood => {
        act(() => {
          result.current.setMood(mood);
        });
        expect(result.current.currentMood).toBe(mood);
      });
    });
  });

  describe('状态持久化', () => {
    it('setMood 后立即读取应该返回新值', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());

      act(() => {
        result.current.setMood('anxious');
      });

      expect(result.current.currentMood).toBe('anxious');
      expect(localStorageSetSpy).toHaveBeenLastCalledWith('psychenote-current-mood', 'anxious');
    });

    it('连续多次调用 setMood 应该只保存最后一次值', () => {
      localStorageGetSpy.mockReturnValue(null);

      const { result } = renderHook(() => useMood());

      act(() => {
        result.current.setMood('happy');
        result.current.setMood('excited');
        result.current.setMood('unhappy');
      });

      expect(result.current.currentMood).toBe('unhappy');
      expect(localStorageSetSpy).toHaveBeenCalledWith('psychenote-current-mood', 'unhappy');
    });
  });
});
