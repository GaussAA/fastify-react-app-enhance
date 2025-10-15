/**
 * 动画测试页面 - 用于验证所有动画效果
 */

import { useState } from 'react';
import { AnimatedPage } from '@/components/ui/animated-page';
import {
  EnhancedLiquidGlass,
  EnhancedLiquidGlassCard,
} from '@/components/ui/enhanced-liquid-glass';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedInput } from '@/components/ui/animated-input';
import { LoginSuccessTransition } from '@/components/ui/login-success-transition';
import { useLoginSuccess } from '@/hooks/useLoginSuccess';
import {
  AnimationDemo,
  TransitionTester,
} from '@/components/ui/animation-demo';
import { AnimationErrorBoundary } from '@/components/ui/animation-error-boundary';
import { AnimationPerformanceWarning } from '@/hooks/useAnimationPerformance';
import { animationTestSuite } from '@/utils/animation-test-suite';

export function AnimationTestPage() {
  const [currentTransition, setCurrentTransition] = useState<
    'fadeIn' | 'slideInFromLeft' | 'slideInFromRight' | 'scaleIn'
  >('fadeIn');
  const [showTransitionDemo, setShowTransitionDemo] = useState(false);
  const loginSuccess = useLoginSuccess();

  // const transitions = [
  //     { key: 'fadeIn', label: '淡入效果' },
  //     { key: 'slideInFromLeft', label: '从左滑入' },
  //     { key: 'slideInFromRight', label: '从右滑入' },
  //     { key: 'scaleIn', label: '缩放效果' },
  // ] as const;

  const handleTestLoginSuccess = () => {
    loginSuccess.show();
  };

  const handleRunTests = () => {
    const results = animationTestSuite.runAllTests();
    const report = animationTestSuite.getTestReport();

    console.log('🎬 动画系统测试完成');
    console.log(`结果: ${report.summary}`);
    console.log('详细结果:', results);

    // 可以在这里添加UI反馈
    alert(`测试完成！\n${report.summary}\n\n详细结果请查看控制台`);
  };

  const handleTransitionChange = (transition: typeof currentTransition) => {
    setCurrentTransition(transition);
    setShowTransitionDemo(true);

    // 短暂延迟后隐藏演示，避免状态冲突
    setTimeout(() => {
      setShowTransitionDemo(false);
    }, 3000);
  };

  return (
    <AnimationErrorBoundary>
      <AnimatedPage
        className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8"
        transition="fadeIn"
        enableProgressiveLoading={true}
        staggerDelay={100}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
            动画效果测试页面
          </h1>

          {/* 页面转场动画测试 */}
          <EnhancedLiquidGlassCard className="mb-8 p-6" size="lg" hover>
            <h2 className="text-2xl font-bold text-white mb-4">页面转场动画</h2>

            <TransitionTester
              onTransitionChange={handleTransitionChange}
              currentTransition={currentTransition}
            />

            {/* 动画演示区域 */}
            {showTransitionDemo && (
              <AnimationDemo transition={currentTransition} className="mt-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/80 text-sm mb-2">动画演示:</p>
                  <div className="h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-white/60 text-sm">
                      动画效果演示区域
                    </span>
                  </div>
                </div>
              </AnimationDemo>
            )}
          </EnhancedLiquidGlassCard>

          {/* 液态玻璃效果测试 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <EnhancedLiquidGlass className="p-4" size="md" hover>
              <h3 className="text-lg font-semibold text-white mb-2">
                基础效果
              </h3>
              <p className="text-white/80 text-sm">悬停时有轻微上浮效果</p>
            </EnhancedLiquidGlass>

            <EnhancedLiquidGlass className="p-4" size="md" shimmer>
              <h3 className="text-lg font-semibold text-white mb-2">
                闪烁效果
              </h3>
              <p className="text-white/80 text-sm">持续的光泽流动效果</p>
            </EnhancedLiquidGlass>

            <EnhancedLiquidGlass className="p-4" size="md" glow>
              <h3 className="text-lg font-semibold text-white mb-2">
                发光效果
              </h3>
              <p className="text-white/80 text-sm">柔和的发光动画</p>
            </EnhancedLiquidGlass>
          </div>

          {/* 表单动画测试 */}
          <EnhancedLiquidGlassCard className="mb-8 p-6" size="lg">
            <h2 className="text-2xl font-bold text-white mb-4">表单动画</h2>
            <div className="space-y-4">
              <AnimatedInput
                label="邮箱地址"
                placeholder="请输入邮箱"
                variant="glass"
              />
              <AnimatedInput
                label="密码"
                type="password"
                placeholder="请输入密码"
                variant="glass"
              />
              <AnimatedButton
                onClick={handleTestLoginSuccess}
                variant="primary"
                className="w-full"
              >
                测试登录成功动画
              </AnimatedButton>
            </div>
          </EnhancedLiquidGlassCard>

          {/* 按钮动画测试 */}
          <EnhancedLiquidGlassCard className="mb-8 p-6" size="lg">
            <h2 className="text-2xl font-bold text-white mb-4">按钮动画</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatedButton variant="default">默认按钮</AnimatedButton>
              <AnimatedButton variant="primary">主要按钮</AnimatedButton>
              <AnimatedButton variant="secondary">次要按钮</AnimatedButton>
              <AnimatedButton variant="ghost">幽灵按钮</AnimatedButton>
            </div>
          </EnhancedLiquidGlassCard>

          {/* 系统测试 */}
          <EnhancedLiquidGlassCard className="p-6" size="lg">
            <h2 className="text-2xl font-bold text-white mb-4">系统测试</h2>
            <div className="space-y-4">
              <p className="text-white/80 text-sm">
                运行完整的动画系统测试，验证所有组件和功能是否正常工作。
              </p>
              <div className="flex gap-4">
                <AnimatedButton
                  onClick={handleRunTests}
                  variant="primary"
                  className="flex-1"
                >
                  运行系统测试
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleTestLoginSuccess}
                  variant="secondary"
                  className="flex-1"
                >
                  测试登录成功动画
                </AnimatedButton>
              </div>
              <p className="text-white/60 text-xs">
                测试结果将在控制台中显示，请打开开发者工具查看详细信息。
              </p>
            </div>
          </EnhancedLiquidGlassCard>
        </div>

        {/* 登录成功动画 */}
        <LoginSuccessTransition
          isVisible={loginSuccess.isVisible}
          onComplete={loginSuccess.onAnimationComplete}
          variant="expand"
          className="fixed inset-0 z-50"
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              动画测试成功！
            </h2>
            <p className="text-white/80 text-xl">所有动画效果都正常工作</p>
          </div>
        </LoginSuccessTransition>

        {/* 性能监控 */}
        <AnimationPerformanceWarning />
      </AnimatedPage>
    </AnimationErrorBoundary>
  );
}
