/**
 * 状态管理工具
 * 提供通用的状态管理模式，避免重复代码
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface ErrorState {
  error: string | null;
  errors: Record<string, string[]>;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BaseState extends LoadingState, ErrorState {
  // 基础状态
}

export interface ListState<T> extends BaseState {
  items: T[];
  selectedItems: T[];
  pagination: PaginationState;
}

export interface DetailState<T> extends BaseState {
  item: T | null;
  isEditing: boolean;
  hasChanges: boolean;
}

/**
 * 状态管理工具类
 */
export class StateManager<T extends BaseState> {
  protected state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  /**
   * 设置加载状态
   */
  setLoading(isLoading: boolean, message?: string): void {
    this.state.isLoading = isLoading;
    this.state.loadingMessage = message;
  }

  /**
   * 设置错误
   */
  setError(error: string | null, field?: string): void {
    this.state.error = error;
    if (field && error) {
      this.state.errors[field] = [error];
    }
  }

  /**
   * 设置字段错误
   */
  setFieldError(field: string, errors: string[]): void {
    this.state.errors[field] = errors;
  }

  /**
   * 清除错误
   */
  clearError(field?: string): void {
    if (field) {
      delete this.state.errors[field];
    } else {
      this.state.error = null;
      this.state.errors = {};
    }
  }

  /**
   * 获取状态
   */
  getState(): T {
    return this.state;
  }
}

/**
 * 列表状态管理器
 */
export class ListStateManager<T> extends StateManager<ListState<T>> {
  constructor(initialState: Partial<ListState<T>> = {}) {
    super({
      isLoading: false,
      error: null,
      errors: {},
      items: [],
      selectedItems: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
      ...initialState,
    } as ListState<T>);
  }

  /**
   * 设置项目列表
   */
  setItems(items: T[]): void {
    this.state.items = items;
  }

  /**
   * 添加项目
   */
  addItem(item: T): void {
    this.state.items.unshift(item);
  }

  /**
   * 更新项目
   */
  updateItem(id: string | number, updates: Partial<T>): void {
    const index = this.state.items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.state.items[index] = { ...this.state.items[index], ...updates };
    }
  }

  /**
   * 删除项目
   */
  removeItem(id: string | number): void {
    this.state.items = this.state.items.filter((item: any) => item.id !== id);
  }

  /**
   * 设置分页信息
   */
  setPagination(pagination: Partial<PaginationState>): void {
    this.state.pagination = { ...this.state.pagination, ...pagination };
  }

  /**
   * 选择项目
   */
  selectItem(item: T): void {
    if (!this.state.selectedItems.includes(item)) {
      this.state.selectedItems.push(item);
    }
  }

  /**
   * 取消选择项目
   */
  deselectItem(item: T): void {
    this.state.selectedItems = this.state.selectedItems.filter(i => i !== item);
  }

  /**
   * 切换选择状态
   */
  toggleSelection(item: T): void {
    if (this.state.selectedItems.includes(item)) {
      this.deselectItem(item);
    } else {
      this.selectItem(item);
    }
  }

  /**
   * 全选
   */
  selectAll(): void {
    this.state.selectedItems = [...this.state.items];
  }

  /**
   * 取消全选
   */
  deselectAll(): void {
    this.state.selectedItems = [];
  }

  /**
   * 是否全选
   */
  isAllSelected(): boolean {
    return (
      this.state.items.length > 0 &&
      this.state.selectedItems.length === this.state.items.length
    );
  }

  /**
   * 是否部分选择
   */
  isPartiallySelected(): boolean {
    return (
      this.state.selectedItems.length > 0 &&
      this.state.selectedItems.length < this.state.items.length
    );
  }
}

/**
 * 详情状态管理器
 */
export class DetailStateManager<T> extends StateManager<DetailState<T>> {
  constructor(initialState: Partial<DetailState<T>> = {}) {
    super({
      isLoading: false,
      error: null,
      errors: {},
      item: null,
      isEditing: false,
      hasChanges: false,
      ...initialState,
    } as DetailState<T>);
  }

  /**
   * 设置项目
   */
  setItem(item: T | null): void {
    this.state.item = item;
    this.state.hasChanges = false;
  }

  /**
   * 更新项目
   */
  updateItem(updates: Partial<T>): void {
    if (this.state.item) {
      this.state.item = { ...this.state.item, ...updates };
      this.state.hasChanges = true;
    }
  }

  /**
   * 设置编辑状态
   */
  setEditing(isEditing: boolean): void {
    this.state.isEditing = isEditing;
    if (!isEditing) {
      this.state.hasChanges = false;
    }
  }

