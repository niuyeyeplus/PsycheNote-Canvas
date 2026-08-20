'use client';

import ParticleLayer from '@/components/ParticleLayer';
import { MOOD_PARTICLE_LAYERS } from '@/config/particleConfig';
import type { Mood } from '@/types/mood';

const HappySun = () => (
  <div
    className="happy-sun"
    style={{
      width: '80px',
      height: '80px',
      top: '40px',
      right: '60px',
    }}
  />
);

interface MoodBackgroundProps {
  mood: Mood;
  children: React.ReactNode;
}

const MoodBackground = ({ mood, children }: MoodBackgroundProps) => (
  <div className={`relative min-h-screen transition-all duration-1000 mood-bg-${mood}`}>
    <ParticleLayer config={MOOD_PARTICLE_LAYERS[mood]} />
    {mood === 'happy' && <HappySun />}
    <div className="relative z-10">{children}</div>
  </div>
);

export default MoodBackground;
