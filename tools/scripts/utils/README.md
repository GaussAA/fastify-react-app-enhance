# 🛠️ 工具脚本工具集

**位置**: `tools/scripts/utils/`  
**用途**: 通用工具函数、环境管理和辅助脚本  
**更新时间**: 2025-01-27  

## 📋 脚本概览

| 脚本名称           | 功能描述     | 使用场景           |
| ------------------ | ------------ | ------------------ |
| `env-manager.js`   | 环境变量管理 | 生成和管理环境配置 |
| `file-utils.js`    | 文件操作工具 | 文件系统操作辅助   |
| `logger.js`        | 日志工具     | 统一日志管理       |
| `validator.js`     | 数据验证工具 | 输入数据验证       |
| `crypto-utils.js`  | 加密工具     | 密码和密钥处理     |
| `date-utils.js`    | 日期工具     | 日期时间处理       |
| `string-utils.js`  | 字符串工具   | 字符串处理辅助     |
| `config-loader.js` | 配置加载器   | 配置文件管理       |

---

## 🚀 快速开始

### 1. 环境变量管理
```bash
# 生成安全的环境配置
node tools/scripts/utils/env-manager.js

# 生成Docker Compose配置
node -e "import('./tools/scripts/utils/env-manager.js').then(m => new m.default(process.cwd()).generateDockerCompose())"
```

### 2. 文件操作
```bash
# 使用文件工具
node -e "import('./tools/scripts/utils/file-utils.js').then(m => m.default.copyFile('src', 'dist'))"
```

### 3. 日志记录
```bash
# 使用日志工具
node -e "import('./tools/scripts/utils/logger.js').then(m => m.default.info('测试日志'))"
```

---

## 📖 详细使用说明

### 🔐 环境变量管理器 (`env-manager.js`)

**功能**: 安全地生成和管理环境变量，包括JWT密钥、数据库密码等敏感信息

**主要特性**:
- 自动生成安全的随机密钥
- 支持环境变量模板
- 确保敏感信息不被提交到版本控制
- 支持Docker Compose配置生成

**使用方法**:
```javascript
import SecureEnvManager from './tools/scripts/utils/env-manager.js';

const envManager = new SecureEnvManager(process.cwd());

// 生成安全配置
const secrets = envManager.getSecureConfig();

// 生成环境文件
envManager.generateEnvFile('root', '.env');

// 生成Docker Compose配置
envManager.generateDockerCompose();
```

**生成的安全配置**:
```javascript
{
  JWT_SECRET: "a1b2c3d4e5f6...", // 64字符随机密钥
  DB_PASSWORD: "x9y8z7w6v5u4...", // 32字符随机密码
  REDIS_PASSWORD: "m3n4o5p6q7r8...", // 32字符随机密码
  API_KEY: "s9t8u7v6w5x4..." // 32字符随机密钥
}
```

**环境模板示例**:
```bash
# 根目录环境配置模板
NODE_ENV={{NODE_ENV}}
PORT={{PORT}}
DATABASE_URL="postgresql://{{DB_USER}}:{{DB_PASSWORD}}@{{DB_HOST}}:{{DB_PORT}}/{{DB_NAME}}"
JWT_SECRET="{{JWT_SECRET}}"
API_KEY="{{API_KEY}}"
```

### 📁 文件操作工具 (`file-utils.js`)

**功能**: 提供常用的文件系统操作辅助函数

**主要方法**:
- `copyFile()` - 复制文件
- `copyDirectory()` - 复制目录
- `ensureDirectory()` - 确保目录存在
- `cleanDirectory()` - 清理目录
- `findFiles()` - 查找文件
- `getFileSize()` - 获取文件大小

**使用方法**:
```javascript
import fileUtils from './tools/scripts/utils/file-utils.js';

// 复制文件
await fileUtils.copyFile('src/app.js', 'dist/app.js');

// 复制目录
await fileUtils.copyDirectory('src/assets', 'dist/assets');

// 确保目录存在
fileUtils.ensureDirectory('logs');

// 清理目录
await fileUtils.cleanDirectory('dist');

// 查找文件
const jsFiles = await fileUtils.findFiles('src', '*.js');

// 获取文件大小
const size = fileUtils.getFileSize('package.json');
console.log(`文件大小: ${size} bytes`);
```

**高级用法**:
```javascript
// 批量复制文件
const files = ['app.js', 'config.js', 'utils.js'];
for (const file of files) {
  await fileUtils.copyFile(`src/${file}`, `dist/${file}`);
}

// 递归查找特定类型文件
const allJsFiles = await fileUtils.findFiles('src', '*.js', true);

// 获取目录统计信息
const stats = await fileUtils.getDirectoryStats('src');
console.log(`文件数量: ${stats.fileCount}`);
console.log(`目录数量: ${stats.dirCount}`);
console.log(`总大小: ${stats.totalSize} bytes`);
```

