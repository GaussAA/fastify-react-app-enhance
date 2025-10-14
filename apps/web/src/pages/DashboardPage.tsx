// 仪表板页面

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useLLMStore } from '@/store/llm';
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
  Brain,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { serviceStatus } = useLLMStore();

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
    {
      id: 'dashboard',
      label: '仪表板',
      icon: LayoutDashboard,
      permission: null,
    },
    { id: 'llm', label: 'AI助手', icon: Brain, permission: null },
    { id: 'profile', label: '个人资料', icon: Users, permission: null },
    { id: 'roles', label: '角色管理', icon: Shield, permission: 'role:read' },
    {
      id: 'settings',
      label: '系统设置',
      icon: Settings,
      permission: 'system:read',
    },
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
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6">
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
            {activeTab === 'llm' && 'AI助手'}
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
            <div
              className={`w-2 h-2 rounded-full mr-2 ${serviceStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-gray-400'
                }`}
            ></div>
            {serviceStatus?.status === 'healthy' ? '在线' : '离线'}
          </Badge>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <div
          className={`fixed top-16 left-0 z-50 w-80 h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:top-16 overflow-y-auto xl:w-80 lg:w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between h-16 px-6 lg:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              管理系统
            </h1>
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
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {user?.roles?.slice(0, 2).map(role => (
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
              {filteredTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-12 px-4 transition-all duration-300 ease-out relative overflow-hidden group ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-white'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:border-l-4 hover:border-blue-300'
                        }`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsSidebarOpen(false);
                      }}
                    >
                      {/* 背景光效 */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                      )}

                      <Icon
                        className={`mr-3 h-5 w-5 transition-all duration-300 ${isActive
                          ? 'scale-110 text-white drop-shadow-sm'
                          : 'group-hover:scale-105 group-hover:text-blue-600'
                          }`}
                      />
                      <span className={`font-medium relative z-10 ${isActive ? 'text-white' : 'group-hover:text-blue-700'}`}>
                        {tab.label}
                      </span>

                      {/* 选中状态指示器 */}
                      {isActive && (
                        <div className="ml-auto flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      )}

                      {/* 悬停时的箭头指示 */}
                      {!isActive && (
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-0 h-0 border-l-4 border-l-blue-400 border-y-4 border-y-transparent"></div>
                        </div>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 退出按钮 */}
          <div className="p-4">
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
                {/* 欢迎区域 - 增强视觉层次 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-4 lg:p-6 relative overflow-hidden">
                  {/* 背景装饰 */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-100/40 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <LayoutDashboard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                              欢迎回来，
                              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                                {user?.name}
                              </span>
                              ！
                            </h2>
                            <p className="text-slate-600 text-sm lg:text-base mt-1">
                              系统概览和快速操作入口
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          onClick={() => window.location.reload()}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          刷新数据
                        </Button>
                      </div>

                      {/* 快速状态概览 */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <span className="text-slate-600">
                            {user?.isActive ? '账户活跃' : '账户待激活'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-slate-600">
                            {user?.isVerified ? '邮箱已验证' : '邮箱待验证'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <LayoutDashboard className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 数据概览卡片 - 增强视觉层次 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 flex-1">
                  {/* 用户角色卡片 */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                      <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        用户角色
                      </CardTitle>
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 relative z-10">
                      <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1 group-hover:text-blue-700 transition-colors">
                        {user?.roles?.length || 0}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">个角色</p>
                      {(!user?.roles || user.roles.length === 0) && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                            申请角色
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 权限数量卡片 */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                      <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        权限数量
                      </CardTitle>
                      <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-sm">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 relative z-10">
                      <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1 group-hover:text-green-700 transition-colors">
                        {user?.permissions?.length || 0}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">个权限</p>
                      {(!user?.permissions || user.permissions.length === 0) && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-green-200 text-green-600 hover:bg-green-50">
                            查看权限
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 账户状态卡片 */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${user?.isActive ? 'from-green-50/50' : 'from-orange-50/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                      <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        账户状态
                      </CardTitle>
                      <div className={`p-2 bg-gradient-to-br ${user?.isActive ? 'from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300' : 'from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300'} rounded-xl transition-all duration-300 shadow-sm`}>
                        <Users className={`h-4 w-4 ${user?.isActive ? 'text-green-600' : 'text-orange-600'}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 relative z-10">
                      <div className={`text-2xl lg:text-3xl font-bold mb-1 group-hover:opacity-80 transition-opacity ${user?.isActive ? 'text-green-600' : 'text-orange-600'}`}>
                        {user?.isActive ? '活跃' : '非活跃'}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">账户状态</p>
                      {!user?.isActive && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-orange-200 text-orange-600 hover:bg-orange-50">
                            激活账户
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 验证状态卡片 */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${user?.isVerified ? 'from-green-50/50' : 'from-red-50/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                      <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        验证状态
                      </CardTitle>
                      <div className={`p-2 bg-gradient-to-br ${user?.isVerified ? 'from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300' : 'from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300'} rounded-xl transition-all duration-300 shadow-sm`}>
                        <Shield className={`h-4 w-4 ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 relative z-10">
                      <div className={`text-2xl lg:text-3xl font-bold mb-1 group-hover:opacity-80 transition-opacity ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user?.isVerified ? '已验证' : '未验证'}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">邮箱验证</p>
                      {!user?.isVerified && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-red-200 text-red-600 hover:bg-red-50">
                            验证邮箱
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 最近活动模块 - 超紧凑布局 */}
                <Card className="bg-white border-slate-200 shadow-sm flex-1">
                  <CardHeader className="border-b border-slate-100 p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">
                          最近活动
                        </CardTitle>
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
                          <p className="text-xs font-semibold text-green-800">
                            登录成功
                          </p>
                          <p className="text-xs text-green-600 truncate">
                            {user?.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleString(
                                'zh-CN'
                              )
                              : '从未登录'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-800">
                            账户创建
                          </p>
                          <p className="text-xs text-blue-600 truncate">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleString('zh-CN')
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-100 hover:bg-purple-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-purple-800">
                            权限更新
                          </p>
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

            {activeTab === 'llm' && <LLMPage />}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                        个人资料
                      </h2>
                      <p className="text-gray-600 text-sm lg:text-base">
                        管理您的个人信息和账户设置
                      </p>
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
                        <p className="text-gray-600 text-sm lg:text-base">
                          管理系统角色和权限分配
                        </p>
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
                        <p className="text-gray-600 text-sm lg:text-base">
                          配置系统参数和选项
                        </p>
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
                      <p className="text-gray-500 text-base lg:text-lg">
                        系统设置功能开发中...
                      </p>
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
