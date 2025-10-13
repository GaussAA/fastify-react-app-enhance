// 注册表单组件

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
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

import { useAuthStore } from '@/store/auth';
import { RegisterData } from '@/types/auth';

// 密码强度检查
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.values(checks).forEach(check => {
    if (check) score++;
  });

  return { score, checks };
};

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
  const passwordStrength = getPasswordStrength(password || '');

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
    } catch (error: any) {
      // 处理特定错误
      if (error.message.includes('邮箱')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('密码')) {
        setError('password', { message: error.message });
      } else if (error.message.includes('姓名')) {
        setError('name', { message: error.message });
      }
    }
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return '弱';
    if (score <= 3) return '中等';
    if (score <= 4) return '强';
    return '很强';
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">注册</CardTitle>
        <CardDescription className="text-center">
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

          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入您的姓名"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱地址"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* 密码强度指示器 */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(passwordStrength.checks).map(
                    ([key, passed]) => (
                      <div key={key} className="flex items-center space-x-1">
                        {passed ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-gray-300" />
                        )}
                        <span
                          className={
                            passed ? 'text-green-600' : 'text-gray-500'
                          }
                        >
                          {key === 'length' && '至少8位'}
                          {key === 'lowercase' && '小写字母'}
                          {key === 'uppercase' && '大写字母'}
                          {key === 'number' && '数字'}
                          {key === 'special' && '特殊字符'}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="请再次输入密码"
                {...register('confirmPassword')}
                className={
                  errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={checked => setValue('agreeToTerms', !!checked)}
                className="mt-1"
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                我同意{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              '创建账户'
            )}
          </Button>

          <div className="text-center text-sm">
            已有账户？{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 hover:underline"
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
    </Card>
  );
}
