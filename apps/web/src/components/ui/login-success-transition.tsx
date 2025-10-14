/**
 * 登录成功转场动画组件
 * 提供完整的登录成功到主页面的转场动画
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSuccessAnimations, accessibility } from '@/lib/animations';

interface LoginSuccessTransitionProps {
    children: React.ReactNode;
    isVisible: boolean;
    onComplete?: () => void;
    className?: string;
    variant?: 'expand' | 'slide' | 'flip' | 'zoom';
}

export function LoginSuccessTransition({
    children,
    isVisible,
    onComplete,
    className = '',
    variant = 'expand',
}: LoginSuccessTransitionProps) {
    const [showContent, setShowContent] = useState(false);
    const [showSuccessIcon, setShowSuccessIcon] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // 分阶段显示内容
            const timer1 = setTimeout(() => {
                setShowContent(true);
            }, 200);

            const timer2 = setTimeout(() => {
                setShowSuccessIcon(true);
            }, 400);

            const timer3 = setTimeout(() => {
                onComplete?.();
            }, 800);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        } else {
            setShowContent(false);
            setShowSuccessIcon(false);
        }
    }, [isVisible, onComplete]);

    const getAnimationConfig = () => {
        const baseConfig = accessibility.getAccessibleAnimation(loginSuccessAnimations.expandScale);

        switch (variant) {
            case 'slide':
                return {
                    ...baseConfig,
                    initial: { opacity: 0, y: 100, scale: 0.8 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                };
            case 'flip':
                return {
                    ...baseConfig,
                    initial: { opacity: 0, rotateX: -90, scale: 0.5 },
                    animate: { opacity: 1, rotateX: 0, scale: 1 },
                };
            case 'zoom':
                return {
                    ...baseConfig,
                    initial: { opacity: 0, scale: 0.1 },
                    animate: { opacity: 1, scale: 1 },
                };
            default:
                return baseConfig;
        }
    };

    const config = getAnimationConfig();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`relative ${className}`}
                    initial={config.initial}
                    animate={config.animate}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={config.transition}
                >
                    {/* 成功背景效果 */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
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
                    {showSuccessIcon && (
                        <motion.div
                            className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
                        >
                            <motion.svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        </motion.div>
                    )}

                    {/* 粒子效果 */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-white/30 rounded-full"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                    y: [-20, -40, -60],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: 0.5 + i * 0.1,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// 登录成功页面包装器
interface LoginSuccessPageProps {
    children: React.ReactNode;
    isVisible: boolean;
    onComplete?: () => void;
    className?: string;
}

export function LoginSuccessPage({
    children,
    isVisible,
    onComplete,
    className = '',
}: LoginSuccessPageProps) {
    return (
        <LoginSuccessTransition
            isVisible={isVisible}
            onComplete={onComplete}
            className={className}
            variant="expand"
        >
            {children}
        </LoginSuccessTransition>
    );
}

// 登录成功卡片
interface LoginSuccessCardProps {
    children: React.ReactNode;
    isVisible: boolean;
    onComplete?: () => void;
    className?: string;
}

export function LoginSuccessCard({
    children,
    isVisible,
    onComplete,
    className = '',
}: LoginSuccessCardProps) {
    return (
        <LoginSuccessTransition
            isVisible={isVisible}
            onComplete={onComplete}
            className={`p-6 ${className}`}
            variant="slide"
        >
            {children}
        </LoginSuccessTransition>
    );
}
