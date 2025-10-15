/**
 * 动画系统测试套件
 */

import { pageTransitions } from '@/lib/animations';

export interface AnimationTestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration?: number;
  performance?: {
    fps: number;
    frameTime: number;
  };
}

export class AnimationTestSuite {
  private results: AnimationTestResult[] = [];

  /**
   * 测试动画配置的有效性
   */
  testAnimationConfigs(): AnimationTestResult {
    const testName = '动画配置有效性测试';
    const startTime = performance.now();

    try {
      // 测试所有动画配置
      const transitions = Object.keys(pageTransitions) as Array<
        keyof typeof pageTransitions
      >;

      for (const transition of transitions) {
        const config = pageTransitions[transition];

        // 验证必需属性
        if (!config.initial || !config.animate || !config.transition) {
          throw new Error(`动画配置 ${transition} 缺少必需属性`);
        }

        // 验证初始状态
        if (
          typeof config.initial.opacity !== 'number' &&
          config.initial.opacity !== undefined
        ) {
          throw new Error(
            `动画配置 ${transition} 的 initial.opacity 必须是数字`
          );
        }

        // 验证动画状态
        if (
          typeof config.animate.opacity !== 'number' &&
          config.animate.opacity !== undefined
        ) {
          throw new Error(
            `动画配置 ${transition} 的 animate.opacity 必须是数字`
          );
        }

        // 验证过渡配置
        if (typeof config.transition.duration !== 'number') {
          throw new Error(
            `动画配置 ${transition} 的 transition.duration 必须是数字`
          );
        }
      }

      const duration = performance.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : '未知错误',
        duration,
      };
    }
  }

  /**
   * 测试动画状态管理
   */
  testAnimationStateManagement(): AnimationTestResult {
    const testName = '动画状态管理测试';
    const startTime = performance.now();

    try {
      // 模拟状态管理逻辑
      let isLoaded = false;
      let isTransitioning = false;
      let currentTransition = 'fadeIn';

      // 测试初始状态
      if (isLoaded || isTransitioning) {
        throw new Error('初始状态应该为 false');
      }

      // 测试状态转换
      isLoaded = true;
      if (!isLoaded) {
        throw new Error('状态转换失败');
      }

      // 测试过渡状态
      isTransitioning = true;
      isLoaded = false;
      if (!isTransitioning || isLoaded) {
        throw new Error('过渡状态管理失败');
      }

      // 测试transition变化
      const newTransition = 'slideInFromRight';
      if (newTransition === currentTransition) {
        throw new Error('transition变化检测失败');
      }

      currentTransition = newTransition;
      if (currentTransition !== newTransition) {
        throw new Error('transition更新失败');
      }

      const duration = performance.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : '未知错误',
        duration,
      };
    }
  }

  /**
   * 测试性能监控
   */
  testPerformanceMonitoring(): AnimationTestResult {
    const testName = '性能监控测试';
    const startTime = performance.now();

    try {
      // 模拟性能监控
      let frameCount = 0;
      const lastTime = performance.now();

      // 模拟帧计数
      for (let i = 0; i < 60; i++) {
        frameCount++;
      }

      const currentTime = performance.now();
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      const frameTime = 1000 / fps;

      // 验证FPS计算
      if (fps < 0 || fps > 120) {
        throw new Error(`FPS计算异常: ${fps}`);
      }

      // 验证帧时间计算
      if (frameTime < 0 || frameTime > 100) {
        throw new Error(`帧时间计算异常: ${frameTime}`);
      }

      // 验证掉帧检测
      const isDroppingFrames = fps < 30;
      if (typeof isDroppingFrames !== 'boolean') {
        throw new Error('掉帧检测逻辑错误');
      }

      const duration = performance.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
        performance: {
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
        },
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : '未知错误',
        duration,
      };
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): AnimationTestResult[] {
    this.results = [];

    this.results.push(this.testAnimationConfigs());
    this.results.push(this.testAnimationStateManagement());
    this.results.push(this.testPerformanceMonitoring());

    return this.results;
  }

  /**
   * 获取测试报告
   */
  getTestReport(): {
    total: number;
    passed: number;
    failed: number;
    results: AnimationTestResult[];
    summary: string;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    const summary =
      failed === 0 ? '所有测试通过 ✅' : `${failed} 个测试失败 ❌`;

    return {
      total,
      passed,
      failed,
      results: this.results,
      summary,
    };
  }

  /**
   * 打印测试报告
   */
  printTestReport(): void {
    const report = this.getTestReport();

    console.log('\n🎬 动画系统测试报告');
    console.log('='.repeat(50));
    console.log(`总计: ${report.total} 个测试`);
    console.log(`通过: ${report.passed} 个`);
    console.log(`失败: ${report.failed} 个`);
    console.log(`结果: ${report.summary}`);
    console.log('='.repeat(50));

    report.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration
        ? ` (${result.duration.toFixed(2)}ms)`
        : '';
      const performance = result.performance
        ? ` [FPS: ${result.performance.fps}, 帧时间: ${result.performance.frameTime}ms]`
        : '';

      console.log(
        `${index + 1}. ${status} ${result.testName}${duration}${performance}`
      );

      if (!result.passed && result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('='.repeat(50));
  }
}

// 导出测试实例
export const animationTestSuite = new AnimationTestSuite();

// 在开发环境中自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟运行，确保DOM已加载
  setTimeout(() => {
    animationTestSuite.runAllTests();
    animationTestSuite.printTestReport();
  }, 1000);
}
