import { MOOD_CONFIG, DEFAULT_MOOD } from '@/config/moodConfig';
import type { Mood } from '@/types/mood';

describe('moodConfig', () => {
  const validMoods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

  describe('MOOD_CONFIG', () => {
    it('应该为每种情绪定义配置', () => {
      validMoods.forEach(mood => {
        expect(MOOD_CONFIG[mood]).toBeDefined();
      });
    });

    it('每种情绪都应该有 gradient 和 label 属性', () => {
      validMoods.forEach(mood => {
        expect(MOOD_CONFIG[mood]).toHaveProperty('gradient');
        expect(MOOD_CONFIG[mood]).toHaveProperty('label');
        expect(typeof MOOD_CONFIG[mood].gradient).toBe('string');
        expect(typeof MOOD_CONFIG[mood].label).toBe('string');
      });
    });

    it('calm 情绪配置正确', () => {
      expect(MOOD_CONFIG.calm.gradient).toBe('from-purple-400 via-purple-200 to-pink-200');
      expect(MOOD_CONFIG.calm.label).toBe('平静');
    });

    it('happy 情绪配置正确', () => {
      expect(MOOD_CONFIG.happy.gradient).toBe('from-blue-100 via-white to-green-100');
      expect(MOOD_CONFIG.happy.label).toBe('开心');
    });

    it('unhappy 情绪配置正确', () => {
      expect(MOOD_CONFIG.unhappy.gradient).toBe('from-gray-300 via-gray-200 to-gray-100');
      expect(MOOD_CONFIG.unhappy.label).toBe('不开心');
    });

    it('anxious 情绪配置正确', () => {
      expect(MOOD_CONFIG.anxious.gradient).toBe('from-gray-400 via-gray-300 to-gray-200');
      expect(MOOD_CONFIG.anxious.label).toBe('焦虑');
    });

    it('excited 情绪配置正确', () => {
      expect(MOOD_CONFIG.excited.gradient).toBe('from-orange-100 via-pink-100 to-pink-200');
      expect(MOOD_CONFIG.excited.label).toBe('兴奋');
    });

    it('不应该包含非法的情绪类型', () => {
      const configKeys = Object.keys(MOOD_CONFIG);
      expect(configKeys).toHaveLength(5);
      configKeys.forEach(key => {
        expect(validMoods).toContain(key);
      });
    });

    it('gradient 应该以 from- 开头（Tailwind 类名格式）', () => {
      validMoods.forEach(mood => {
        expect(MOOD_CONFIG[mood].gradient).toMatch(/^from-/);
      });
    });
  });

  describe('DEFAULT_MOOD', () => {
    it('默认情绪应该是 calm', () => {
      expect(DEFAULT_MOOD).toBe('calm');
    });

    it('默认情绪应该是有效的 Mood 类型', () => {
      expect(validMoods).toContain(DEFAULT_MOOD);
    });
  });
});
