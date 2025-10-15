import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassText } from './liquid-glass-text';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  // 密码强度检查逻辑
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    return { score, checks };
  };

  const { score, checks } = getPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'text-red-400';
    if (score <= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return '弱';
    if (score <= 3) return '中等';
    return '强';
  };

  if (!password) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'absolute left-full ml-4 top-0 w-64 p-4 rounded-lg',
          'bg-white/5 backdrop-blur-xl border border-white/20',
          'shadow-2xl',
          className
        )}
      >
        {/* 密码强度条 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <LiquidGlassText className="text-sm font-medium">
              密码强度
            </LiquidGlassText>
            <LiquidGlassText
              className={cn('text-sm font-bold', getStrengthColor(score))}
            >
              {getStrengthText(score)}
            </LiquidGlassText>
          </div>
          <div className="w-full bg-gray-200/20 rounded-full h-2">
            <motion.div
              className={cn('h-2 rounded-full transition-all duration-300', {
                'bg-red-400': score <= 2,
                'bg-yellow-400': score === 3,
                'bg-green-400': score >= 4,
              })}
              initial={{ width: 0 }}
              animate={{ width: `${(score / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 密码要求列表 */}
        <div className="space-y-2">
          {Object.entries(checks).map(([key, met]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div
                className={cn('w-2 h-2 rounded-full', {
                  'bg-green-400': met,
                  'bg-gray-400': !met,
                })}
              />
              <LiquidGlassText className="text-xs">
                {key === 'length' && '至少8位'}
                {key === 'uppercase' && '大写字母'}
                {key === 'lowercase' && '小写字母'}
                {key === 'number' && '数字'}
                {key === 'special' && '特殊字符'}
              </LiquidGlassText>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
