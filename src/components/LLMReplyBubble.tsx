'use client';

import { useEffect, useState, useRef } from 'react';

import type { Mood } from '@/types/mood';

interface LLMReplyBubbleProps {
  error: string | null;
  replyText: string;
  mood: Mood | null;
  isVisible: boolean;
  onClose: () => void;
}

const LLMReplyBubble = ({ error, replyText, mood, isVisible, onClose }: LLMReplyBubbleProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTextRef = useRef('');

  // 气泡显示时触发动画
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setDisplayText('');
      prevTextRef.current = '';
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible]);

  // 流式文本更新
  useEffect(() => {
    if (!isVisible) return;

    // 新文本追加
    if (replyText.length > prevTextRef.current.length) {
      setDisplayText(replyText);
      prevTextRef.current = replyText;
    }
  }, [replyText, isVisible]);

  if (!isVisible && !displayText && !error) return null;

  return (
    <div
      className={`fixed bottom-24 right-5 z-40 cloud-bubble ${
        isAnimating ? 'animate-bubble-pop' : ''
      }`}
      style={{ transformOrigin: 'bottom right' }}
    >
      {/* 云朵气泡 */}
      <div
        className="relative bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-xl border-2 border-white/60"
        style={{
          minWidth: '280px',
          maxWidth: '400px',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,240,252,0.9) 100%)',
          boxShadow:
            '0 8px 32px rgba(147, 112, 220, 0.2), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* 云朵小尾巴装饰 */}
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/80 rounded-full border-2 border-white/50"
          style={{
            boxShadow: '0 2px 8px rgba(147, 112, 220, 0.15)',
          }}
        />

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-400 hover:text-purple-600 transition-colors shadow-sm border border-white/50"
        >
          ✕
        </button>

        {/* 情绪标签 */}
        {mood && !error && (
          <div className="absolute -top-3 left-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {mood === 'calm' && '平静'}
              {mood === 'happy' && '开心'}
              {mood === 'unhappy' && '不开心'}
              {mood === 'anxious' && '焦虑'}
              {mood === 'excited' && '兴奋'}
            </span>
          </div>
        )}

        {/* 回复文本 */}
        <p
          className={`leading-relaxed pr-4 ${error ? 'text-amber-700' : 'text-gray-700'}`}
          style={{
            fontFamily: "'Nunito', 'Comic Sans MS', cursive, sans-serif",
            fontSize: '15px',
            fontWeight: '500',
            textShadow: '0 1px 1px rgba(255,255,255,0.8)',
          }}
        >
          {error || displayText || '...'}
          {!error && replyText === displayText && replyText.length > 0 && (
            <span className="inline-block animate-pulse ml-1">✿</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LLMReplyBubble;
