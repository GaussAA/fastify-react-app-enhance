/**
 * 动画按钮组件
 * 提供波纹扩散效果和精致的交互动画
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { buttonAnimations, animationUtils, accessibility } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    ripple?: boolean;
    loading?: boolean;
    className?: string;
}

export function AnimatedButton({
    children,
    variant = 'default',
    size = 'md',
    ripple = true,
    loading = false,
    className,
    onClick,
    disabled,
    ...props
}: AnimatedButtonProps) {
    // 过滤掉可能与 framer-motion 冲突的属性
    const {
        onAnimationStart: _onAnimationStart,
        onAnimationEnd: _onAnimationEnd,
        onAnimationIteration: _onAnimationIteration,
        onDrag: _onDrag,
        onDragStart: _onDragStart,
        onDragEnd: _onDragEnd,
        ...safeProps
    } = props;
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && !disabled && !loading) {
            const rippleData = animationUtils.createRippleEffect(event);
            const newRipple = {
                id: Date.now(),
                ...rippleData,
            };

            setRipples(prev => [...prev, newRipple]);

            // 移除波纹效果
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 600);
        }

        onClick?.(event);
    };

    const buttonVariants = {
        default: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        ghost: 'bg-transparent hover:bg-white/10 text-white',
    };

    const sizeVariants = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const animationConfig = accessibility.getAccessibleAnimation(buttonAnimations);

    return (
        <motion.button
            ref={buttonRef}
            className={cn(
                'relative overflow-hidden rounded-lg font-medium transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white/50',
                buttonVariants[variant],
                sizeVariants[size],
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            onClick={handleClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? animationConfig.hover : undefined}
            whileTap={!disabled && !loading ? animationConfig.press : undefined}
            transition={animationConfig.transition}
            {...safeProps}
        >
            {/* 波纹效果 */}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={buttonAnimations.ripple.transition}
                />
            ))}

            {/* 加载动画 */}
            {loading && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: buttonAnimations.loading.rotate }}
                        transition={buttonAnimations.loading.transition}
                    />
                </motion.div>
            )}

            {/* 按钮内容 */}
            <motion.span
                className={cn(
                    'relative z-10 flex items-center justify-center gap-2',
                    loading && 'opacity-0'
                )}
                initial={{ opacity: 1 }}
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.span>
        </motion.button>
    );
}

// 液态玻璃动画按钮
interface LiquidGlassButtonProps extends Omit<AnimatedButtonProps, 'variant'> {
    variant?: 'glass' | 'glass-primary';
}

export function LiquidGlassButton({
    children,
    variant = 'glass',
    className,
    ...props
}: LiquidGlassButtonProps) {
    const glassVariants = {
        glass: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white',
        'glass-primary': 'bg-blue-600/40 backdrop-blur-xl border border-blue-500/50 hover:bg-blue-600/60 text-white font-semibold shadow-lg',
    };

    return (
        <AnimatedButton
            className={cn(glassVariants[variant], className)}
            {...props}
        >
            {children}
        </AnimatedButton>
    );
}
