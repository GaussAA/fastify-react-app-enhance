// 登录表单组件

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedLiquidGlassCard } from '@/components/ui/enhanced-liquid-glass';
import { LiquidGlassButton } from '@/components/ui/animated-button';
import { AnimatedInput } from '@/components/ui/animated-input';

import { useAuthStore } from '@/store/auth';
import { LoginData } from '@/types/auth';
import { useLoginSuccess } from '@/hooks/useLoginSuccess';
import { LoginSuccessTransition } from '@/components/ui/login-success-transition';

// 表单验证模式
const loginSchema = z.object({
  email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码').min(8, '密码至少8位'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const loginSuccess = useLoginSuccess();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();

      const loginData: LoginData = {
        email: data.email,
        password: data.password,
      };

      await login(loginData);

      // 显示登录成功动画
      loginSuccess.show();

      // 延迟导航，让动画完成
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      }, 1000);
    } catch (error: unknown) {
      console.error('登录错误:', error);

      // 处理特定错误
      if (error.message.includes('邮箱') || error.message.includes('用户不存在')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('密码') || error.message.includes('密码错误')) {
        setError('password', { message: error.message });
      } else if (error.message.includes('无法连接到服务器')) {
        setError('root', { message: '无法连接到服务器，请检查网络连接' });
      } else if (error.message.includes('请求超时')) {
        setError('root', { message: '请求超时，请稍后重试' });
      } else if (error.message.includes('服务器内部错误')) {
        setError('root', { message: '服务器内部错误，请稍后重试' });
      } else {
        setError('root', { message: error.message || '登录失败，请重试' });
      }
    }
  };

  return (
    <>
      {/* 登录成功动画 */}
      <LoginSuccessTransition
        isVisible={loginSuccess.isVisible}
        onComplete={loginSuccess.onAnimationComplete}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">登录成功！</h2>
          <p className="text-white/80">正在跳转到主页面...</p>
        </div>
      </LoginSuccessTransition>

      <EnhancedLiquidGlassCard className="w-full max-w-lg mx-auto" size="lg" hover>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white drop-shadow-lg">登录</CardTitle>
          <CardDescription className="text-center text-white/90 drop-shadow-md">
            输入您的邮箱和密码以登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AnimatedInput
              id="email"
              type="email"
              label="邮箱地址"
              placeholder="请输入邮箱地址"
              variant="glass"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <AnimatedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="密码"
                placeholder="请输入密码"
                variant="glass"
                error={errors.password?.message}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-10 h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/70" />
                ) : (
                  <Eye className="h-5 w-5 text-white/70" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <Label htmlFor="rememberMe" className="text-sm text-white/90 drop-shadow-sm">
                  记住我
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-cyan-300 hover:text-cyan-500 hover:underline drop-shadow-md font-medium transition-colors duration-200"
              >
                忘记密码？
              </Link>
            </div>

            <LiquidGlassButton
              type="submit"
              className="w-full"
              variant="glass-primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </LiquidGlassButton>

            <div className="text-center text-sm text-white/90 drop-shadow-sm">
              还没有账户？{' '}
              <Link
                to="/register"
                className="text-cyan-300 hover:text-cyan-500 hover:underline drop-shadow-md font-medium transition-colors duration-200"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </EnhancedLiquidGlassCard>
    </>
  );
}
