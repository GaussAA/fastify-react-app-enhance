/**
 * 验证工具
 * 提供通用的数据验证功能，避免重复代码
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  value: any;
  rules: ValidationRuleConfig[];
}

export interface ValidationRuleConfig {
  type:
    | 'required'
    | 'email'
    | 'minLength'
    | 'maxLength'
    | 'numeric'
    | 'boolean'
    | 'array'
    | 'object'
    | 'custom';
  message: string;
  params?: any;
  validator?: (value: any, params?: any) => boolean;
}

/**
 * 基础验证器
 */
export class BaseValidator {
  /**
   * 验证单个字段
   */
  static validateField(
    _field: string,
    value: any,
    rules: ValidationRuleConfig[]
  ): string[] {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!this.validateRule(value, rule)) {
        errors.push(rule.message);
      }
    }

    return errors;
  }

  /**
   * 验证规则
   */
  static validateRule(value: any, rule: ValidationRuleConfig): boolean {
    switch (rule.type) {
      case 'required':
        return this.isRequired(value);
      case 'email':
        return this.isEmail(value);
      case 'minLength':
        return this.isMinLength(value, rule.params);
      case 'maxLength':
        return this.isMaxLength(value, rule.params);
      case 'numeric':
        return this.isNumeric(value);
      case 'boolean':
        return this.isBoolean(value);
      case 'array':
        return this.isArray(value);
      case 'object':
        return this.isObject(value);
      case 'custom':
        return rule.validator ? rule.validator(value, rule.params) : true;
      default:
        return true;
    }
  }

  /**
   * 必填验证
   */
  static isRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * 邮箱验证
   */
  static isEmail(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * 最小长度验证
   */
  static isMinLength(value: any, minLength: number): boolean {
    if (!value) return true; // 空值由required规则处理
    if (typeof value === 'string') return value.length >= minLength;
    if (Array.isArray(value)) return value.length >= minLength;
    return true;
  }

  /**
   * 最大长度验证
   */
  static isMaxLength(value: any, maxLength: number): boolean {
    if (!value) return true;
    if (typeof value === 'string') return value.length <= maxLength;
    if (Array.isArray(value)) return value.length <= maxLength;
    return true;
  }

  /**
   * 数字验证
   */
  static isNumeric(value: any): boolean {
    if (value === null || value === undefined) return true;
    return !isNaN(Number(value));
  }

  /**
   * 布尔值验证
   */
  static isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  /**
   * 数组验证
   */
  static isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * 对象验证
   */
  static isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}

/**
 * 数据验证器
 */
