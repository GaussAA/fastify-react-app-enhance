/**
 * 动画演示组件 - 用于安全地测试不同的动画效果
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, accessibility } from '@/lib/animations';

interface AnimationDemoProps {
  transition: keyof typeof pageTransitions;
  children: React.ReactNode;
  className?: string;
}

export function AnimationDemo({
  transition,
  children,
  className = '',
}: AnimationDemoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTransition, setCurrentTransition] = useState(transition);

  // 当transition变化时，重新触发动画
  useEffect(() => {
    if (transition !== currentTransition) {
      setIsVisible(false);
      setCurrentTransition(transition);

      // 短暂延迟后重新显示
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [transition, currentTransition]);

  const animationConfig = accessibility.getAccessibleAnimation(
    pageTransitions[currentTransition]
  );

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`demo-${currentTransition}`}
            initial={animationConfig.initial as any}
            animate={animationConfig.animate as any}
            exit={animationConfig.exit as any}
            transition={animationConfig.transition as any}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TransitionTesterProps {
  onTransitionChange: (transition: keyof typeof pageTransitions) => void;
  currentTransition: keyof typeof pageTransitions;
}

export function TransitionTester({
  onTransitionChange,
  currentTransition,
}: TransitionTesterProps) {
  const transitions = [
    { key: 'fadeIn', label: '淡入效果' },
    { key: 'slideInFromLeft', label: '从左滑入' },
    { key: 'slideInFromRight', label: '从右滑入' },
    { key: 'scaleIn', label: '缩放效果' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {transitions.map(transition => (
          <motion.button
            key={transition.key}
            onClick={() => onTransitionChange(transition.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentTransition === transition.key
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {transition.label}
          </motion.button>
        ))}
      </div>

      <p className="text-white/70 text-sm">
        当前选择: {transitions.find(t => t.key === currentTransition)?.label}
      </p>
    </div>
  );
}
