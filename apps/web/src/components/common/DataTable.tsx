/**
 * 通用数据表格组件
 * 提供可复用的表格功能，避免重复代码
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  actions?: {
    create?: {
      label: string;
      onClick: () => void;
    };
    edit?: {
      label: string;
      onClick: (record: T) => void;
    };
    delete?: {
      label: string;
      onClick: (record: T) => void;
    };
    export?: {
      label: string;
      onClick: () => void;
    };
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onFilter?: (_filters: Record<string, any>) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  searchable = true,
  filterable = true,
  selectable = false,
  actions,
  onPageChange,
  onLimitChange,
  onSort,
  onSearch,
  onFilter: _onFilter,
  onSelectionChange,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [_filters, _setFilters] = useState<Record<string, any>>({});

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // 处理排序
  const handleSort = (field: string) => {
    const newOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort?.(field, newOrder);
  };

  // 处理过滤 - 功能待实现
  // const handleFilter = (field: string, value: any) => {
  //   const newFilters = { ...filters, [field]: value };
  //   setFilters(newFilters);
  //   onFilter?.(newFilters);
  // };

  // 处理行选择
  const handleRowSelect = (record: T, checked: boolean) => {
    let newSelectedRows: T[];
    if (checked) {
      newSelectedRows = [...selectedRows, record];
    } else {
      newSelectedRows = selectedRows.filter(row => row.id !== record.id);
    }
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows = checked ? [...data] : [];
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  };

  // 渲染单元格内容
  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value =
      typeof column.key === 'string'
        ? (record as any)[column.key]
        : record[column.key as keyof T];

    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };

  // 渲染排序图标
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const isActive = sortField === column.key;
    return (
      <span className="ml-1">
        {isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 搜索 */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}

          {/* 过滤器 */}
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              过滤
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 操作按钮 */}
          {actions?.create && (
            <Button onClick={actions.create.onClick}>
              <Plus className="h-4 w-4 mr-2" />
              {actions.create.label}
            </Button>
          )}

          {actions?.export && (
            <Button variant="outline" onClick={actions.export.onClick}>
              <Download className="h-4 w-4 mr-2" />
              {actions.export.label}
            </Button>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {/* 选择列 */}
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === data.length && data.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
              )}

              {/* 数据列 */}
              {columns.map(column => (
                <TableHead
                  key={String(column.key)}
                  className={`${column.width ? `w-${column.width}` : ''} ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center hover:text-blue-600"
                    >
                      {column.title}
                      {renderSortIcon(column)}
                    </button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}

              {/* 操作列 */}
              {(actions?.edit || actions?.delete) && (
                <TableHead className="w-20">操作</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow key={record.id}>
                {/* 选择列 */}
                {selectable && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.some(row => row.id === record.id)}
                      onChange={e => handleRowSelect(record, e.target.checked)}
                      className="rounded"
                    />
                  </TableCell>
                )}

                {/* 数据列 */}
                {columns.map(column => (
                  <TableCell
                    key={String(column.key)}
                    className={`${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                  >
                    {renderCell(column, record, index)}
                  </TableCell>
                ))}

                {/* 操作列 */}
                {(actions?.edit || actions?.delete) && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {actions.edit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.edit!.onClick(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {actions.delete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.delete!.onClick(record)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 {pagination.total} 条记录，第 {pagination.page} /{' '}
            {pagination.pages} 页
          </div>

          <div className="flex items-center space-x-2">
            {/* 每页显示数量 */}
            <Select
              value={String(pagination.limit)}
              onValueChange={value => onLimitChange?.(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            {/* 分页按钮 */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 py-1 text-sm">
                {pagination.page} / {pagination.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
