import { CAT_ANIMATIONS, CAT_IDLE_DURATION, CAT_IDLE_EMOJI, CAT_SIZE } from '@/config/catConfig';
import type { Mood } from '@/types/mood';

describe('catConfig', () => {
  const validMoods: Mood[] = ['calm', 'happy', 'unhappy', 'anxious', 'excited'];

  describe('CAT_ANIMATIONS', () => {
    it('应该为每种情绪定义动画配置', () => {
      validMoods.forEach(mood => {
        expect(CAT_ANIMATIONS[mood]).toBeDefined();
      });
    });

    it('每种情绪动画都应该有 duration 和 className 属性', () => {
      validMoods.forEach(mood => {
        expect(CAT_ANIMATIONS[mood]).toHaveProperty('duration');
        expect(CAT_ANIMATIONS[mood]).toHaveProperty('className');
        expect(typeof CAT_ANIMATIONS[mood].duration).toBe('number');
        expect(typeof CAT_ANIMATIONS[mood].className).toBe('string');
      });
    });

    it('每种情绪动画时长应该大于 0', () => {
      validMoods.forEach(mood => {
        expect(CAT_ANIMATIONS[mood].duration).toBeGreaterThan(0);
      });
    });

    it('每种情绪动画 className 不应为空', () => {
      validMoods.forEach(mood => {
        expect(CAT_ANIMATIONS[mood].className.length).toBeGreaterThan(0);
      });
    });

    it('excited 情绪动画时长应该最短（最兴奋）', () => {
      const excitedDuration = CAT_ANIMATIONS.excited.duration;
      validMoods.forEach(mood => {
        if (mood !== 'excited') {
          expect(excitedDuration).toBeLessThan(CAT_ANIMATIONS[mood].duration);
        }
      });
    });

    it('unhappy 情绪动画时长应该最长（最悲伤）', () => {
      const unhappyDuration = CAT_ANIMATIONS.unhappy.duration;
      validMoods.forEach(mood => {
        if (mood !== 'unhappy') {
          expect(unhappyDuration).toBeGreaterThan(CAT_ANIMATIONS[mood].duration);
        }
      });
    });
  });

  describe('CAT_IDLE_DURATION', () => {
    it('空闲动画间隔应该为 10000ms（10秒）', () => {
      expect(CAT_IDLE_DURATION).toBe(10000);
    });

    it('空闲动画间隔应该大于 0', () => {
      expect(CAT_IDLE_DURATION).toBeGreaterThan(0);
    });
  });

  describe('CAT_IDLE_EMOJI', () => {
    it('空闲 emoji 应该是猫咪', () => {
      expect(CAT_IDLE_EMOJI).toBe('🐱');
    });
  });

  describe('CAT_SIZE', () => {
    it('猫咪尺寸应该是 64px', () => {
      expect(CAT_SIZE).toBe('64px');
    });
  });
});
