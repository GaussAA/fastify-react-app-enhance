/**
 * 页面转场动画组件
 * 提供登录注册页面之间的转场动画
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, accessibility } from '@/lib/animations';

interface PageTransitionProps {
    children: React.ReactNode;
    isVisible: boolean;
    direction?: 'left' | 'right' | 'up' | 'down';
    className?: string;
}

export function PageTransition({
    children,
    isVisible,
    direction = 'right',
    className = '',
}: PageTransitionProps) {
    const getTransitionConfig = () => {
        switch (direction) {
            case 'left':
                return accessibility.getAccessibleAnimation(pageTransitions.slideInFromLeft);
            case 'right':
                return accessibility.getAccessibleAnimation(pageTransitions.slideInFromRight);
            case 'up':
                return accessibility.getAccessibleAnimation({
                    initial: { opacity: 0, y: 50 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -50 },
                    transition: { duration: 0.4, ease: 'cubic-bezier(0, 0, 0.2, 1)' },
                });
            case 'down':
                return accessibility.getAccessibleAnimation({
                    initial: { opacity: 0, y: -50 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 50 },
                    transition: { duration: 0.4, ease: 'cubic-bezier(0, 0, 0.2, 1)' },
                });
            default:
                return accessibility.getAccessibleAnimation(pageTransitions.fadeIn);
        }
    };

    const config = getTransitionConfig();

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key="page-content"
                    className={className}
                    initial={config.initial}
                    animate={config.animate}
                    exit={config.exit}
                    transition={config.transition}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// 登录成功动画组件
interface LoginSuccessAnimationProps {
    children: React.ReactNode;
    isVisible: boolean;
    className?: string;
}

export function LoginSuccessAnimation({
    children,
    isVisible,
    className = '',
}: LoginSuccessAnimationProps) {
    const config = accessibility.getAccessibleAnimation({
        initial: { opacity: 0, scale: 0.3, rotateY: -180 },
        animate: { opacity: 1, scale: 1, rotateY: 0 },
        transition: { duration: 0.6, ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={className}
                    initial={config.initial}
                    animate={config.animate}
                    transition={config.transition}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
