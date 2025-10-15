import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidGlassTextProps {
  children: React.ReactNode;
  className?: string;
}

export function LiquidGlassText({ children, className }: LiquidGlassTextProps) {
  return (
    <motion.span
      className={cn(
        'inline-block', // 必须是 inline-block 或 block 才能让 background-clip: text 生效
        'bg-gradient-to-br from-white/90 via-white/60 to-white/90', // 液态玻璃的背景渐变，可以调整透明度
        'bg-clip-text text-transparent', // 将背景裁剪到文字，并使文字本身透明
        'drop-shadow-lg', // 保持文字的阴影效果，增加立体感
        className
      )}
      // 可以根据需要添加 Framer Motion 的动画属性
    >
      {children}
    </motion.span>
  );
}
