/**
 * 通用表单组件
 * 提供可复用的表单功能，避免重复代码
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type:
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
}

export interface FormProps<T = any> {
  fields: FormField[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<any> | any;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  showActions?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
  onValuesChange?: (values: Partial<T>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function Form<T = any>({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = '保存',
  cancelLabel = '取消',
  _loading = false,
  disabled = false,
  showActions = true,
  layout = 'vertical',
  className = '',
  onValuesChange,
  validateOnChange = true,
  validateOnBlur = true,
}: FormProps<T>) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当初始值变化时更新表单值
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // 验证单个字段
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label}是必填项`;
    }

    if (!value || value === '') return null;

    const { validation } = field;
    if (!validation) return null;

    // 类型验证
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '请输入有效的邮箱地址';
    }

    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return '请输入有效的数字';
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `值不能小于${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `值不能大于${validation.max}`;
      }
    }

    // 长度验证
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `长度不能少于${validation.minLength}个字符`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `长度不能超过${validation.maxLength}个字符`;
      }
    }

    // 正则验证
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return validation.message || '格式不正确';
    }

    return null;
  };

  // 验证所有字段
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, values[field.name as keyof T]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: any) => {
    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);
    onValuesChange?.(newValues);

    // 实时验证
    if (validateOnChange) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    }
  };

  // 处理字段失焦
  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, values[fieldName as keyof T]);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 标记所有字段为已触摸
    const allTouched = fields.reduce(
      (acc, field) => {
        acc[field.name] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setTouched(allTouched);

    // 验证表单
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values as T);
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  // 渲染字段
  const renderField = (field: FormField) => {
    const value = values[field.name as keyof T];
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const fieldProps = {
      id: field.name,
      name: field.name,
      value: String(value || ''),
      onChange: (e: any) => handleFieldChange(field.name, e.target.value),
      onBlur: () => handleFieldBlur(field.name),
      placeholder: field.placeholder,
      disabled: disabled || field.disabled,
      required: field.required,
      className: showError ? 'border-red-500' : '',
    };

    const fieldElement = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <Textarea
              {...fieldProps}
              onChange={(e: any) =>
                handleFieldChange(field.name, e.target.value)
              }
              rows={4}
            />
          );

        case 'select':
          return (
            <Select
              value={String(value || '')}
              onValueChange={(value: any) =>
                handleFieldChange(field.name, value)
              }
            >
              <SelectTrigger className={showError ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
          return (
            <Checkbox
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked: any) =>
                handleFieldChange(field.name, checked)
              }
              disabled={disabled || field.disabled}
            />
          );

        default:
          return (
            <Input
              {...fieldProps}
              type={field.type}
              value={String(value || '')}
            />
          );
      }
    })();

    return (
      <div key={field.name} className={`form-field ${field.width || 'full'}`}>
        {field.type !== 'checkbox' && (
          <Label
            htmlFor={field.name}
            className="block text-sm font-medium mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {fieldElement}

        {field.type === 'checkbox' && (
          <Label htmlFor={field.name} className="ml-2 text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {showError && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {field.helpText && !showError && (
          <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
        )}
      </div>
    );
  };

  // 获取布局类名
  const getLayoutClass = () => {
    switch (layout) {
      case 'horizontal':
        return 'space-y-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      default:
        return 'space-y-4';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`form ${className}`}>
      <div className={getLayoutClass()}>{fields.map(renderField)}</div>

      {showActions && (
        <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || disabled}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting || disabled}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

/**
 * 表单卡片组件
 */
export function FormCard<T = unknown>({
  title,
  description,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * 表单步骤组件
 */
export function FormSteps({
  steps,
  currentStep,
  _onStepChange,
  className = '',
}: {
  steps: Array<{ id: string; title: string; description?: string }>;
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
}) {
  return (
    <div className={`form-steps ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
                }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            <div className="ml-3">
              <p
                className={`text-sm font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500">{step.description}</p>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
