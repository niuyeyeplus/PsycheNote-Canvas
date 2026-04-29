import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { cn } from '@/lib/utils';

jest.mock('clsx');
jest.mock('tailwind-merge');

describe('utils', () => {
  describe('cn', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('应该调用 clsx 和 twMerge', () => {
      (clsx as jest.Mock).mockReturnValue('class1 class2');
      (twMerge as jest.Mock).mockReturnValue('class1 class2');

      cn('class1', 'class2');

      expect(clsx).toHaveBeenCalledWith(['class1', 'class2']);
      expect(twMerge).toHaveBeenCalledWith('class1 class2');
    });

    it('应该返回合并后的类名字符串', () => {
      (clsx as jest.Mock).mockReturnValue('merged-class');
      (twMerge as jest.Mock).mockReturnValue('merged-class');

      const result = cn('class1', 'class2');

      expect(result).toBe('merged-class');
    });

    it('应该处理空输入', () => {
      (clsx as jest.Mock).mockReturnValue('');
      (twMerge as jest.Mock).mockReturnValue('');

      const result = cn();

      expect(result).toBe('');
    });

    it('应该处理多个输入', () => {
      (clsx as jest.Mock).mockReturnValue('a b c d');
      (twMerge as jest.Mock).mockReturnValue('a b c d');

      const result = cn('a', 'b', 'c', 'd');

      expect(result).toBe('a b c d');
    });
  });
});