  /**
   * 标记有变化
   */
  markChanged(): void {
    this.state.hasChanges = true;
  }

  /**
   * 重置变化状态
   */
  resetChanges(): void {
    this.state.hasChanges = false;
  }
}

/**
 * 状态管理Hook工厂
 */
export function createStateHook<T extends BaseState>(
  initialState: T,
  options?: {
    name?: string;
    storage?: typeof localStorage;
    partialize?: (state: T) => Partial<T>;
  }
) {
  const { name, storage = localStorage, partialize } = options || {};

  if (name) {
    return create<T>()(
      persist(
        (set, _get) => ({
          ...initialState,
          setLoading: (isLoading: boolean, message?: string) =>
            set({ isLoading, loadingMessage: message } as Partial<T>),
          setError: (error: string | null, field?: string) =>
            set(
              state =>
                ({
                  error,
                  errors:
                    field && error
                      ? { ...state.errors, [field]: [error] }
                      : state.errors,
                }) as Partial<T>
            ),
          setFieldError: (field: string, errors: string[]) =>
            set(
              state =>
                ({
                  errors: { ...state.errors, [field]: errors },
                }) as Partial<T>
            ),
          clearError: (field?: string) =>
            set(
              state =>
                ({
                  error: field ? state.error : null,
                  errors: field
                    ? Object.fromEntries(
                        Object.entries(state.errors).filter(
                          ([key]) => key !== field
                        )
                      )
                    : {},
                }) as Partial<T>
            ),
        }),
        {
          name,
          storage: createJSONStorage(() => storage),
          partialize: partialize || (state => state),
        }
      )
    );
  }

  return create<T>((set, _get) => ({
    ...initialState,
    setLoading: (isLoading: boolean, message?: string) =>
      set({ isLoading, loadingMessage: message } as Partial<T>),
    setError: (error: string | null, field?: string) =>
      set(
        state =>
          ({
            error,
            errors:
              field && error
                ? { ...state.errors, [field]: [error] }
                : state.errors,
          }) as Partial<T>
      ),
    setFieldError: (field: string, errors: string[]) =>
      set(
        state =>
          ({
            errors: { ...state.errors, [field]: errors },
          }) as Partial<T>
      ),
    clearError: (field?: string) =>
      set(
        state =>
          ({
            error: field ? state.error : null,
            errors: field
              ? Object.fromEntries(
                  Object.entries(state.errors).filter(([key]) => key !== field)
                )
              : {},
          }) as Partial<T>
      ),
  }));
}

/**
 * 列表状态Hook工厂
 */
export function createListStateHook<T>(
  initialState: Partial<ListState<T>> = {},
  options?: {
    name?: string;
    storage?: typeof localStorage;
    partialize?: (state: ListState<T>) => Partial<ListState<T>>;
  }
) {
  const baseState: ListState<T> = {
    isLoading: false,
    error: null,
    errors: {},
    items: [],
    selectedItems: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
    ...initialState,
  };

  return createStateHook(baseState, options);
}

/**
 * 详情状态Hook工厂
 */
export function createDetailStateHook<T>(
  initialState: Partial<DetailState<T>> = {},
  options?: {
    name?: string;
    storage?: typeof localStorage;
    partialize?: (state: DetailState<T>) => Partial<DetailState<T>>;
  }
) {
  const baseState: DetailState<T> = {
    isLoading: false,
    error: null,
    errors: {},
    item: null,
    isEditing: false,
    hasChanges: false,
    ...initialState,
  };

  return createStateHook(baseState, options);
}

/**
 * 异步操作Hook工厂
 */
export function createAsyncOperationHook<T extends BaseState>(
  initialState: T,
  options?: {
    name?: string;
    storage?: typeof localStorage;
    partialize?: (state: T) => Partial<T>;
  }
) {
  const baseHook = createStateHook(initialState, options);

  return (set: any, _get: any) => ({
    ...(baseHook(set, _get) as any),
    executeAsync: async <R>(
      operation: () => Promise<R>,
      options?: {
        loadingMessage?: string;
        onSuccess?: (result: R) => void;
        onError?: (error: Error) => void;
      }
    ): Promise<R | null> => {
      const { loadingMessage, onSuccess, onError } = options || {};

      set({ isLoading: true, loadingMessage, error: null } as Partial<T>);

      try {
        const result = await operation();
        set({ isLoading: false, loadingMessage: undefined } as Partial<T>);
        onSuccess?.(result);
        return result;
      } catch (error: any) {
        const errorMessage = error.message || '操作失败';
        set({
          isLoading: false,
          loadingMessage: undefined,
          error: errorMessage,
        } as Partial<T>);
        onError?.(error);
        return null;
      }
    },
  });
}
