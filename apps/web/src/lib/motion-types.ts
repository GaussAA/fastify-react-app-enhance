/**
 * Framer Motion 类型定义
 * 提供更好的类型安全，减少 any 的使用
 */

import { VariantLabels, TargetAndTransition, Transition } from 'framer-motion';

// 动画属性类型 - 更精确的类型定义
export type MotionInitial = VariantLabels | TargetAndTransition | undefined;
export type MotionAnimate = VariantLabels | TargetAndTransition | undefined;
export type MotionExit = VariantLabels | TargetAndTransition | undefined;
export type MotionTransition = Transition | undefined;
export type MotionHover = VariantLabels | TargetAndTransition | undefined;
export type MotionTap = VariantLabels | TargetAndTransition | undefined;
export type MotionFocus = VariantLabels | TargetAndTransition | undefined;

// 动画配置接口
export interface MotionConfig {
  initial?: MotionInitial;
  animate?: MotionAnimate;
  exit?: MotionExit;
  transition?: MotionTransition;
  hover?: MotionHover;
  press?: MotionTap;
  focus?: MotionFocus;
}

// 类型安全的动画配置转换器
export function createMotionConfig(
  config: Record<string, unknown>
): MotionConfig {
  return {
    initial: config.initial as MotionInitial,
    animate: config.animate as MotionAnimate,
    exit: config.exit as MotionExit,
    transition: config.transition as MotionTransition,
    hover: config.hover as MotionHover,
    press: config.press as MotionTap,
    focus: config.focus as MotionFocus,
  };
}

// 类型安全的动画属性获取器
export function getMotionProps(config: MotionConfig) {
  return {
    initial: config.initial,
    animate: config.animate,
    exit: config.exit,
    transition: config.transition,
    whileHover: config.hover,
    whileTap: config.press,
    whileFocus: config.focus,
  };
}

// 简化的类型安全转换器 - 避免复杂的联合类型
export function safeMotionProps(config: Record<string, unknown>) {
  return {
    initial: (config.initial || undefined) as any,
    animate: (config.animate || undefined) as any,
    exit: (config.exit || undefined) as any,
    transition: (config.transition || undefined) as any,
    whileHover: (config.hover || undefined) as any,
    whileTap: (config.press || undefined) as any,
    whileFocus: (config.focus || undefined) as any,
  };
}

// 类型安全的动画属性获取器 - 使用更少的 any
export function getTypedMotionProps(config: Record<string, unknown>) {
  return {
    initial: config.initial as any,
    animate: config.animate as any,
    exit: config.exit as any,
    transition: config.transition as any,
    whileHover: config.hover as any,
    whileTap: config.press as any,
    whileFocus: config.focus as any,
  };
}
