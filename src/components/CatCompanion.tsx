'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { CAT_ANIMATIONS, CAT_IDLE_DURATION, CAT_IDLE_EMOJI } from '@/config/catConfig';
import type { Mood } from '@/types/mood';

interface CatCompanionProps {
  mood: Mood;
}

const CatCompanion = ({ mood }: CatCompanionProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(CAT_IDLE_EMOJI);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playAnimation = useCallback(() => {
    const animation = CAT_ANIMATIONS[mood];

    setIsAnimating(true);

    // 根据心情切换不同的emoji表情
    const moodEmojis: Record<Mood, string> = {
      calm: '😺',
      happy: '😸',
      excited: '😻',
      unhappy: '😿',
      anxious: '🙀',
    };
    setCurrentEmoji(moodEmojis[mood]);

    setTimeout(() => {
      setIsAnimating(false);
      setCurrentEmoji(CAT_IDLE_EMOJI);
    }, animation.duration);
  }, [mood]);

  useEffect(() => {
    // 立即触发一次
    const initialTimer = setTimeout(() => {
      playAnimation();
    }, 1000);

    // 每10秒触发一次
    timerRef.current = setInterval(() => {
      playAnimation();
    }, CAT_IDLE_DURATION);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [playAnimation]);

  const animationClass = isAnimating ? CAT_ANIMATIONS[mood].className : '';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${animationClass}`}
      style={{ fontSize: '64px', lineHeight: 1 }}
      title="心情猫咪"
    >
      {currentEmoji}
    </div>
  );
};

export default CatCompanion;
