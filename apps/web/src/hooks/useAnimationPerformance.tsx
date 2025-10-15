/**
 * 动画性能监控Hook
 */

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isDroppingFrames: boolean;
}

export function useAnimationPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isDroppingFrames: false,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const measurePerformance = (currentTime: number) => {
      frameCount.current++;

      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );
        const frameTime = 1000 / fps;
        const isDroppingFrames = fps < 30;

        setMetrics({
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          isDroppingFrames,
        });

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId.current = requestAnimationFrame(measurePerformance);
    };

    animationId.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return metrics;
}

// 动画性能警告组件
export function AnimationPerformanceWarning() {
  const metrics = useAnimationPerformance();

  if (!metrics.isDroppingFrames) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-500/90 text-black p-3 rounded-lg shadow-lg z-50">
      <div className="text-sm font-medium">⚠️ 动画性能警告</div>
      <div className="text-xs mt-1">
        FPS: {metrics.fps} | 帧时间: {metrics.frameTime}ms
      </div>
    </div>
  );
}
