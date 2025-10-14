// 登录页面

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { LiquidGlassText } from '@/components/ui/liquid-glass-text';
import { AnimatedPage } from '@/components/ui/animated-page';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AnimatedPage
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      transition="fadeIn"
      enableProgressiveLoading={true}
      staggerDelay={150}
      style={{
        backgroundImage: "url('/images/auth/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 via-indigo-900/10 to-purple-900/15" />

      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 ml-32">
        {/* 标题区域 - 液态玻璃文字效果 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <LiquidGlassText>欢迎回来</LiquidGlassText>
          </h1>
          <p className="text-lg">
            <LiquidGlassText>登录您的账户以继续使用我们的服务</LiquidGlassText>
          </p>
        </div>

        {/* 登录表单 */}
        <LoginForm />
      </div>
    </AnimatedPage>
  );
}
