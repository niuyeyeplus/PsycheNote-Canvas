'use client';

import { useMemo } from 'react';

import type { Mood } from '@/types/mood';

interface CalmDotProps {
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
}

const CalmDots = () => {
  const dots: CalmDotProps[] = useMemo(
    () => [
      { size: 4, top: '5%', left: '8%', duration: 2.1, delay: 0 },
      { size: 3, top: '9%', left: '18%', duration: 2.6, delay: 0.3 },
      { size: 5, top: '4%', left: '28%', duration: 2.3, delay: 0.6 },
      { size: 3, top: '12%', left: '38%', duration: 2.8, delay: 0.9 },
      { size: 4, top: '7%', left: '48%', duration: 2.0, delay: 1.2 },
      { size: 2, top: '10%', left: '55%', duration: 2.5, delay: 0.2 },
      { size: 5, top: '3%', left: '62%', duration: 2.7, delay: 0.5 },
      { size: 3, top: '14%', left: '72%', duration: 2.2, delay: 1.5 },
      { size: 4, top: '8%', left: '82%', duration: 2.9, delay: 0.8 },
      { size: 2, top: '11%', left: '90%', duration: 2.4, delay: 1.1 },
      { size: 3, top: '6%', left: '95%', duration: 2.6, delay: 0.4 },
      { size: 5, top: '15%', left: '12%', duration: 2.1, delay: 1.8 },
      { size: 2, top: '16%', left: '25%', duration: 2.5, delay: 0.7 },
      { size: 4, top: '13%', left: '35%', duration: 2.3, delay: 1.3 },
      { size: 3, top: '18%', left: '45%', duration: 2.7, delay: 0.1 },
      { size: 2, top: '5%', left: '52%', duration: 2.0, delay: 2.0 },
      { size: 5, top: '17%', left: '68%', duration: 2.8, delay: 0.6 },
      { size: 3, top: '9%', left: '78%', duration: 2.2, delay: 1.0 },
      { size: 4, top: '19%', left: '88%', duration: 2.6, delay: 1.4 },
      { size: 2, top: '20%', left: '5%', duration: 2.4, delay: 0.3 },
      { size: 3, top: '21%', left: '30%', duration: 2.1, delay: 1.7 },
      { size: 4, top: '22%', left: '58%', duration: 2.5, delay: 0.9 },
      { size: 2, top: '23%', left: '75%', duration: 2.9, delay: 1.5 },
      { size: 3, top: '24%', left: '92%', duration: 2.3, delay: 0.2 },
      { size: 5, top: '25%', left: '15%', duration: 2.7, delay: 1.1 },
    ],
    []
  );

  return (
    <>
      {dots.map(dot => (
        <div
          key={`${dot.top}-${dot.left}-${dot.size}`}
          className="calm-dot"
          style={
            {
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              top: dot.top,
              left: dot.left,
              '--dot-duration': `${dot.duration}s`,
              animationDelay: `${dot.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};

interface CloudProps {
  top: string;
  left: string;
  fontSize: number;
  duration: number;
  delay: number;
}

const HappyClouds = () => {
  const clouds: CloudProps[] = useMemo(
    () => [
      { top: '12%', left: '10%', fontSize: 40, duration: 2.2, delay: 0 },
      { top: '20%', left: '25%', fontSize: 28, duration: 1.8, delay: 0.4 },
      { top: '8%', left: '50%', fontSize: 35, duration: 2.5, delay: 0.8 },
      { top: '25%', left: '65%', fontSize: 32, duration: 2.0, delay: 0.2 },
      { top: '15%', left: '80%', fontSize: 26, duration: 2.3, delay: 1.0 },
      { top: '30%', left: '5%', fontSize: 30, duration: 1.9, delay: 0.6 },
    ],
    []
  );

  return (
    <>
      {clouds.map(cloud => (
        <div
          key={`cloud-${cloud.top}-${cloud.left}`}
          className="happy-cloud"
          style={
            {
              top: cloud.top,
              left: cloud.left,
              fontSize: `${cloud.fontSize}px`,
              '--cloud-duration': `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            } as React.CSSProperties
          }
        >
          ☁️
        </div>
      ))}
    </>
  );
};

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

interface FlameProps {
  top: string;
  left: string;
  fontSize: number;
  duration: number;
  delay: number;
}

