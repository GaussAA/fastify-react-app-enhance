// 角色管理组件

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  // Filter,
} from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { apiClient } from '@/lib/api';
import { Role, Permission } from '@/types/auth';

// 表单验证模式
const roleSchema = z.object({
  name: z
    .string()
    .min(1, '请输入角色名称')
    .min(2, '角色名称至少2个字符')
    .max(50, '角色名称不能超过50个字符')
    .regex(/^[a-z_]+$/, '角色名称只能包含小写字母和下划线'),
  displayName: z
    .string()
    .min(1, '请输入显示名称')
    .min(2, '显示名称至少2个字符')
    .max(50, '显示名称不能超过50个字符'),
  description: z
    .string()
    .min(1, '请输入角色描述')
    .max(255, '角色描述不能超过255个字符'),
  permissionIds: z.array(z.number()).optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleManagementProps {
  onUpdate?: () => void;
}

export function RoleManagement({ onUpdate }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      permissionIds: [],
    },
  });

  const selectedPermissions = watch('permissionIds') || [];

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiClient.getRoles(),
        apiClient.getPermissions(),
      ]);

      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
      }

      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.data || []);
      }
    } catch (error: any) {
      setError(error.message || '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let response;

      if (editingRole) {
        // 更新角色
        response = await apiClient.updateRole(editingRole.id, {
          name: data.name,
          displayName: data.displayName,
          description: data.description,
        });
      } else {
        // 创建角色
        response = await apiClient.createRole({
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          permissionIds: data.permissionIds,
        });
      }

      if (response.success) {
        setSuccess(editingRole ? '角色更新成功' : '角色创建成功');
        setIsDialogOpen(false);
        reset();
        setEditingRole(null);
        loadData();
        onUpdate?.();
      }
    } catch (error: any) {
      setError(error.message || '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('displayName', role.displayName);
    setValue('description', role.description);
    setValue('permissionIds', role.permissions?.map(p => p.id) || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`确定要删除角色 "${role.displayName}" 吗？`)) {
      return;
    }

    try {
      const response = await apiClient.deleteRole(role.id);
      if (response.success) {
        setSuccess('角色删除成功');
        loadData();
        onUpdate?.();
      }
    } catch (error: any) {
      setError(error.message || '删除失败');
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    reset();
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const currentPermissions = selectedPermissions;
    if (checked) {
      setValue('permissionIds', [...currentPermissions, permissionId]);
    } else {
      setValue(
        'permissionIds',
        currentPermissions.filter(id => id !== permissionId)
      );
    }
  };

  // 过滤角色
  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && role.isActive) ||
      (statusFilter === 'inactive' && !role.isActive);
    return matchesSearch && matchesStatus;
  });

  // 按资源分组权限
  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>角色管理</span>
              </CardTitle>
              <CardDescription>管理系统角色和权限分配</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建角色
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? '编辑角色' : '创建角色'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRole ? '修改角色信息和权限' : '创建新的系统角色'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">角色名称</Label>
                      <Input
                        id="name"
                        placeholder="user, admin, manager"
                        {...register('name')}
                        className={errors.name ? 'border-red-500' : ''}
                        disabled={!!editingRole} // 编辑时不允许修改角色名称
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">显示名称</Label>
                      <Input
                        id="displayName"
                        placeholder="用户, 管理员, 经理"
                        {...register('displayName')}
                        className={errors.displayName ? 'border-red-500' : ''}
                      />
                      {errors.displayName && (
                        <p className="text-sm text-red-500">
                          {errors.displayName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">角色描述</Label>
                    <Input
                      id="description"
                      placeholder="描述角色的职责和权限范围"
                      {...register('description')}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>权限分配</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                      {Object.entries(permissionsByResource).map(
                        ([resource, resourcePermissions]) => (
                          <div key={resource} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 capitalize">
                              {resource}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {resourcePermissions.map(permission => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(
                                      permission.id
                                    )}
                                    onCheckedChange={checked =>
                                      handlePermissionChange(
                                        permission.id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm"
                                  >
                                    {permission.action}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '保存'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索角色..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>角色列表 ({filteredRoles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              没有找到匹配的角色
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>显示名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>权限数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-sm">
                      {role.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {role.displayName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role.permissions?.length || 0} 个权限
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? '活跃' : '非活跃'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(role)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
