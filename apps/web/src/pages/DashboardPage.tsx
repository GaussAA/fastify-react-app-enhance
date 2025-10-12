// 仪表板页面

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserProfile } from '@/components/auth/UserProfile';
import { RoleManagement } from '@/components/auth/RoleManagement';
import { LLMPage } from './LLMPage';
import {
    LayoutDashboard,
    Users,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    Brain
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        if (confirm('确定要退出登录吗？')) {
            await logout();
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const tabs = [
        { id: 'dashboard', label: '仪表板', icon: LayoutDashboard, permission: null },
        { id: 'llm', label: 'AI助手', icon: Brain, permission: null },
        { id: 'profile', label: '个人资料', icon: Users, permission: null },
        { id: 'roles', label: '角色管理', icon: Shield, permission: 'role:read' },
        { id: 'settings', label: '系统设置', icon: Settings, permission: 'system:read' },
    ];

    const filteredTabs = tabs.filter(tab => {
        if (!tab.permission) return true;
        return user?.permissions?.some(p => p.name === tab.permission);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 移动端侧边栏遮罩 */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* 统一顶部栏 */}
            <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        管理系统
                    </h1>
                    <div className="hidden lg:block text-gray-400">|</div>
                    <h2 className="hidden lg:block text-lg font-semibold text-gray-900">
                        {activeTab === 'dashboard' && '仪表板'}
                        {activeTab === 'profile' && '个人资料'}
                        {activeTab === 'roles' && '角色管理'}
                        {activeTab === 'settings' && '系统设置'}
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                    <Badge
                        variant={user?.isActive ? 'default' : 'secondary'}
                        className={`px-3 py-1 ${user?.isActive
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full mr-2 ${user?.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                        {user?.isActive ? '在线' : '离线'}
                    </Badge>
                </div>
            </header>

            <div className="flex">
                {/* 侧边栏 */}
                <div className={`fixed top-16 left-0 z-50 w-80 h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:top-16 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 lg:hidden">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">管理系统</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* 用户信息 */}
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 ring-2 ring-blue-200 ring-offset-2">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {user?.roles?.slice(0, 2).map((role) => (
                                <Badge key={role.id} variant="secondary" className="text-xs">
                                    {role.displayName}
                                </Badge>
                            ))}
                            {user?.roles && user.roles.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{user.roles.length - 2}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* 导航菜单 */}
                    <nav className="flex-1 p-4">
                        <ul className="space-y-1">
                            {filteredTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <li key={tab.id}>
                                        <Button
                                            variant="ghost"
                                            className={`w-full justify-start h-12 px-4 transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                                                }`}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsSidebarOpen(false);
                                            }}
                                        >
                                            <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''
                                                }`} />
                                            <span className="font-medium">{tab.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* 退出按钮 */}
                    <div className="p-4 border-t border-slate-200">
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-12 px-4 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5 transition-transform duration-200 hover:scale-110" />
                            <span className="font-medium">退出登录</span>
                        </Button>
                    </div>
                </div>

                {/* 主内容区 */}
                <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
                    {/* 页面内容 */}
                    <main className="p-3 lg:p-4 bg-gradient-to-br from-slate-50 to-blue-50 h-full">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-4 h-full flex flex-col">
                                {/* 欢迎区域 - 超紧凑布局 */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 lg:p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                                                    欢迎回来，<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}</span>！
                                                </h2>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                    onClick={() => window.location.reload()}
                                                >
                                                    <LayoutDashboard className="h-3 w-3 mr-1" />
                                                    刷新
                                                </Button>
                                            </div>
                                            <p className="text-gray-600 text-xs lg:text-sm">系统概览和快速操作入口</p>
                                        </div>
                                        <div className="hidden lg:block">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <LayoutDashboard className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 数据概览卡片 */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 flex-1">
                                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                            <CardTitle className="text-xs font-medium text-gray-700">用户角色</CardTitle>
                                            <div className="p-1 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                                                <Shield className="h-3 w-3 text-blue-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="text-lg lg:text-2xl font-bold text-blue-600 mb-0.5">{user?.roles?.length || 0}</div>
                                            <p className="text-xs text-gray-500">
                                                个角色
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                            <CardTitle className="text-xs font-medium text-gray-700">权限数量</CardTitle>
                                            <div className="p-1 bg-green-100 rounded group-hover:bg-green-200 transition-colors">
                                                <Shield className="h-3 w-3 text-green-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="text-lg lg:text-2xl font-bold text-green-600 mb-0.5">{user?.permissions?.length || 0}</div>
                                            <p className="text-xs text-gray-500">
                                                个权限
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                            <CardTitle className="text-xs font-medium text-gray-700">账户状态</CardTitle>
                                            <div className="p-1 bg-orange-100 rounded group-hover:bg-orange-200 transition-colors">
                                                <Users className="h-3 w-3 text-orange-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className={`text-lg lg:text-2xl font-bold mb-0.5 ${user?.isActive ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                {user?.isActive ? '活跃' : '非活跃'}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                账户状态
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                            <CardTitle className="text-xs font-medium text-gray-700">验证状态</CardTitle>
                                            <div className="p-1 bg-red-100 rounded group-hover:bg-red-200 transition-colors">
                                                <Shield className="h-3 w-3 text-red-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className={`text-lg lg:text-2xl font-bold mb-0.5 ${user?.isVerified ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {user?.isVerified ? '已验证' : '未验证'}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                邮箱验证
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* 最近活动模块 - 超紧凑布局 */}
                                <Card className="bg-white border-slate-200 shadow-sm flex-1">
                                    <CardHeader className="border-b border-slate-100 p-3 lg:p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">最近活动</CardTitle>
                                                <CardDescription className="text-xs text-gray-600">
                                                    账户活动记录
                                                </CardDescription>
                                            </div>
                                            <div className="p-1.5 bg-indigo-100 rounded">
                                                <LayoutDashboard className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-600" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 lg:p-4 flex-1">
                                        <div className="space-y-2 lg:space-y-3">
                                            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-100 hover:bg-green-100 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-green-800">登录成功</p>
                                                    <p className="text-xs text-green-600 truncate">
                                                        {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '从未登录'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-blue-800">账户创建</p>
                                                    <p className="text-xs text-blue-600 truncate">
                                                        {user?.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-100 hover:bg-purple-100 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-purple-800">权限更新</p>
                                                    <p className="text-xs text-purple-600 truncate">
                                                        系统权限已更新
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'llm' && (
                            <LLMPage />
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 lg:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                                                个人资料
                                            </h2>
                                            <p className="text-gray-600 text-sm lg:text-base">管理您的个人信息和账户设置</p>
                                        </div>
                                        <div className="hidden lg:block">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <UserProfile />
                            </div>
                        )}

                        {activeTab === 'roles' && (
                            <PermissionGuard permission="role:read">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                                                    角色管理
                                                </h2>
                                                <p className="text-gray-600 text-sm lg:text-base">管理系统角色和权限分配</p>
                                            </div>
                                            <div className="hidden lg:block">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                                                    <Shield className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <RoleManagement />
                                </div>
                            </PermissionGuard>
                        )}

                        {activeTab === 'settings' && (
                            <PermissionGuard permission="system:read">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                                                    系统设置
                                                </h2>
                                                <p className="text-gray-600 text-sm lg:text-base">配置系统参数和选项</p>
                                            </div>
                                            <div className="hidden lg:block">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                                    <Settings className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Card className="bg-white border-slate-200 shadow-sm">
                                        <CardContent className="p-6 lg:p-8 text-center">
                                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 text-base lg:text-lg">系统设置功能开发中...</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </PermissionGuard>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
