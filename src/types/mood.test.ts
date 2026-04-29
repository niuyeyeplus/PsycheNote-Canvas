import type { Mood, MoodConfig } from '@/types/mood';

describe('mood types', () => {
  describe('Mood', () => {
    it('Mood 类型应该是有效的情绪字符串联合类型', () => {
      const moods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];
      moods.forEach(mood => {
        const value: Mood = mood;
        expect(value).toBe(mood);
      });
    });

    it('不应该接受非法的情绪值', () => {
      const invalidMood = 'angry' as Mood;
      const validMoods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];
      expect(validMoods).not.toContain(invalidMood);
    });
  });

  describe('MoodConfig', () => {
    it('MoodConfig 应该包含 gradient 和 label 属性', () => {
      const config: MoodConfig = {
        gradient: 'from-purple-400 via-purple-200 to-pink-200',
        label: '平静',
      };
      expect(config.gradient).toBe('from-purple-400 via-purple-200 to-pink-200');
      expect(config.label).toBe('平静');
    });

    it('MoodConfig 的属性类型应该正确', () => {
      const config: MoodConfig = {
        gradient: 'test-gradient',
        label: 'test-label',
      };
      expect(typeof config.gradient).toBe('string');
      expect(typeof config.label).toBe('string');
    });
  });
});
