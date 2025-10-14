/**
 * 增强液态玻璃组件
 * 使用Framer Motion提供更精致的液态玻璃动画效果
 */

import React from 'react';
import { motion } from 'framer-motion';
import { liquidGlassAnimations, accessibility } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface EnhancedLiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'card' | 'input' | 'button';
    size?: 'sm' | 'md' | 'lg';
    hover?: boolean;
    shimmer?: boolean;
    glow?: boolean;
    onClick?: () => void;
}

export function EnhancedLiquidGlass({
    children,
    className,
    variant: _variant = 'default',
    size = 'md',
    hover = true,
    shimmer = false,
    glow = false,
    onClick,
}: EnhancedLiquidGlassProps) {
    const baseClasses = cn(
        'relative overflow-hidden transition-all duration-300 ease-out',
        'bg-white/12 backdrop-blur-xl border border-white/22',
        'shadow-lg hover:shadow-xl',
        {
            'p-3 rounded-lg': size === 'sm',
            'p-4 rounded-xl': size === 'md',
            'p-6 rounded-2xl': size === 'lg',
        },
        className
    );

    const animationConfig = accessibility.getAccessibleAnimation(liquidGlassAnimations);

    return (
        <motion.div
            className={baseClasses}
            whileHover={hover ? animationConfig.hover : undefined}
            whileTap={onClick ? animationConfig.focus : undefined}
            transition={animationConfig.transition}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            {/* 液态玻璃渐变层 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/6 to-transparent pointer-events-none rounded-inherit"
                animate={shimmer ? {
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                } : undefined}
                transition={shimmer ? {
                    duration: 2,
                    ease: 'linear',
                    repeat: Infinity
                } : undefined}
            />

            {/* 径向高光效果 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent pointer-events-none rounded-inherit"
                whileHover={hover ? { opacity: 0.6 } : undefined}
                transition={{ duration: 0.2 }}
            />

            {/* 发光效果 */}
            {glow && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-inherit pointer-events-none"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                />
            )}

            {/* 内容 */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

// 增强液态玻璃卡片
export function EnhancedLiquidGlassCard({
    children,
    className,
    ...props
}: Omit<EnhancedLiquidGlassProps, 'variant'>) {
    return (
        <EnhancedLiquidGlass
            variant="card"
            className={cn('bg-white/10 backdrop-blur-2xl', className)}
            {...props}
        >
            {children}
        </EnhancedLiquidGlass>
    );
}

// 增强液态玻璃输入框
export function EnhancedLiquidGlassInput({
    children,
    className,
    ...props
}: Omit<EnhancedLiquidGlassProps, 'variant'>) {
    return (
        <EnhancedLiquidGlass
            variant="input"
            className={cn('bg-white/8 backdrop-blur-xl', className)}
            {...props}
        >
            {children}
        </EnhancedLiquidGlass>
    );
}

// 增强液态玻璃按钮
export function EnhancedLiquidGlassButton({
    children,
    className,
    ...props
}: Omit<EnhancedLiquidGlassProps, 'variant'>) {
    return (
        <EnhancedLiquidGlass
            variant="button"
            className={cn('bg-white/15 backdrop-blur-xl', className)}
            {...props}
        >
            {children}
        </EnhancedLiquidGlass>
    );
}
