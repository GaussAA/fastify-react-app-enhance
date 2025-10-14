/**
 * 动画错误边界组件 - 用于捕获和处理动画相关的错误
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class AnimationErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('动画错误边界捕获到错误:', error, errorInfo);

        // 调用错误处理回调
        this.props.onError?.(error, errorInfo);

        // 可以在这里添加错误上报逻辑
        // reportError(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 渲染错误UI
            return this.props.fallback || (
                <div className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center p-8">
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8 max-w-md mx-auto text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">动画加载错误</h2>
                        <p className="text-white/80 mb-6">
                            动画组件遇到了问题，但页面仍然可以正常使用。
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            重试
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook版本，用于函数组件
export function useAnimationErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const handleError = React.useCallback((error: Error) => {
        console.error('动画错误:', error);
        setError(error);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
}
