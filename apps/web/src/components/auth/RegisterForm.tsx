// 注册表单组件

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LiquidGlassButton } from '@/components/ui/animated-button';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedLiquidGlassCard } from '@/components/ui/enhanced-liquid-glass';
import { AnimatedInput } from '@/components/ui/animated-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';

import { useAuthStore } from '@/store/auth';
import { RegisterData } from '@/types/auth';


// 表单验证模式
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, '请输入姓名')
      .min(2, '姓名至少2个字符')
      .max(50, '姓名不能超过50个字符'),
    email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(1, '请输入密码')
      .min(8, '密码至少8位')
      .regex(/[a-z]/, '密码必须包含小写字母')
      .regex(/[A-Z]/, '密码必须包含大写字母')
      .regex(/\d/, '密码必须包含数字')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, '密码必须包含特殊字符'),
    confirmPassword: z.string().min(1, '请确认密码'),
    agreeToTerms: z.boolean().refine(val => val === true, '请同意服务条款'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({
  onSuccess,
  redirectTo = '/dashboard',
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
    confirmAutoLogin,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');
  const agreeToTerms = watch('agreeToTerms');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();

      const registerData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      await registerUser(registerData);

      // 注册成功，显示确认对话框
      // 使用setTimeout确保状态更新完成后再显示对话框
      setTimeout(() => {
        setShowLoginDialog(true);
      }, 100);
    } catch (error: unknown) {
      console.error('注册错误:', error);

      // 处理特定错误
      if (error.message.includes('邮箱') || error.message.includes('已存在')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('密码')) {
        setError('password', { message: error.message });
      } else if (error.message.includes('姓名')) {
        setError('name', { message: error.message });
      } else if (error.message.includes('无法连接到服务器')) {
        setError('root', { message: '无法连接到服务器，请检查网络连接' });
      } else if (error.message.includes('请求超时')) {
        setError('root', { message: '请求超时，请稍后重试' });
      } else if (error.message.includes('服务器内部错误')) {
        setError('root', { message: '服务器内部错误，请稍后重试' });
      } else {
        setError('root', { message: error.message || '注册失败，请重试' });
      }
    }
  };


  // 处理用户选择自动登录
  const handleAutoLogin = () => {
    setShowLoginDialog(false);
    confirmAutoLogin(); // 确认自动登录
    if (onSuccess) {
      onSuccess();
    } else {
      navigate(redirectTo);
    }
  };

  // 处理用户选择手动登录
  const handleManualLogin = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  return (
    <div className="relative">
      <EnhancedLiquidGlassCard className="w-full max-w-lg mx-auto" size="lg" hover>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white drop-shadow-lg">注册</CardTitle>
          <CardDescription className="text-center text-white/90 drop-shadow-md">
            创建您的新账户以开始使用我们的服务
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
              id="name"
              type="text"
              label="姓名"
              placeholder="请输入您的姓名"
              variant="glass"
              error={errors.name?.message}
              {...register('name')}
            />

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



            <div className="relative">
              <AnimatedInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="确认密码"
                placeholder="请再次输入密码"
                variant="glass"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-10 h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-white/70" />
                ) : (
                  <Eye className="h-5 w-5 text-white/70" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={checked => setValue('agreeToTerms', !!checked)}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed text-white/90 drop-shadow-sm">
                  我同意{' '}
                  <Link to="/terms" className="text-cyan-300 hover:text-cyan-500 hover:underline drop-shadow-md font-medium transition-colors duration-200">
                    服务条款
                  </Link>{' '}
                  和{' '}
                  <Link to="/privacy" className="text-cyan-300 hover:text-cyan-500 hover:underline drop-shadow-md font-medium transition-colors duration-200">
                    隐私政策
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            <LiquidGlassButton
              type="submit"
              className="w-full"
              variant="glass-primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '创建账户'}
            </LiquidGlassButton>

            <div className="text-center text-sm text-white/90 drop-shadow-sm">
              已有账户？{' '}
              <Link
                to="/login"
                className="text-cyan-300 hover:text-cyan-500 hover:underline drop-shadow-md font-medium transition-colors duration-200"
              >
                立即登录
              </Link>
            </div>
          </form>
        </CardContent>

        {/* 注册成功确认对话框 */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">注册成功！</DialogTitle>
              <DialogDescription className="text-center">
                您的账户已成功创建。您希望现在自动登录吗？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleManualLogin}
                className="w-full sm:w-auto"
              >
                手动登录
              </Button>
              <Button onClick={handleAutoLogin} className="w-full sm:w-auto">
                自动登录
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </EnhancedLiquidGlassCard>

      {/* 密码强度指示器 */}
      <PasswordStrengthIndicator password={password} />
    </div>
  );
}
