/**
 * 动画效果展示组件
 * 展示所有可用的动画效果
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from './animated-button';
import { AnimatedInput } from './animated-input';
import { EnhancedLiquidGlass } from './enhanced-liquid-glass';
import { LoginSuccessTransition } from './page-transition-manager';

export function AnimationShowcase() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleButtonClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* 标题 */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                >
                    <h1 className="text-4xl font-bold text-white mb-4">动画效果展示</h1>
                    <p className="text-white/80">体验精致流畅的动画效果</p>
                </motion.div>

                {/* 按钮动画展示 */}
                <EnhancedLiquidGlass className="p-6" glow>
                    <h2 className="text-2xl font-semibold text-white mb-4">按钮动画效果</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AnimatedButton
                            variant="primary"
                            size="lg"
                            loading={loading}
                            onClick={handleButtonClick}
                        >
                            点击体验波纹效果
                        </AnimatedButton>

                        <AnimatedButton variant="default" size="md">
                            悬停缩放效果
                        </AnimatedButton>

                        <AnimatedButton variant="ghost" size="sm">
                            按压反馈效果
                        </AnimatedButton>
                    </div>
                </EnhancedLiquidGlass>

                {/* 输入框动画展示 */}
                <EnhancedLiquidGlass className="p-6" shimmer>
                    <h2 className="text-2xl font-semibold text-white mb-4">输入框动画效果</h2>
                    <div className="space-y-4">
                        <AnimatedInput
                            label="邮箱地址"
                            placeholder="请输入邮箱地址"
                            variant="glass"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />

                        <AnimatedInput
                            label="浮动标签"
                            placeholder=""
                            variant="floating"
                        />

                        <AnimatedInput
                            label="错误状态"
                            placeholder="触发错误动画"
                            variant="glass"
                            error="这是一个错误提示，会触发震动效果"
                        />
                    </div>
                </EnhancedLiquidGlass>

                {/* 液态玻璃效果展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EnhancedLiquidGlass className="p-6" hover>
                        <h3 className="text-xl font-semibold text-white mb-2">悬停效果</h3>
                        <p className="text-white/80">鼠标悬停查看效果</p>
                    </EnhancedLiquidGlass>

                    <EnhancedLiquidGlass className="p-6" glow>
                        <h3 className="text-xl font-semibold text-white mb-2">发光效果</h3>
                        <p className="text-white/80">持续的发光动画</p>
                    </EnhancedLiquidGlass>
                </div>

                {/* 登录成功动画 */}
                <LoginSuccessTransition isVisible={showSuccess} className="p-6">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">登录成功！</h3>
                        <p className="text-white/80">欢迎使用我们的服务</p>
                    </div>
                </LoginSuccessTransition>

                {/* 渐进式加载动画 */}
                <EnhancedLiquidGlass className="p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">渐进式加载动画</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((item, index) => (
                            <motion.div
                                key={item}
                                className="bg-white/10 rounded-lg p-4"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: 'cubic-bezier(0, 0, 0.2, 1)'
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">{item}</span>
                                    </div>
                                    <span className="text-white">项目 {item}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </EnhancedLiquidGlass>
            </div>
        </div>
    );
}
