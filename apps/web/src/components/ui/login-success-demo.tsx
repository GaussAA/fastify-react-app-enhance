/**
 * 登录成功转场动画演示组件
 * 展示各种登录成功动画效果
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LoginSuccessTransition,
  LoginSuccessPage,
  LoginSuccessCard,
} from './login-success-transition';
import { useLoginSuccess } from '@/hooks/useLoginSuccess';
import { AnimatedButton } from './animated-button';

export function LoginSuccessDemo() {
  const [currentVariant, setCurrentVariant] = useState<
    'expand' | 'slide' | 'flip' | 'zoom'
  >('expand');
  const loginSuccess = useLoginSuccess();

  const variants = [
    { key: 'expand', label: '展开动画', description: '3D翻转展开效果' },
    { key: 'slide', label: '滑动动画', description: '从下方滑入效果' },
    { key: 'flip', label: '翻转动画', description: 'X轴翻转效果' },
    { key: 'zoom', label: '缩放动画', description: '弹性缩放效果' },
  ] as const;

  const handleShowAnimation = (variant: typeof currentVariant) => {
    setCurrentVariant(variant);
    loginSuccess.show();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            登录成功转场动画演示
          </h1>
          <p className="text-white/80">体验各种登录成功动画效果</p>
        </motion.div>

        {/* 动画选择器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {variants.map(variant => (
            <motion.div
              key={variant.key}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {variant.label}
              </h3>
              <p className="text-white/70 text-sm mb-4">
                {variant.description}
              </p>
              <AnimatedButton
                onClick={() => handleShowAnimation(variant.key)}
                className="w-full"
                variant="primary"
                size="sm"
              >
                体验动画
              </AnimatedButton>
            </motion.div>
          ))}
        </div>

        {/* 当前动画效果展示 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            当前效果：{variants.find(v => v.key === currentVariant)?.label}
          </h2>
          <p className="text-white/70">
            {variants.find(v => v.key === currentVariant)?.description}
          </p>
        </div>

        {/* 登录成功动画 */}
        <LoginSuccessTransition
          isVisible={loginSuccess.isVisible}
          onComplete={loginSuccess.onAnimationComplete}
          variant={currentVariant}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="text-center max-w-md mx-auto p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 登录成功！
            </h2>
            <p className="text-white/80 mb-6">
              欢迎回来，正在为您准备个性化体验...
            </p>
            <div className="flex justify-center space-x-4">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </LoginSuccessTransition>

        {/* 使用说明 */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">使用说明</h3>
          <div className="space-y-3 text-white/80">
            <p>
              • <strong>展开动画</strong>：3D翻转展开，适合页面级别的转场
            </p>
            <p>
              • <strong>滑动动画</strong>：从下方滑入，适合卡片级别的转场
            </p>
            <p>
              • <strong>翻转动画</strong>：X轴翻转，适合模态框级别的转场
            </p>
            <p>
              • <strong>缩放动画</strong>：弹性缩放，适合按钮级别的转场
            </p>
          </div>
        </motion.div>

        {/* 技术特性 */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">技术特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
            <div>
              <h4 className="font-semibold text-white mb-2">动画效果</h4>
              <ul className="space-y-1 text-sm">
                <li>• 60fps 流畅动画</li>
                <li>• 硬件加速渲染</li>
                <li>• 弹性缓动函数</li>
                <li>• 粒子效果增强</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">用户体验</h4>
              <ul className="space-y-1 text-sm">
                <li>• 可访问性支持</li>
                <li>• 响应式设计</li>
                <li>• 状态管理</li>
                <li>• 错误处理</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
