/**
 * 情绪背景粒子配置
 *
 * 每种情绪对应一层粒子（位置、尺寸、动画时长与延迟），
 * 由 ParticleLayer 组件统一渲染，避免每种情绪重复实现同一套 map 渲染逻辑。
 */

import type { Mood } from '@/types/mood';

/** 单个粒子的位置与动画参数 */
export interface Particle {
  /** 距顶部百分比，如 '12%' */
  top: string;
  /** 距左侧百分比，如 '10%' */
  left: string;
  /** 尺寸（px），具体映射方式由 ParticleLayerConfig.sizeMode 决定 */
  size: number;
  /** 单个粒子的动画时长（秒） */
  duration: number;
  /** 动画延迟（秒） */
  delay: number;
}

/**
 * 尺寸映射方式
 * - box: 映射为 width / height（如 calm 的圆点）
 * - fontSize: 映射为 fontSize（emoji / 文字粒子）
 * - cssVar: 映射为 sizeVar 指定的 CSS 变量（由 globals.css 消费）
 */
export type ParticleSizeMode = 'box' | 'fontSize' | 'cssVar';

/** 一层粒子的渲染配置 */
export interface ParticleLayerConfig {
  /** 粒子元素的 class，对应 globals.css 中的动画 */
  className: string;
  /** 承载单个粒子动画时长的 CSS 变量名 */
  durationVar: string;
  sizeMode: ParticleSizeMode;
  /** sizeMode 为 cssVar 时使用的变量名 */
  sizeVar?: string;
  /** 粒子内容：统一的 emoji，或逐个粒子对应的文字 */
  content?: string | string[];
  particles: Particle[];
}

/** 云朵粒子布局（happy 的白云与 unhappy 的乌云共用同一套位置） */
const CLOUD_PARTICLES: Particle[] = [
  { top: '12%', left: '10%', size: 40, duration: 2.2, delay: 0 },
  { top: '20%', left: '25%', size: 28, duration: 1.8, delay: 0.4 },
  { top: '8%', left: '50%', size: 35, duration: 2.5, delay: 0.8 },
  { top: '25%', left: '65%', size: 32, duration: 2.0, delay: 0.2 },
  { top: '15%', left: '80%', size: 26, duration: 2.3, delay: 1.0 },
  { top: '30%', left: '5%', size: 30, duration: 1.9, delay: 0.6 },
];

const CALM_DOT_PARTICLES: Particle[] = [
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
];

const FLAME_PARTICLES: Particle[] = [
  { top: '8%', left: '15%', size: 36, duration: 1.6, delay: 0 },
  { top: '5%', left: '35%', size: 30, duration: 1.9, delay: 0.3 },
  { top: '10%', left: '55%', size: 42, duration: 1.5, delay: 0.6 },
  { top: '6%', left: '75%', size: 34, duration: 1.7, delay: 0.9 },
  { top: '12%', left: '92%', size: 28, duration: 1.8, delay: 0.2 },
  { top: '4%', left: '48%', size: 38, duration: 1.4, delay: 0.5 },
];

const PHRASE_PARTICLES: Particle[] = [
  { top: '8%', left: '20%', size: 16, duration: 2.2, delay: 0 },
  { top: '5%', left: '50%', size: 20, duration: 1.8, delay: 0.4 },
  { top: '12%', left: '75%', size: 18, duration: 2.0, delay: 0.8 },
  { top: '15%', left: '40%', size: 14, duration: 2.5, delay: 0.2 },
];

/** 每种情绪的粒子层配置 */
export const MOOD_PARTICLE_LAYERS: Record<Mood, ParticleLayerConfig> = {
  calm: {
    className: 'calm-dot',
    durationVar: '--dot-duration',
    sizeMode: 'box',
    particles: CALM_DOT_PARTICLES,
  },
  happy: {
    className: 'happy-cloud',
    durationVar: '--cloud-duration',
    sizeMode: 'fontSize',
    content: '☁️',
    particles: CLOUD_PARTICLES,
  },
  excited: {
    className: 'excited-flame',
    durationVar: '--flame-duration',
    sizeMode: 'fontSize',
    content: '🔥',
    particles: FLAME_PARTICLES,
  },
  unhappy: {
    className: 'unhappy-cloud',
    durationVar: '--cloud-duration',
    sizeMode: 'cssVar',
    sizeVar: '--cloud-size',
    content: '🌧️',
    particles: CLOUD_PARTICLES,
  },
  anxious: {
    className: 'anxious-phrase',
    durationVar: '--phrase-duration',
    sizeMode: 'fontSize',
    content: ['焦虑有毛用啊', '向前看！', '别想太多', '都会过去的'],
    particles: PHRASE_PARTICLES,
  },
};