const ExcitedFlames = () => {
  const flames: FlameProps[] = useMemo(
    () => [
      { top: '8%', left: '15%', fontSize: 36, duration: 1.6, delay: 0 },
      { top: '5%', left: '35%', fontSize: 30, duration: 1.9, delay: 0.3 },
      { top: '10%', left: '55%', fontSize: 42, duration: 1.5, delay: 0.6 },
      { top: '6%', left: '75%', fontSize: 34, duration: 1.7, delay: 0.9 },
      { top: '12%', left: '92%', fontSize: 28, duration: 1.8, delay: 0.2 },
      { top: '4%', left: '48%', fontSize: 38, duration: 1.4, delay: 0.5 },
    ],
    []
  );

  return (
    <>
      {flames.map(flame => (
        <div
          key={`flame-${flame.top}-${flame.left}`}
          className="excited-flame"
          style={
            {
              top: flame.top,
              left: flame.left,
              fontSize: `${flame.fontSize}px`,
              '--flame-duration': `${flame.duration}s`,
              animationDelay: `${flame.delay}s`,
            } as React.CSSProperties
          }
        >
          🔥
        </div>
      ))}
    </>
  );
};

const UnhappyClouds = () => {
  const clouds: CloudProps[] = useMemo(
    () => [
      { top: '12%', left: '10%', fontSize: 40, duration: 2.2, delay: 0 },
      { top: '20%', left: '25%', fontSize: 28, duration: 1.8, delay: 0.4 },
      { top: '8%', left: '50%', fontSize: 35, duration: 2.5, delay: 0.8 },
      { top: '25%', left: '65%', fontSize: 32, duration: 2.0, delay: 0.2 },
      { top: '15%', left: '80%', fontSize: 26, duration: 2.3, delay: 1.0 },
      { top: '30%', left: '5%', fontSize: 30, duration: 1.9, delay: 0.6 },
    ],
    []
  );

  return (
    <>
      {clouds.map(cloud => (
        <div
          key={`unhappy-cloud-${cloud.top}-${cloud.left}`}
          className="unhappy-cloud"
          style={
            {
              top: cloud.top,
              left: cloud.left,
              '--cloud-duration': `${cloud.duration}s`,
              '--cloud-size': `${cloud.fontSize}px`,
              animationDelay: `${cloud.delay}s`,
            } as React.CSSProperties
          }
        >
          🌧️
        </div>
      ))}
    </>
  );
};

interface PhraseProps {
  top: string;
  left: string;
  fontSize: number;
  duration: number;
  delay: number;
}

const AnxiousPhrases = () => {
  const phrases: PhraseProps[] = useMemo(
    () => [
      { top: '8%', left: '20%', fontSize: 16, duration: 2.2, delay: 0 },
      { top: '5%', left: '50%', fontSize: 20, duration: 1.8, delay: 0.4 },
      { top: '12%', left: '75%', fontSize: 18, duration: 2.0, delay: 0.8 },
      { top: '15%', left: '40%', fontSize: 14, duration: 2.5, delay: 0.2 },
    ],
    []
  );

  const phraseTexts = ['焦虑有毛用啊', '向前看！', '别想太多', '都会过去的'];

  return (
    <>
      {phrases.map((phrase, idx) => (
        <div
          key={`phrase-${phrase.top}-${phrase.left}`}
          className="anxious-phrase"
          style={
            {
              top: phrase.top,
              left: phrase.left,
              fontSize: `${phrase.fontSize}px`,
              '--phrase-duration': `${phrase.duration}s`,
              animationDelay: `${phrase.delay}s`,
            } as React.CSSProperties
          }
        >
          {phraseTexts[idx]}
        </div>
      ))}
    </>
  );
};

interface MoodBackgroundProps {
  mood: Mood;
  children: React.ReactNode;
}

const MoodBackground = ({ mood, children }: MoodBackgroundProps) => {
  const moodClass = `mood-bg-${mood}`;
  const isCalm = mood === 'calm';
  const isHappy = mood === 'happy';
  const isExcited = mood === 'excited';
  const isUnhappy = mood === 'unhappy';
  const isAnxious = mood === 'anxious';

  return (
    <div className={`relative min-h-screen transition-all duration-1000 ${moodClass}`}>
      {isCalm && <CalmDots />}
      {isHappy && (
        <>
          <HappyClouds />
          <HappySun />
        </>
      )}
      {isExcited && <ExcitedFlames />}
      {isUnhappy && <UnhappyClouds />}
      {isAnxious && <AnxiousPhrases />}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default MoodBackground;
