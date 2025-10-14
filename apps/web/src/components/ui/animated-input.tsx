/**
 * 动画输入框组件
 * 提供聚焦时的优雅过渡和微交互动画
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { formAnimations, accessibility } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    variant?: 'default' | 'glass' | 'floating';
    className?: string;
}

export function AnimatedInput({
    label,
    error,
    variant = 'default',
    className,
    onFocus,
    onBlur,
    ...props
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
    };

    const variants = {
        default: 'bg-white/10 border border-white/20 focus:border-white/40',
        glass: 'bg-white/5 backdrop-blur-xl border border-white/20 focus:border-white/40',
        floating: 'bg-transparent border-b border-white/30 focus:border-white/60',
    };

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

    const animationConfig = accessibility.getAccessibleAnimation(formAnimations);

    return (
        <div className="relative">
            {/* 浮动标签 */}
            {label && variant === 'floating' && (
                <motion.label
                    className={cn(
                        'absolute left-0 text-white/70 pointer-events-none transition-colors duration-200',
                        isFocused && 'text-white'
                    )}
                    animate={
                        isFocused || hasValue
                            ? formAnimations.labelFloat
                            : { y: 0, scale: 1 }
                    }
                    transition={animationConfig.transition}
                    style={{
                        top: isFocused || hasValue ? '-8px' : '12px',
                        fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
                    }}
                >
                    {label}
                </motion.label>
            )}

            {/* 普通标签 */}
            {label && variant !== 'floating' && (
                <motion.label
                    className="block text-sm font-medium text-white/90 mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {label}
                </motion.label>
            )}

            {/* 输入框 */}
            <motion.input
                ref={inputRef}
                className={cn(
                    'w-full px-4 py-3 rounded-lg text-white placeholder-white/80',
                    'focus:outline-none focus:ring-2 focus:ring-white/30',
                    'transition-all duration-200',
                    variants[variant],
                    error && 'border-red-400 focus:border-red-400 focus:ring-red-400/30',
                    className
                )}
                placeholder={variant === 'floating' ? (isFocused || hasValue ? '' : label) : props.placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                animate={
                    isFocused
                        ? formAnimations.inputFocus
                        : formAnimations.inputBlur
                }
                transition={animationConfig.transition}
                {...safeProps}
            />

            {/* 错误信息 */}
            {error && (
                <motion.div
                    className="mt-2 text-sm text-red-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.div>
            )}

            {/* 错误震动效果 */}
            {error && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ x: formAnimations.errorShake.x as any }}
                    transition={animationConfig.transition}
                />
            )}
        </div>
    );
}

// 液态玻璃输入框
export function LiquidGlassInput({
    children: _children,
    className,
    ...props
}: AnimatedInputProps) {
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
    return (
        <AnimatedInput
            variant="glass"
            className={cn(
                'backdrop-blur-xl bg-white/5 border-white/20',
                'focus:bg-white/10 focus:border-white/40',
                className
            )}
            {...safeProps}
        />
    );
}
