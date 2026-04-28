'use client';

const DECORATIONS = [
  { emoji: '✈️', left: '5%', duration: '8s', delay: '0s', fontSize: '28px' },
  { emoji: '⭐', left: '12%', duration: '7s', delay: '1.2s', fontSize: '22px' },
  { emoji: '💫', left: '20%', duration: '9s', delay: '0.6s', fontSize: '26px' },
  { emoji: '🎈', left: '28%', duration: '7.5s', delay: '2.1s', fontSize: '24px' },
  { emoji: '🎀', left: '36%', duration: '8.5s', delay: '0.3s', fontSize: '20px' },
  { emoji: '🌈', left: '44%', duration: '10s', delay: '1.8s', fontSize: '30px' },
  { emoji: '💭', left: '52%', duration: '7s', delay: '0.9s', fontSize: '22px' },
  { emoji: '🎯', left: '60%', duration: '9s', delay: '2.5s', fontSize: '26px' },
  { emoji: '✨', left: '68%', duration: '6.5s', delay: '1.5s', fontSize: '24px' },
  { emoji: '🌸', left: '76%', duration: '8s', delay: '0.4s', fontSize: '28px' },
  { emoji: '🎶', left: '84%', duration: '7.5s', delay: '2s', fontSize: '20px' },
  { emoji: '🦋', left: '92%', duration: '9.5s', delay: '1.1s', fontSize: '26px' },
  { emoji: '✈️', left: '8%', duration: '8s', delay: '3s', fontSize: '18px' },
  { emoji: '⭐', left: '48%', duration: '7s', delay: '3.5s', fontSize: '24px' },
  { emoji: '💫', left: '72%', duration: '9s', delay: '2.8s', fontSize: '18px' },
  { emoji: '🎈', left: '24%', duration: '8s', delay: '4s', fontSize: '22px' },
  { emoji: '🌈', left: '56%', duration: '10s', delay: '3.2s', fontSize: '20px' },
  { emoji: '💭', left: '80%', duration: '7.5s', delay: '4.5s', fontSize: '24px' },
];

const FloatingDecorations = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {DECORATIONS.map(item => (
      <div
        key={`${item.left}-${item.duration}-${item.delay}`}
        className="float-decoration"
        style={{
          left: item.left,
          animationDuration: item.duration,
          animationDelay: item.delay,
          fontSize: item.fontSize,
        }}
      >
        {item.emoji}
      </div>
    ))}
  </div>
);

export default FloatingDecorations;