### 📝 日志工具 (`logger.js`)

**功能**: 提供统一的日志记录功能，支持不同日志级别和输出格式

**日志级别**:
- `error` - 错误信息
- `warn` - 警告信息
- `info` - 一般信息
- `debug` - 调试信息

**使用方法**:
```javascript
import logger from './tools/scripts/utils/logger.js';

// 基本日志记录
logger.info('应用启动成功');
logger.warn('配置文件缺失，使用默认配置');
logger.error('数据库连接失败', error);
logger.debug('调试信息', { userId: 123, action: 'login' });

// 带上下文的日志
logger.info('用户操作', {
  userId: 123,
  action: 'create_post',
  timestamp: new Date().toISOString()
});

// 性能日志
const startTime = Date.now();
// ... 执行操作
logger.info('操作完成', {
  duration: Date.now() - startTime,
  operation: 'database_query'
});
```

**配置选项**:
```javascript
// 配置日志级别
logger.setLevel('debug');

// 配置输出格式
logger.setFormat('json'); // 'text' | 'json'

// 配置输出目标
logger.setOutput('file'); // 'console' | 'file' | 'both'

// 配置日志文件
logger.setLogFile('logs/app.log');
```

**日志格式示例**:
```json
{
  "timestamp": "2025-01-27T10:30:00.000Z",
  "level": "info",
  "message": "用户登录成功",
  "context": {
    "userId": 123,
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### ✅ 数据验证工具 (`validator.js`)

**功能**: 提供数据验证和清理功能，防止XSS和SQL注入

**验证类型**:
- 邮箱验证
- 密码强度验证
- URL验证
- 数字范围验证
- 字符串长度验证

**使用方法**:
```javascript
import validator from './tools/scripts/utils/validator.js';

// 邮箱验证
const isValidEmail = validator.isEmail('user@example.com');

// 密码强度验证
const passwordCheck = validator.validatePassword('MyPassword123!');
console.log(passwordCheck); // { valid: true, score: 85, suggestions: [] }

// URL验证
const isValidUrl = validator.isUrl('https://example.com');

// 数字范围验证
const isValidAge = validator.isInRange(25, 18, 65);

// 字符串长度验证
const isValidName = validator.isLength('John', 2, 50);

// 数据清理
const cleanInput = validator.sanitizeInput('<script>alert("xss")</script>');
console.log(cleanInput); // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"

// 批量验证
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
};

const validationResult = validator.validateObject(userData, {
  name: { type: 'string', minLength: 2, maxLength: 50 },
  email: { type: 'email' },
  age: { type: 'number', min: 18, max: 65 }
});

if (!validationResult.valid) {
  console.log('验证失败:', validationResult.errors);
}
```

**自定义验证规则**:
```javascript
// 添加自定义验证器
validator.addValidator('phone', (value) => {
  return /^\+?[\d\s\-\(\)]+$/.test(value);
});

// 使用自定义验证器
const isValidPhone = validator.isPhone('+1-555-123-4567');
```

### 🔒 加密工具 (`crypto-utils.js`)

**功能**: 提供密码哈希、密钥生成和加密解密功能

**主要功能**:
- 密码哈希和验证
- 随机密钥生成
- 数据加密解密
- 数字签名

**使用方法**:
```javascript
import cryptoUtils from './tools/scripts/utils/crypto-utils.js';

// 密码哈希
const hashedPassword = await cryptoUtils.hashPassword('myPassword123');
console.log(hashedPassword); // $2b$10$...

// 密码验证
const isValid = await cryptoUtils.verifyPassword('myPassword123', hashedPassword);
console.log(isValid); // true

// 生成随机密钥
const randomKey = cryptoUtils.generateKey(32);
console.log(randomKey); // 64字符十六进制字符串

// 生成JWT密钥
const jwtSecret = cryptoUtils.generateJwtSecret();
console.log(jwtSecret); // 128字符十六进制字符串

// 数据加密
const encrypted = cryptoUtils.encrypt('sensitive data', 'secret-key');
console.log(encrypted); // 加密后的数据

// 数据解密
const decrypted = cryptoUtils.decrypt(encrypted, 'secret-key');
console.log(decrypted); // "sensitive data"

// 生成数字签名
const signature = cryptoUtils.sign('data to sign', 'private-key');
console.log(signature); // 数字签名

