/**
 * 高级动画工具类
 * 提供精致流畅的动画效果，遵循60fps流畅度和自然运动曲线
 */

import React from 'react';

// 类型声明
declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
  }
}

// 缓动函数 - 实现自然运动曲线 (Framer Motion格式)
export const easing = {
  // 缓入缓出 - 最自然的运动曲线
  easeInOut: [0.4, 0, 0.2, 1],
  // 弹性缓动 - 用于有趣的交互效果
  elastic: [0.68, -0.55, 0.265, 1.55],
  // 回弹效果 - 用于按钮点击
  bounce: [0.68, -0.6, 0.32, 1.6],
  // 快速缓出 - 用于页面转场
  easeOut: [0, 0, 0.2, 1],
  // 快速缓入 - 用于元素出现
  easeIn: [0.4, 0, 1, 1],
} as const;

// 动画时长配置
export const durations = {
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

// 动画延迟配置 - 用于错落有致的延迟加载
export const delays = {
  none: '0ms',
  short: '100ms',
  medium: '200ms',
  long: '300ms',
  longer: '400ms',
} as const;

// 页面转场动画配置
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: easing.easeInOut },
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.4, ease: easing.easeOut },
  },
  slideInFromLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.4, ease: easing.easeOut },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: easing.elastic },
  },
} as const;

// 登录成功动画配置
export const loginSuccessAnimations = {
  expandScale: {
    initial: { opacity: 0, scale: 0.3, rotateY: -180 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    transition: { duration: 0.6, ease: easing.elastic },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: easing.easeOut },
  },
} as const;

// 表单交互动画配置
export const formAnimations = {
  inputFocus: {
    scale: 1.02,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  inputBlur: {
    scale: 1,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  labelFloat: {
    y: -8,
    scale: 0.85,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  errorShake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4, ease: easing.easeOut },
  },
} as const;

// 按钮动画配置
export const buttonAnimations = {
  ripple: {
    scale: [0, 1],
    opacity: [0.6, 0],
    transition: { duration: 0.6, ease: easing.easeOut },
  },
  press: {
    scale: 0.95,
    transition: { duration: 0.1, ease: easing.easeOut },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  loading: {
    rotate: 360,
    transition: { duration: 1, ease: 'linear', repeat: Infinity },
  },
} as const;

// 渐进式加载动画配置
export const progressiveAnimations = {
  stagger: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: easing.easeOut },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: easing.easeOut },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: easing.easeOut },
  },
} as const;

// 液态玻璃动画配置
export const liquidGlassAnimations = {
  hover: {
    y: -2,
    scale: 1.01,
    transition: { duration: 0.3, ease: easing.easeOut },
  },
  focus: {
    scale: 1.02,
    transition: { duration: 0.2, ease: easing.easeOut },
  },
  shimmer: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: { duration: 2, ease: 'linear', repeat: Infinity },
  },
} as const;

// 可访问性支持
export const accessibility = {
  // 检查用户是否偏好减少动画
  prefersReducedMotion: () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },

  // 获取适合的动画配置
  getAccessibleAnimation: <T extends Record<string, unknown>>(
    animation: T
  ): T => {
    if (accessibility.prefersReducedMotion()) {
      return {
        ...animation,
        transition: { duration: 0.1, ease: easing.easeOut },
      } as T;
    }
    return animation;
  },
} as const;

// 动画工具函数
export const animationUtils = {
  // 创建错落有致的延迟
  createStaggerDelay: (index: number, baseDelay: number = 100) => {
    return `${index * baseDelay}ms`;
  },

  // 创建弹性动画
  createElasticAnimation: (property: string, from: number, to: number) => {
    return {
      [property]: [from, to * 1.1, to],
      transition: { duration: 0.6, ease: easing.elastic },
    };
  },

  // 创建波纹效果
  createRippleEffect: (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    return {
      x,
      y,
      size,
    };
  },
} as const;

// 导出所有动画配置
export const animations = {
  easing,
  durations,
  delays,
  pageTransitions,
  loginSuccessAnimations,
  formAnimations,
  buttonAnimations,
  progressiveAnimations,
  liquidGlassAnimations,
  accessibility,
  animationUtils,
} as const;
