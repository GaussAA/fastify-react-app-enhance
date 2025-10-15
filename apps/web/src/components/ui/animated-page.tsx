/**
 * 动画页面组件
 * 提供页面转场动画和渐进式加载效果
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  pageTransitions,
  progressiveAnimations,
  accessibility,
} from '@/lib/animations';
import { getTypedMotionProps } from '@/lib/motion-types';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  transition?: keyof typeof pageTransitions;
  enableProgressiveLoading?: boolean;
  staggerDelay?: number;
}

export function AnimatedPage({
  children,
  className = '',
  style,
  transition = 'fadeIn',
  enableProgressiveLoading = true,
  staggerDelay = 100,
}: AnimatedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTransition, setCurrentTransition] = useState(transition);

  // 当transition属性变化时，重置动画状态
  useEffect(() => {
    if (transition !== currentTransition) {
      setCurrentTransition(transition);
      // 简化逻辑，避免页面空白
      setIsLoaded(true);
    }
  }, [transition, currentTransition]);

  // 初始加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const animationConfig = accessibility.getAccessibleAnimation(
    pageTransitions[currentTransition]
  );
  const motionProps = getTypedMotionProps(animationConfig);

  return (
    <motion.div
      className={className}
      style={style}
      initial={isLoaded ? motionProps.initial : { opacity: 1 }}
      animate={isLoaded ? motionProps.animate : { opacity: 1 }}
      exit={motionProps.exit}
      transition={isLoaded ? motionProps.transition : { duration: 0 }}
      key={`animated-page-${currentTransition}`}
    >
      {enableProgressiveLoading ? (
        <ProgressiveContainer
          staggerDelay={staggerDelay}
          isLoaded={isLoaded}
          key={`progressive-${currentTransition}`}
        >
          {children}
        </ProgressiveContainer>
      ) : (
        children
      )}
    </motion.div>
  );
}

// 渐进式加载容器
interface ProgressiveContainerProps {
  children: React.ReactNode;
  staggerDelay: number;
  isLoaded: boolean;
}

function ProgressiveContainer({
  children,
  staggerDelay,
  isLoaded,
}: ProgressiveContainerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={
            isLoaded
              ? progressiveAnimations.stagger.initial
              : { opacity: 1, y: 0 }
          }
          animate={
            isLoaded
              ? progressiveAnimations.stagger.animate
              : { opacity: 1, y: 0 }
          }
          transition={
            isLoaded
              ? {
                  ...progressiveAnimations.stagger.transition,
                  delay: (index * staggerDelay) / 1000,
                }
              : { duration: 0 }
          }
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

// 页面转场包装器
interface PageTransitionWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  transition?: keyof typeof pageTransitions;
}

export function PageTransitionWrapper({
  children,
  isVisible,
  transition = 'slideInFromRight',
}: PageTransitionWrapperProps) {
  const animationConfig = accessibility.getAccessibleAnimation(
    pageTransitions[transition]
  );
  const motionProps = getTypedMotionProps(animationConfig);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="page-content"
          initial={motionProps.initial}
          animate={motionProps.animate}
          exit={motionProps.exit}
          transition={motionProps.transition}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
