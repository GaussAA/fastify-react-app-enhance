// 用户资料组件

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Edit,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';

// 表单验证模式
const profileSchema = z.object({
    name: z
        .string()
        .min(1, '请输入姓名')
        .min(2, '姓名至少2个字符')
        .max(50, '姓名不能超过50个字符'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^1[3-9]\d{9}$/.test(val), '请输入有效的手机号码'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileProps {
    onUpdate?: () => void;
}

export function UserProfile({ onUpdate }: UserProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { user, updateUser } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await apiClient.updateUser(user.id, {
                name: data.name,
                phone: data.phone,
            });

            if (response.success && response.data) {
                updateUser(response.data.user);
                setIsEditing(false);
                setSuccess('资料更新成功');
                onUpdate?.();
            }
        } catch (error: any) {
            setError(error.message || '更新失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        用户信息加载中...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* 用户头像和基本信息 - 紧凑布局 */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>个人资料</span>
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                                管理您的个人信息和账户设置
                            </CardDescription>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                <Edit className="mr-1 h-3 w-3" />
                                编辑
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                    {/* 头像区域 - 紧凑设计 */}
                    <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2 ring-blue-200 ring-offset-2">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant={user.isActive ? 'default' : 'secondary'}
                                    className={`text-xs px-2 py-0.5 ${user.isActive
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    {user.isActive ? '活跃' : '非活跃'}
                                </Badge>
                                <Badge
                                    variant={user.isVerified ? 'default' : 'outline'}
                                    className={`text-xs px-2 py-0.5 ${user.isVerified
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-red-100 text-red-800 border-red-200'
                                        }`}
                                >
                                    {user.isVerified ? '已验证' : '未验证'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* 编辑表单 - 内联编辑 */}
                    {isEditing ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="py-2 border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-sm text-green-800">{success}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">姓名</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        className={`h-9 text-sm ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                        placeholder="请输入姓名"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">手机号码</Label>
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="请输入手机号码"
                                        className={`h-9 text-sm ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            保存中...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-1 h-3 w-3" />
                                            保存
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                >
                                    <X className="mr-1 h-3 w-3" />
                                    取消
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-500">姓名</Label>
                                <p className="text-sm text-gray-900 font-medium">{user.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-500">手机号码</Label>
                                <p className="text-sm text-gray-900">{user.phone || '未设置'}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 账户信息和权限 - 合并紧凑布局 */}
            <Card className="bg-white border-slate-200 shadow-sm flex-1">
                <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span>账户信息与权限</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 space-y-6">
                    {/* 账户信息网格 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>邮箱地址</span>
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>手机号码</span>
                            </Label>
                            <p className="text-sm text-gray-900">{user.phone || '未设置'}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>注册时间</span>
                            </Label>
                            <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>最后登录</span>
                            </Label>
                            <p className="text-sm text-gray-900">
                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* 角色和权限 */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">角色</Label>
                            <div className="flex flex-wrap gap-2">
                                {user.roles?.map((role) => (
                                    <Badge
                                        key={role.id}
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1"
                                    >
                                        {role.displayName}
                                    </Badge>
                                )) || <span className="text-sm text-gray-500">无角色</span>}
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">权限</Label>
                            <div className="flex flex-wrap gap-2">
                                {user.permissions?.map((permission) => (
                                    <Badge
                                        key={permission.id}
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                                    >
                                        {permission.resource}:{permission.action}
                                    </Badge>
                                )) || <span className="text-sm text-gray-500">无权限</span>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
