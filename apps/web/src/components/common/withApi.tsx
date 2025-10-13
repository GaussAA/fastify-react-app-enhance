/**
 * API高阶组件
 * 提供通用的API调用和状态管理功能
 */

import React, { ComponentType, useEffect, useState } from 'react';
import { CrudApiClient } from '../../lib/api-client';

export interface WithApiOptions<T> {
  apiClient: CrudApiClient<T>;
  autoLoad?: boolean;
  loadOnMount?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T | T[]) => void;
}

export interface WithApiProps<T> {
  data: T | T[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string | number, data: Partial<T>) => Promise<T | null>;
  delete: (id: string | number) => Promise<boolean>;
  clearError: () => void;
}

export interface WithDetailApiProps<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (data: Partial<T>) => Promise<T | null>;
  delete: () => Promise<boolean>;
  clearError: () => void;
  setEditing: (isEditing: boolean) => void;
  markChanged: () => void;
  isEditing: boolean;
  hasChanges: boolean;
}

/**
 * 列表数据高阶组件
 */
export function withListApi<T extends { id: string | number }>(
  WrappedComponent: ComponentType<any>,
  options: WithApiOptions<T>
) {
  const {
    apiClient,
    autoLoad = true,
    loadOnMount = true,
    refreshInterval,
    onError,
    onSuccess,
  } = options;

  return function WithListApiComponent(props: any) {
    const [state, setState] = useState({
      data: [] as T[],
      isLoading: false,
      error: null as string | null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    });

    const loadData = async (params?: any) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.getAll(params);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data!,
            pagination: response.pagination || prev.pagination,
            isLoading: false,
          }));
          onSuccess?.(response.data);
        } else {
          throw new Error(response.message || '加载数据失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '加载数据失败',
          isLoading: false,
        }));
        onError?.(error);
      }
    };

    const create = async (data: Partial<T>): Promise<T | null> => {
      try {
        const response = await apiClient.create(data);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: [response.data!, ...prev.data],
          }));
          onSuccess?.(response.data);
          return response.data;
        } else {
          throw new Error(response.message || '创建失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '创建失败',
        }));
        onError?.(error);
        return null;
      }
    };

    const update = async (
      id: string | number,
      data: Partial<T>
    ): Promise<T | null> => {
      try {
        const response = await apiClient.update(id, data);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: prev.data.map(item =>
              item.id === id ? response.data! : item
            ),
          }));
          onSuccess?.(response.data);
          return response.data;
        } else {
          throw new Error(response.message || '更新失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '更新失败',
        }));
        onError?.(error);
        return null;
      }
    };

    const deleteItem = async (id: string | number): Promise<boolean> => {
      try {
        const response = await apiClient.deleteRecord(id);
        if (response.success) {
          setState(prev => ({
            ...prev,
            data: prev.data.filter(item => item.id !== id),
          }));
          return true;
        } else {
          throw new Error(response.message || '删除失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '删除失败',
        }));
        onError?.(error);
        return false;
      }
    };

    const clearError = () => {
      setState(prev => ({ ...prev, error: null }));
    };

    useEffect(() => {
      if (loadOnMount && autoLoad) {
        loadData();
      }
    }, [loadOnMount, autoLoad]);

    useEffect(() => {
      if (refreshInterval && refreshInterval > 0) {
        const interval = setInterval(() => {
          loadData();
        }, refreshInterval);
        return () => clearInterval(interval);
      }
    }, [refreshInterval]);

    const apiProps: WithApiProps<T> = {
      data: state.data,
      isLoading: state.isLoading,
      error: state.error,
      refresh: () => loadData(),
      create,
      update,
      delete: deleteItem,
      clearError,
    };

    return <WrappedComponent {...props} {...apiProps} />;
  };
}

/**
 * 详情数据高阶组件
 */
export function withDetailApi<T extends { id: string | number }>(
  WrappedComponent: ComponentType<any>,
  options: WithApiOptions<T>
) {
  const {
    apiClient,
    autoLoad = true,
    loadOnMount = true,
    onError,
    onSuccess,
  } = options;

  return function WithDetailApiComponent(props: any) {
    const [state, setState] = useState({
      data: null as T | null,
      isLoading: false,
      error: null as string | null,
      isEditing: false,
      hasChanges: false,
    });

    const loadData = async (id: string | number) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.getById(id);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data!,
            isLoading: false,
          }));
          onSuccess?.(response.data);
        } else {
          throw new Error(response.message || '加载数据失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '加载数据失败',
          isLoading: false,
        }));
        onError?.(error);
      }
    };

    const update = async (data: Partial<T>): Promise<T | null> => {
      if (!state.data) return null;

      try {
        const response = await apiClient.update(state.data.id, data);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data!,
            isEditing: false,
            hasChanges: false,
          }));
          onSuccess?.(response.data);
          return response.data;
        } else {
          throw new Error(response.message || '更新失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '更新失败',
        }));
        onError?.(error);
        return null;
      }
    };

    const deleteItem = async (): Promise<boolean> => {
      if (!state.data) return false;

      try {
        const response = await apiClient.deleteRecord(state.data.id);
        if (response.success) {
          setState(prev => ({
            ...prev,
            data: null,
            isEditing: false,
            hasChanges: false,
          }));
          return true;
        } else {
          throw new Error(response.message || '删除失败');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          error: error.message || '删除失败',
        }));
        onError?.(error);
        return false;
      }
    };

    const clearError = () => {
      setState(prev => ({ ...prev, error: null }));
    };

    const setEditing = (isEditing: boolean) => {
      setState(prev => ({ ...prev, isEditing, hasChanges: false }));
    };

    const markChanged = () => {
      setState(prev => ({ ...prev, hasChanges: true }));
    };

    useEffect(() => {
      if (loadOnMount && autoLoad && props.id) {
        loadData(props.id);
      }
    }, [loadOnMount, autoLoad, props.id]);

    const apiProps: WithDetailApiProps<T> = {
      data: state.data,
      isLoading: state.isLoading,
      error: state.error,
      refresh: () => (state.data ? loadData(state.data.id) : Promise.resolve()),
      create: async (_data: Partial<T>) => null, // 详情页面不支持创建
      update,
      delete: deleteItem,
      clearError,
      setEditing,
      markChanged,
      isEditing: state.isEditing,
      hasChanges: state.hasChanges,
    };

    return <WrappedComponent {...props} {...apiProps} />;
  };
}