// 验证数字签名
const isValidSignature = cryptoUtils.verify('data to sign', signature, 'public-key');
console.log(isValidSignature); // true
```

**安全配置**:
```javascript
// 配置加密参数
cryptoUtils.setConfig({
  hashRounds: 12,        // bcrypt轮数
  keyLength: 32,         // 密钥长度
  algorithm: 'aes-256-gcm' // 加密算法
});
```

### 📅 日期工具 (`date-utils.js`)

**功能**: 提供日期时间处理、格式化和计算功能

**主要功能**:
- 日期格式化
- 日期计算
- 时区转换
- 相对时间显示

**使用方法**:
```javascript
import dateUtils from './tools/scripts/utils/date-utils.js';

// 格式化日期
const formatted = dateUtils.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
console.log(formatted); // "2025-01-27 10:30:00"

// 相对时间
const relative = dateUtils.fromNow(new Date(Date.now() - 3600000));
console.log(relative); // "1小时前"

// 日期计算
const tomorrow = dateUtils.addDays(new Date(), 1);
const lastWeek = dateUtils.subtractDays(new Date(), 7);

// 时区转换
const utcTime = dateUtils.toUTC(new Date());
const localTime = dateUtils.toLocal(utcTime);

// 日期比较
const isAfter = dateUtils.isAfter(new Date(), yesterday);
const isSameDay = dateUtils.isSameDay(date1, date2);

// 获取时间范围
const startOfDay = dateUtils.startOfDay(new Date());
const endOfDay = dateUtils.endOfDay(new Date());
const startOfWeek = dateUtils.startOfWeek(new Date());
const endOfWeek = dateUtils.endOfWeek(new Date());

// 解析日期字符串
const parsed = dateUtils.parse('2025-01-27', 'YYYY-MM-DD');
console.log(parsed); // Date对象
```

**日期格式**:
```javascript
// 支持的格式
const formats = {
  'YYYY-MM-DD': '2025-01-27',
  'YYYY-MM-DD HH:mm:ss': '2025-01-27 10:30:00',
  'MM/DD/YYYY': '01/27/2025',
  'DD/MM/YYYY': '27/01/2025',
  'YYYY年MM月DD日': '2025年01月27日'
};
```

### 🔤 字符串工具 (`string-utils.js`)

**功能**: 提供字符串处理、转换和格式化功能

**主要功能**:
- 字符串转换
- 文本格式化
- 字符串验证
- 模板处理

**使用方法**:
```javascript
import stringUtils from './tools/scripts/utils/string-utils.js';

// 字符串转换
const camelCase = stringUtils.toCamelCase('hello_world');
console.log(camelCase); // "helloWorld"

const snakeCase = stringUtils.toSnakeCase('helloWorld');
console.log(snakeCase); // "hello_world"

const kebabCase = stringUtils.toKebabCase('helloWorld');
console.log(kebabCase); // "hello-world"

const pascalCase = stringUtils.toPascalCase('hello_world');
console.log(pascalCase); // "HelloWorld"

// 字符串格式化
const truncated = stringUtils.truncate('这是一个很长的字符串', 10);
console.log(truncated); // "这是一个很长的..."

const padded = stringUtils.pad('123', 6, '0');
console.log(padded); // "000123"

// 字符串验证
const isAlpha = stringUtils.isAlpha('hello');
const isNumeric = stringUtils.isNumeric('123');
const isAlphanumeric = stringUtils.isAlphanumeric('hello123');

// 模板处理
const template = 'Hello {{name}}, you have {{count}} messages';
const result = stringUtils.template(template, { name: 'John', count: 5 });
console.log(result); // "Hello John, you have 5 messages"

// 字符串清理
const cleaned = stringUtils.clean('  Hello   World  ');
console.log(cleaned); // "Hello World"

// 随机字符串生成
const randomStr = stringUtils.random(10);
console.log(randomStr); // "aB3dE7fG9h"

// 字符串相似度
const similarity = stringUtils.similarity('hello', 'hallo');
console.log(similarity); // 0.8
```

### ⚙️ 配置加载器 (`config-loader.js`)

**功能**: 提供配置文件加载、验证和管理功能

**支持格式**:
- JSON
- YAML
- JavaScript
- 环境变量

**使用方法**:
```javascript
import configLoader from './tools/scripts/utils/config-loader.js';

// 加载JSON配置
const jsonConfig = configLoader.loadJson('config/app.json');

// 加载YAML配置
const yamlConfig = configLoader.loadYaml('config/database.yml');

// 加载JavaScript配置
const jsConfig = configLoader.loadJs('config/settings.js');

// 加载环境变量
const envConfig = configLoader.loadEnv('.env');