export class DataValidator {
  /**
   * 验证对象
   */
  static validateObject(
    data: any,
    rules: Record<string, ValidationRuleConfig[]>
  ): ValidationResult {
    const errors: string[] = [];

    for (const [field, fieldRules] of Object.entries(rules)) {
      const fieldErrors = BaseValidator.validateField(
        field,
        data[field],
        fieldRules
      );
      errors.push(...fieldErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证数组
   */
  static validateArray(
    data: any[],
    rules: ValidationRuleConfig[]
  ): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('数据必须是数组');
      return { isValid: false, errors };
    }

    for (let i = 0; i < data.length; i++) {
      const itemErrors = BaseValidator.validateField(`[${i}]`, data[i], rules);
      errors.push(...itemErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 常用验证规则
 */
export const CommonValidationRules = {
  required: (message: string = '此字段为必填项'): ValidationRuleConfig => ({
    type: 'required',
    message,
  }),

  email: (message: string = '请输入有效的邮箱地址'): ValidationRuleConfig => ({
    type: 'email',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRuleConfig => ({
    type: 'minLength',
    message: message || `长度不能少于${min}个字符`,
    params: min,
  }),

  maxLength: (max: number, message?: string): ValidationRuleConfig => ({
    type: 'maxLength',
    message: message || `长度不能超过${max}个字符`,
    params: max,
  }),

  numeric: (message: string = '必须是数字'): ValidationRuleConfig => ({
    type: 'numeric',
    message,
  }),

  boolean: (message: string = '必须是布尔值'): ValidationRuleConfig => ({
    type: 'boolean',
    message,
  }),

  array: (message: string = '必须是数组'): ValidationRuleConfig => ({
    type: 'array',
    message,
  }),

  object: (message: string = '必须是对象'): ValidationRuleConfig => ({
    type: 'object',
    message,
  }),

  custom: (
    validator: (value: any) => boolean,
    message: string
  ): ValidationRuleConfig => ({
    type: 'custom',
    message,
    validator,
  }),
};

/**
 * 预定义验证规则集
 */
export const ValidationRuleSets = {
  /**
   * 用户验证规则
   */
  user: {
    name: [
      CommonValidationRules.required('用户姓名不能为空'),
      CommonValidationRules.minLength(1, '用户姓名不能为空'),
      CommonValidationRules.maxLength(100, '用户姓名不能超过100个字符'),
    ],
    email: [
      CommonValidationRules.required('邮箱不能为空'),
      CommonValidationRules.email('请输入有效的邮箱地址'),
      CommonValidationRules.maxLength(255, '邮箱不能超过255个字符'),
    ],
    password: [
      CommonValidationRules.required('密码不能为空'),
      CommonValidationRules.minLength(6, '密码至少6个字符'),
      CommonValidationRules.maxLength(128, '密码不能超过128个字符'),
    ],
  },

  /**
   * 角色验证规则
   */
  role: {
    name: [
      CommonValidationRules.required('角色名称不能为空'),
      CommonValidationRules.minLength(1, '角色名称不能为空'),
      CommonValidationRules.maxLength(100, '角色名称不能超过100个字符'),
    ],
    displayName: [
      CommonValidationRules.required('显示名称不能为空'),
      CommonValidationRules.minLength(1, '显示名称不能为空'),
      CommonValidationRules.maxLength(100, '显示名称不能超过100个字符'),
    ],
    description: [
      CommonValidationRules.maxLength(500, '描述不能超过500个字符'),
    ],
  },

  /**
   * 权限验证规则
   */
  permission: {
    name: [
      CommonValidationRules.required('权限名称不能为空'),
      CommonValidationRules.minLength(1, '权限名称不能为空'),
      CommonValidationRules.maxLength(100, '权限名称不能超过100个字符'),
    ],
    displayName: [
      CommonValidationRules.required('显示名称不能为空'),
      CommonValidationRules.minLength(1, '显示名称不能为空'),
      CommonValidationRules.maxLength(100, '显示名称不能超过100个字符'),
    ],
    resource: [
      CommonValidationRules.required('资源类型不能为空'),
      CommonValidationRules.minLength(1, '资源类型不能为空'),
      CommonValidationRules.maxLength(50, '资源类型不能超过50个字符'),
    ],
    action: [
      CommonValidationRules.required('操作类型不能为空'),
      CommonValidationRules.minLength(1, '操作类型不能为空'),
      CommonValidationRules.maxLength(50, '操作类型不能超过50个字符'),
    ],
    description: [
      CommonValidationRules.maxLength(500, '描述不能超过500个字符'),
    ],
  },

  /**
   * 分页验证规则
   */
  pagination: {
    page: [
      CommonValidationRules.numeric('页码必须是数字'),
      CommonValidationRules.custom(
        value => Number(value) >= 1,
        '页码必须大于等于1'
      ),
    ],
    limit: [
      CommonValidationRules.numeric('每页数量必须是数字'),
      CommonValidationRules.custom(
        value => Number(value) >= 1 && Number(value) <= 100,
        '每页数量必须在1-100之间'
      ),
    ],
  },
};

/**
 * 验证中间件工厂
 */
export function createValidationMiddleware(
  rules: Record<string, ValidationRuleConfig[]>
) {
  return (data: any): ValidationResult => {
    return DataValidator.validateObject(data, rules);
  };
}

/**
 * 快速验证函数
 */
export function validate(
  data: any,
  rules: Record<string, ValidationRuleConfig[]>
): ValidationResult {
  return DataValidator.validateObject(data, rules);
}

/**
 * 验证并抛出错误
 */
export function validateOrThrow(
  data: any,
  rules: Record<string, ValidationRuleConfig[]>
): void {
  const result = validate(data, rules);
  if (!result.isValid) {
    const error = new Error(result.errors.join(', '));
    (error as any).statusCode = 400;
    throw error;
  }
}
