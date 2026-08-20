'use client';

import type { Particle, ParticleLayerConfig } from '@/config/particleConfig';

interface ParticleLayerProps {
  config: ParticleLayerConfig;
}

/**
 * 根据 sizeMode 把粒子尺寸映射到对应的样式属性
 */
const getSizeStyle = (
  particle: Particle,
  { sizeMode, sizeVar }: ParticleLayerConfig
): React.CSSProperties => {
  const size = `${particle.size}px`;

  if (sizeMode === 'box') return { width: size, height: size };
  if (sizeMode === 'fontSize') return { fontSize: size };
  return { [sizeVar as string]: size } as React.CSSProperties;
};

/**
 * 通用粒子层：渲染一组带 CSS 动画的装饰粒子
 *
 * 各情绪的差异（class、CSS 变量名、尺寸映射方式、内容）全部由配置描述，
 * 渲染逻辑只实现一次。
 */
const ParticleLayer = ({ config }: ParticleLayerProps) => {
  const { className, durationVar, content, particles } = config;

  return (
    <>
      {particles.map((particle, index) => (
        <div
          key={`${className}-${particle.top}-${particle.left}-${particle.size}`}
          className={className}
          style={
            {
              top: particle.top,
              left: particle.left,
              ...getSizeStyle(particle, config),
              [durationVar]: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
        >
          {Array.isArray(content) ? content[index] : content}
        </div>
      ))}
    </>
  );
};

export default ParticleLayer;