/**
 * 表单高阶组件
 */
export function withForm<T>(
  WrappedComponent: ComponentType<any>,
  options: {
    initialValues?: Partial<T>;
    validationRules?: Record<string, any[]>;
    onSubmit: (values: T) => Promise<any>;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
  }
) {
  const {
    initialValues = {},
    validationRules,
    onSubmit,
    onSuccess,
    onError,
  } = options;

  return function WithFormComponent(props: any) {
    const [formData, setFormData] = useState<Partial<T>>(initialValues);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setFieldValue = (field: keyof T, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // 清除该字段的错误
      if (errors[field as string]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    };

    const setFieldError = (field: string, error: string[]) => {
      setErrors(prev => ({ ...prev, [field]: error }));
    };

    const validateForm = (): boolean => {
      if (!validationRules) return true;

      const newErrors: Record<string, string[]> = {};
      let isValid = true;

      Object.entries(validationRules).forEach(([field, rules]) => {
        const value = formData[field as keyof T];
        const fieldErrors: string[] = [];

        rules.forEach(rule => {
          if (!validateField(value, rule)) {
            fieldErrors.push(rule.message);
            isValid = false;
          }
        });

        if (fieldErrors.length > 0) {
          newErrors[field] = fieldErrors;
        }
      });

      setErrors(newErrors);
      return isValid;
    };

    const validateField = (value: any, rule: any): boolean => {
      switch (rule.type) {
        case 'required':
          return value !== null && value !== undefined && value !== '';
        case 'email':
          return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'minLength':
          return !value || value.length >= rule.params;
        case 'maxLength':
          return !value || value.length <= rule.params;
        case 'numeric':
          return !value || !isNaN(Number(value));
        default:
          return true;
      }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const result = await onSubmit(formData as T);
        onSuccess?.(result);
      } catch (error: any) {
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const resetForm = () => {
      setFormData(initialValues);
      setErrors({});
    };

    const formProps = {
      formData,
      errors,
      isSubmitting,
      setFieldValue,
      setFieldError,
      validateForm,
      handleSubmit,
      resetForm,
    };

    return <WrappedComponent {...props} {...formProps} />;
  };
}

/**
 * 权限控制高阶组件
 */
export function withPermission(
  WrappedComponent: ComponentType<any>,
  requiredPermission: string
) {
  return function WithPermissionComponent(props: any) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
      // 这里应该检查用户权限
      // 暂时模拟权限检查
      const checkPermission = async () => {
        try {
          // 模拟权限检查逻辑
          const userPermissions = JSON.parse(
            localStorage.getItem('permissions') || '[]'
          );
          const hasRequiredPermission =
            userPermissions.includes(requiredPermission);
          setHasPermission(hasRequiredPermission);
        } catch {
          setHasPermission(false);
        }
      };

      checkPermission();
    }, [requiredPermission]);

    if (hasPermission === null) {
      return <div>检查权限中...</div>;
    }

    if (!hasPermission) {
      return <div>没有权限访问此功能</div>;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * 加载状态高阶组件
 */
export function withLoading(
  WrappedComponent: ComponentType<any>,
  options: {
    loadingComponent?: ComponentType<any>;
    errorComponent?: ComponentType<{ error: string; retry: () => void }>;
  } = {}
) {
  const { loadingComponent: LoadingComponent, errorComponent: ErrorComponent } =
    options;

  return function WithLoadingComponent(props: any) {
    const { isLoading, error, retry, ...restProps } = props;

    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <div>加载中...</div>;
    }

    if (error) {
      return ErrorComponent ? (
        <ErrorComponent error={error} retry={retry} />
      ) : (
        <div>
          <p>错误: {error}</p>
          {retry && <button onClick={retry}>重试</button>}
        </div>
      );
    }

    return <WrappedComponent {...restProps} />;
  };
}
