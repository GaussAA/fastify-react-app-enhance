/**
 * 页面转场管理器
 * 管理页面之间的转场动画和状态
 */

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, accessibility } from '@/lib/animations';

interface PageTransitionContextType {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    isTransitioning: boolean;
    transitionDirection: 'left' | 'right' | 'up' | 'down' | 'fade';
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export function usePageTransition() {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error('usePageTransition must be used within a PageTransitionProvider');
    }
    return context;
}

interface PageTransitionProviderProps {
    children: React.ReactNode;
    initialPage?: string;
}

export function PageTransitionProvider({
    children,
    initialPage = 'login',
}: PageTransitionProviderProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | 'up' | 'down' | 'fade'>('fade');

    const handlePageChange = (newPage: string, direction: 'left' | 'right' | 'up' | 'down' | 'fade' = 'fade') => {
        if (newPage === currentPage) return;

        setIsTransitioning(true);
        setTransitionDirection(direction);

        // 模拟转场延迟
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsTransitioning(false);
        }, 300);
    };

    const contextValue: PageTransitionContextType = {
        currentPage,
        setCurrentPage: handlePageChange,
        isTransitioning,
        transitionDirection,
    };

    return (
        <PageTransitionContext.Provider value={contextValue}>
            {children}
        </PageTransitionContext.Provider>
    );
}

// 页面转场包装器
interface PageTransitionWrapperProps {
    children: React.ReactNode;
    pageId: string;
    className?: string;
}

export function PageTransitionWrapper({
    children,
    pageId,
    className = '',
}: PageTransitionWrapperProps) {
    const { currentPage, transitionDirection } = usePageTransition();
    const isVisible = currentPage === pageId;

    const getTransitionConfig = () => {
        switch (transitionDirection) {
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
                    key={pageId}
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

// 登录成功转场动画
interface LoginSuccessTransitionProps {
    children: React.ReactNode;
    isVisible: boolean;
    onComplete?: () => void;
    className?: string;
}

export function LoginSuccessTransition({
    children,
    isVisible,
    onComplete,
    className = '',
}: LoginSuccessTransitionProps) {
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
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={config.transition}
                    onAnimationComplete={onComplete}
                >
                    {/* 成功背景效果 */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                    />

                    {/* 内容 */}
                    <div className="relative z-10">
                        {children}
                    </div>

                    {/* 成功图标 */}
                    <motion.div
                        className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
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
