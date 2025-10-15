/**
 * 登录成功状态管理Hook
 * 管理登录成功后的转场动画状态
 */

import { useState, useCallback } from 'react';

interface LoginSuccessState {
  isVisible: boolean;
  isAnimating: boolean;
  hasCompleted: boolean;
}

interface LoginSuccessActions {
  show: () => void;
  hide: () => void;
  onAnimationComplete: () => void;
  reset: () => void;
}

export function useLoginSuccess(): LoginSuccessState & LoginSuccessActions {
  const [state, setState] = useState<LoginSuccessState>({
    isVisible: false,
    isAnimating: false,
    hasCompleted: false,
  });

  const show = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      isAnimating: true,
      hasCompleted: false,
    }));
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      isAnimating: false,
    }));
  }, []);

  const onAnimationComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAnimating: false,
      hasCompleted: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isVisible: false,
      isAnimating: false,
      hasCompleted: false,
    });
  }, []);

  return {
    ...state,
    show,
    hide,
    onAnimationComplete,
    reset,
  };
}