// 合并配置
const mergedConfig = configLoader.merge(
  { database: { host: 'localhost' } },
  { database: { port: 5432 } }
);
console.log(mergedConfig); // { database: { host: 'localhost', port: 5432 } }

// 配置验证
const schema = {
  database: {
    host: { type: 'string', required: true },
    port: { type: 'number', min: 1, max: 65535 },
    name: { type: 'string', required: true }
  }
};

const validationResult = configLoader.validate(config, schema);
if (!validationResult.valid) {
  console.log('配置验证失败:', validationResult.errors);
}

// 配置热重载
configLoader.watch('config/app.json', (newConfig) => {
  console.log('配置已更新:', newConfig);
});
```

**配置模板**:
```javascript
// config/app.json
{
  "app": {
    "name": "Fastify React App",
    "version": "1.0.0",
    "port": 8001
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "fastify_react_app"
  }
}

// config/database.yml
database:
  host: localhost
  port: 5432
  name: fastify_react_app
  ssl: false

// config/settings.js
module.exports = {
  app: {
    name: process.env.APP_NAME || 'Fastify React App',
    port: parseInt(process.env.PORT) || 8001
  }
};
```

---

## 🔧 配置选项

### 环境变量

```bash
# 工具配置
UTILS_LOG_LEVEL=info
UTILS_OUTPUT_FORMAT=json
UTILS_ENABLE_DEBUG=false

# 加密配置
CRYPTO_HASH_ROUNDS=12
CRYPTO_KEY_LENGTH=32
CRYPTO_ALGORITHM=aes-256-gcm

# 文件操作配置
FILE_OPERATION_TIMEOUT=30000
FILE_OPERATION_RETRY_COUNT=3
FILE_OPERATION_BACKUP=true
```

### 配置文件

创建 `utils.config.js` 文件自定义工具配置：

```javascript
module.exports = {
  logger: {
    level: 'info',
    format: 'json',
    output: 'both',
    file: 'logs/utils.log'
  },
  crypto: {
    hashRounds: 12,
    keyLength: 32,
    algorithm: 'aes-256-gcm'
  },
  file: {
    timeout: 30000,
    retryCount: 3,
    backup: true
  },
  validator: {
    strictMode: true,
    customRules: {
      phone: /^\+?[\d\s\-\(\)]+$/
    }
  }
};
```

---

## 🚨 故障排除

### 常见问题

1. **环境变量生成失败**
   ```bash
   # 检查模板文件
   ls -la config/env-templates/
   
   # 检查输出目录权限
   chmod -R 755 .
   ```

2. **文件操作权限错误**
   ```bash
   # 检查文件权限
   ls -la src/
   
   # 修复权限
   chmod -R 644 src/
   chmod -R 755 src/
   ```

3. **加密工具错误**
   ```bash
   # 检查Node.js版本
   node --version
   
   # 更新依赖
   pnpm update
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/utils/env-manager.js

# 启用调试模式
NODE_ENV=development node tools/scripts/utils/logger.js
```

---

## 📅 定时任务

### 设置自动维护

**Linux/macOS (crontab)**:
```bash
# 编辑crontab
crontab -e

# 每天凌晨2点清理日志
0 2 * * * cd /path/to/project && node tools/scripts/utils/logger.js cleanup

# 每周日备份配置文件
0 3 * * 0 cd /path/to/project && node tools/scripts/utils/config-loader.js backup
```

**Windows (任务计划程序)**:
```cmd
# 创建定时任务
schtasks /create /tn "LogCleanup" /tr "node tools/scripts/utils/logger.js cleanup" /sc daily /st 02:00
```

---

## 🔒 安全注意事项

1. **敏感信息保护**
   - 不要将密钥硬编码在代码中
   - 使用环境变量管理敏感配置
   - 定期轮换密钥和密码

2. **文件操作安全**
   - 验证文件路径，防止目录遍历攻击
   - 限制文件操作权限
   - 使用安全的文件传输协议

3. **日志安全**
   - 不要在日志中记录敏感信息
   - 定期清理日志文件
   - 使用安全的日志传输方式

---

## 📚 相关文档

- [环境配置指南](../../../docs/config/environment-config.md)
- [安全最佳实践](../../../docs/security/security-best-practices.md)
- [开发工具指南](../../../docs/development/dev-tools.md)
- [部署配置文档](../../../docs/deployment/deployment-config.md)

---

## 🤝 贡献指南

1. 添加新工具时，请提供完整的文档和示例
2. 确保所有工具都有适当的错误处理
3. 添加单元测试验证工具功能
4. 遵循项目的代码风格和规范

---

*最后更新: 2025-01-27*