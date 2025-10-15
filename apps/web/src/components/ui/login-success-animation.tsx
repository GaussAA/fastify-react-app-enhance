/**
 * 登录成功动画组件
 * 提供登录成功后进入主页面的展开动画
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSuccessAnimations, accessibility } from '@/lib/animations';

interface LoginSuccessAnimationProps {
  children: React.ReactNode;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export function LoginSuccessAnimation({
  children,
  isVisible,
  onAnimationComplete,
  className = '',
}: LoginSuccessAnimationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 延迟显示内容，让展开动画先完成
      const timer = setTimeout(() => {
        setShowContent(true);
        onAnimationComplete?.();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, onAnimationComplete]);

  const animationConfig = accessibility.getAccessibleAnimation(
    loginSuccessAnimations.expandScale
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={animationConfig.initial as any}
          animate={animationConfig.animate as any}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={animationConfig.transition as any}
        >
          {/* 背景展开效果 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          />

          {/* 内容区域 */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {children}
          </motion.div>

          {/* 成功图标动画 */}
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            <motion.svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 页面转场动画组件
interface PageTransitionAnimationProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export function PageTransitionAnimation({
  children,
  isVisible,
  direction = 'right',
  className = '',
}: PageTransitionAnimationProps) {
  const getTransitionConfig = () => {
    const baseConfig = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.4, ease: 'cubic-bezier(0, 0, 0.2, 1)' },
    };

    switch (direction) {
      case 'left':
        return {
          ...baseConfig,
          initial: { opacity: 0, x: -100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 100 },
        };
      case 'right':
        return {
          ...baseConfig,
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 },
        };
      case 'up':
        return {
          ...baseConfig,
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        };
      case 'down':
        return {
          ...baseConfig,
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
        };
      default:
        return baseConfig;
    }
  };

  const config = accessibility.getAccessibleAnimation(getTransitionConfig());

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial={config.initial as any}
          animate={config.animate as any}
          exit={config.exit as any}
          transition={config.transition as any}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
