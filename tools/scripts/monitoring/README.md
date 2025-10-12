# 📊 监控脚本工具集

**位置**: `tools/scripts/monitoring/`  
**用途**: 系统监控、性能分析和健康检查  
**更新时间**: 2025-01-27  

## 📋 脚本概览

| 脚本名称                 | 功能描述     | 使用场景                 |
| ------------------------ | ------------ | ------------------------ |
| `health-check.js`        | 系统健康检查 | 检查服务状态和系统资源   |
| `performance-monitor.js` | 性能监控     | 监控应用性能和资源使用   |
| `log-analyzer.js`        | 日志分析     | 分析应用日志和错误统计   |
| `system-monitor.js`      | 系统监控     | 监控服务器资源和网络状态 |

---

## 🚀 快速开始

### 1. 系统健康检查
```bash
# 执行健康检查
pnpm run health:check
# 或
node tools/scripts/monitoring/health-check.js
```

### 2. 性能监控
```bash
# 启动性能监控
pnpm run monitor:performance
# 或
node tools/scripts/monitoring/performance-monitor.js
```

### 3. 日志分析
```bash
# 分析应用日志
pnpm run logs:analyze
# 或
node tools/scripts/monitoring/log-analyzer.js
```

### 4. 系统监控
```bash
# 监控系统资源
pnpm run monitor:system
# 或
node tools/scripts/monitoring/system-monitor.js
```

---

## 📖 详细使用说明

### 🏥 健康检查脚本 (`health-check.js`)

**功能**: 全面检查系统健康状态，包括服务状态、数据库连接、API响应、资源使用等

**检查项目**:
- 服务状态检查
- 数据库连接检查
- API端点健康检查
- 系统资源检查
- 网络连接检查
- 配置文件检查

**使用方法**:
```bash
# 基本健康检查
node tools/scripts/monitoring/health-check.js

# 详细健康检查
node tools/scripts/monitoring/health-check.js --verbose

# 输出到文件
node tools/scripts/monitoring/health-check.js --output health-report.json
```

**输出示例**:
```
🏥 开始系统健康检查...

📊 检查服务状态...
  ✅ API服务: 运行中 (端口: 8001)
  ✅ Web服务: 运行中 (端口: 5173)
  ✅ 数据库服务: 运行中 (端口: 5432)
  ✅ Redis服务: 运行中 (端口: 6379)

🗄️ 检查数据库连接...
  ✅ PostgreSQL连接: 正常
  ✅ 数据库查询: 正常
  ✅ 连接池状态: 正常

🌐 检查API端点...
  ✅ GET /health: 200ms
  ✅ GET /api/users: 150ms
  ✅ POST /api/auth/login: 200ms
  ✅ 平均响应时间: 183ms

💾 检查系统资源...
  ✅ CPU使用率: 25%
  ✅ 内存使用率: 60%
  ✅ 磁盘使用率: 45%
  ✅ 网络状态: 正常

📁 检查配置文件...
  ✅ 环境配置: 完整
  ✅ 数据库配置: 正确
  ✅ 安全配置: 通过

🎉 健康检查完成！
📊 总体状态: 健康 ✅
📊 检查项目: 15/15 通过
📊 响应时间: 平均 183ms
```

**健康检查报告示例**:
```json
{
  "timestamp": "2025-01-27T10:30:00.000Z",
  "overall_status": "healthy",
  "checks": {
    "services": {
      "status": "healthy",
      "details": {
        "api": { "status": "running", "port": 8001, "response_time": 200 },
        "web": { "status": "running", "port": 5173, "response_time": 150 },
        "database": { "status": "running", "port": 5432, "response_time": 100 },
        "redis": { "status": "running", "port": 6379, "response_time": 50 }
      }
    },
    "database": {
      "status": "healthy",
      "details": {
        "connection": "success",
        "query_time": 50,
        "pool_status": "active"
      }
    },
    "api_endpoints": {
      "status": "healthy",
      "details": {
        "/health": { "status": 200, "response_time": 200 },
        "/api/users": { "status": 200, "response_time": 150 },
        "/api/auth/login": { "status": 200, "response_time": 200 }
      }
    },
    "system_resources": {
      "status": "healthy",
      "details": {
        "cpu_usage": 25,
        "memory_usage": 60,
        "disk_usage": 45,
        "network_status": "normal"
      }
    }
  },
  "summary": {
    "total_checks": 15,
    "passed_checks": 15,
    "failed_checks": 0,
    "average_response_time": 183
  }
}
```

### 📈 性能监控脚本 (`performance-monitor.js`)

**功能**: 实时监控应用性能指标，包括响应时间、吞吐量、错误率、资源使用等

**监控指标**:
- API响应时间
- 请求吞吐量
- 错误率统计
- 内存使用情况
- CPU使用情况
- 数据库性能
- 缓存命中率

**使用方法**:
```bash
# 启动性能监控
node tools/scripts/monitoring/performance-monitor.js

# 监控指定时间
node tools/scripts/monitoring/performance-monitor.js --duration 300

# 输出到文件
node tools/scripts/monitoring/performance-monitor.js --output performance.json

# 设置监控间隔
node tools/scripts/monitoring/performance-monitor.js --interval 5
```

**输出示例**:
```
📈 启动性能监控...

⏱️ 监控配置:
  - 监控时长: 300秒
  - 监控间隔: 5秒
  - 输出文件: performance.json

📊 开始监控...

[00:05] 📊 性能指标:
  ✅ API响应时间: 平均 150ms (P95: 300ms)
  ✅ 请求吞吐量: 120 req/min
  ✅ 错误率: 0.5%
  ✅ 内存使用: 512MB (60%)
  ✅ CPU使用: 25%
  ✅ 数据库查询: 平均 50ms
  ✅ 缓存命中率: 85%

[00:10] 📊 性能指标:
  ✅ API响应时间: 平均 145ms (P95: 280ms)
  ✅ 请求吞吐量: 135 req/min
  ✅ 错误率: 0.3%
  ✅ 内存使用: 520MB (61%)
  ✅ CPU使用: 28%
  ✅ 数据库查询: 平均 45ms
  ✅ 缓存命中率: 87%

[00:15] 📊 性能指标:
  ⚠️ API响应时间: 平均 200ms (P95: 400ms)
  ✅ 请求吞吐量: 110 req/min
  ⚠️ 错误率: 1.2%
  ✅ 内存使用: 540MB (63%)
  ✅ CPU使用: 35%
  ⚠️ 数据库查询: 平均 80ms
  ✅ 缓存命中率: 82%

🎉 性能监控完成！
📊 监控时长: 300秒
📊 平均响应时间: 165ms
📊 平均吞吐量: 122 req/min
📊 平均错误率: 0.7%
📊 性能报告已保存: performance.json
```

**性能监控报告示例**:
```json
{
  "monitoring_session": {
    "start_time": "2025-01-27T10:30:00.000Z",
    "end_time": "2025-01-27T10:35:00.000Z",
    "duration": 300,
    "interval": 5
  },
  "performance_metrics": {
    "api_response_time": {
      "average": 165,
      "p95": 350,
      "p99": 500,
      "min": 50,
      "max": 800
    },
    "throughput": {
      "average": 122,
      "peak": 150,
      "min": 80
    },
    "error_rate": {
      "average": 0.7,
      "peak": 2.1,
      "total_errors": 15
    },
    "resource_usage": {
      "memory": {
        "average": 525,
        "peak": 580,
        "unit": "MB"
      },
      "cpu": {
        "average": 29,
        "peak": 45,
        "unit": "%"
      }
    },
    "database": {
      "query_time": {
        "average": 58,
        "p95": 120,
        "unit": "ms"
      },
      "connection_pool": {
        "active": 8,
        "idle": 2,
        "total": 10
      }
    },
    "cache": {
      "hit_rate": {
        "average": 84.7,
        "unit": "%"
      }
    }
  },
  "alerts": [
    {
      "timestamp": "2025-01-27T10:32:30.000Z",
      "type": "high_response_time",
      "message": "API响应时间超过阈值: 400ms",
      "severity": "warning"
    },
    {
      "timestamp": "2025-01-27T10:33:15.000Z",
      "type": "high_error_rate",
      "message": "错误率超过阈值: 1.2%",
      "severity": "warning"
    }
  ]
}
```

### 📋 日志分析脚本 (`log-analyzer.js`)

**功能**: 分析应用日志，统计错误、性能指标、用户行为等，生成分析报告

**分析内容**:
- 错误日志统计
- 性能日志分析
- 用户行为分析
- 安全事件检测
- 系统事件统计
- 趋势分析

**使用方法**:
```bash
# 分析最近24小时日志
node tools/scripts/monitoring/log-analyzer.js

# 分析指定时间范围
node tools/scripts/monitoring/log-analyzer.js --start "2025-01-26" --end "2025-01-27"

# 分析指定日志文件
node tools/scripts/monitoring/log-analyzer.js --file logs/app.log

# 输出详细报告
node tools/scripts/monitoring/log-analyzer.js --verbose
```

**输出示例**:
```
📋 开始日志分析...

📁 扫描日志文件...
  ✅ 发现 5 个日志文件
  ✅ 总大小: 125MB
  ✅ 时间范围: 2025-01-26 00:00:00 - 2025-01-27 10:30:00

🔍 分析错误日志...
  📊 总错误数: 45
  📊 错误类型分布:
    - 数据库错误: 15 (33%)
    - 认证错误: 12 (27%)
    - 验证错误: 10 (22%)
    - 系统错误: 8 (18%)

📈 分析性能日志...
  📊 平均响应时间: 180ms
  📊 慢查询统计: 8个
  📊 高负载时段: 14:00-16:00

👥 分析用户行为...
  📊 活跃用户: 1,250
  📊 页面访问: 15,600
  📊 API调用: 45,200
  📊 热门端点: /api/users, /api/auth/login

🔒 分析安全事件...
  📊 登录尝试: 2,500
  📊 失败登录: 150 (6%)
  📊 可疑活动: 3
  📊 安全事件: 0

📊 生成趋势分析...
  📈 错误趋势: 下降 15%
  📈 性能趋势: 稳定
  📈 用户增长: 上升 8%

🎉 日志分析完成！
📊 分析报告已保存: log-analysis-report.json
```

**日志分析报告示例**:
```json
{
  "analysis_period": {
    "start": "2025-01-26T00:00:00.000Z",
    "end": "2025-01-27T10:30:00.000Z",
    "duration": "34.5 hours"
  },
  "log_files": {
    "total_files": 5,
    "total_size": "125MB",
    "files": [
      {
        "name": "logs/app.log",
        "size": "45MB",
        "lines": 125000
      },
      {
        "name": "logs/error.log",
        "size": "15MB",
        "lines": 25000
      },
      {
        "name": "logs/access.log",
        "size": "65MB",
        "lines": 200000
      }
    ]
  },
  "error_analysis": {
    "total_errors": 45,
    "error_types": {
      "database": { "count": 15, "percentage": 33 },
      "authentication": { "count": 12, "percentage": 27 },
      "validation": { "count": 10, "percentage": 22 },
      "system": { "count": 8, "percentage": 18 }
    },
    "error_trend": "decreasing",
    "trend_percentage": -15
  },
  "performance_analysis": {
    "average_response_time": 180,
    "slow_queries": 8,
    "high_load_periods": ["14:00-16:00"],
    "performance_trend": "stable"
  },
  "user_behavior": {
    "active_users": 1250,
    "page_views": 15600,
    "api_calls": 45200,
    "popular_endpoints": [
      { "endpoint": "/api/users", "calls": 8500 },
      { "endpoint": "/api/auth/login", "calls": 6200 },
      { "endpoint": "/api/posts", "calls": 4800 }
    ],
    "user_growth": 8
  },
  "security_analysis": {
    "login_attempts": 2500,
    "failed_logins": 150,
    "failure_rate": 6,
    "suspicious_activities": 3,
    "security_incidents": 0
  },
  "recommendations": [
    "数据库错误较多，建议优化查询性能",
    "认证错误率偏高，建议检查登录逻辑",
    "慢查询需要优化，建议添加索引",
    "用户增长良好，建议扩容服务器资源"
  ]
}
```

### 🖥️ 系统监控脚本 (`system-monitor.js`)

**功能**: 监控服务器系统资源，包括CPU、内存、磁盘、网络等，提供实时系统状态

**监控项目**:
- CPU使用率和负载
- 内存使用情况
- 磁盘空间和IO
- 网络连接状态
- 进程状态
- 系统服务状态

**使用方法**:
```bash
# 启动系统监控
node tools/scripts/monitoring/system-monitor.js

# 监控指定时间
node tools/scripts/monitoring/system-monitor.js --duration 600

# 设置监控间隔
node tools/scripts/monitoring/system-monitor.js --interval 10

# 输出到文件
node tools/scripts/monitoring/system-monitor.js --output system-status.json
```

**输出示例**:
```
🖥️ 启动系统监控...

⏱️ 监控配置:
  - 监控时长: 600秒
  - 监控间隔: 10秒
  - 输出文件: system-status.json

📊 开始系统监控...

[00:10] 🖥️ 系统状态:
  ✅ CPU使用率: 25% (负载: 1.2)
  ✅ 内存使用: 4.2GB/8GB (52%)
  ✅ 磁盘使用: 120GB/500GB (24%)
  ✅ 网络状态: 正常 (上行: 1.2MB/s, 下行: 5.8MB/s)
  ✅ 进程数: 156
  ✅ 系统服务: 全部正常

[00:20] 🖥️ 系统状态:
  ✅ CPU使用率: 30% (负载: 1.5)
  ✅ 内存使用: 4.5GB/8GB (56%)
  ✅ 磁盘使用: 120GB/500GB (24%)
  ✅ 网络状态: 正常 (上行: 1.5MB/s, 下行: 6.2MB/s)
  ✅ 进程数: 158
  ✅ 系统服务: 全部正常

[00:30] 🖥️ 系统状态:
  ⚠️ CPU使用率: 65% (负载: 2.8)
  ✅ 内存使用: 5.2GB/8GB (65%)
  ✅ 磁盘使用: 120GB/500GB (24%)
  ✅ 网络状态: 正常 (上行: 2.1MB/s, 下行: 8.5MB/s)
  ✅ 进程数: 162
  ✅ 系统服务: 全部正常

🎉 系统监控完成！
📊 监控时长: 600秒
📊 平均CPU使用率: 40%
📊 平均内存使用率: 58%
📊 系统状态报告已保存: system-status.json
```

**系统监控报告示例**:
```json
{
  "monitoring_session": {
    "start_time": "2025-01-27T10:30:00.000Z",
    "end_time": "2025-01-27T10:40:00.000Z",
    "duration": 600,
    "interval": 10
  },
  "system_metrics": {
    "cpu": {
      "average_usage": 40,
      "peak_usage": 65,
      "load_average": {
        "1min": 1.8,
        "5min": 1.5,
        "15min": 1.2
      },
      "unit": "%"
    },
    "memory": {
      "total": 8192,
      "used": 4751,
      "free": 3441,
      "usage_percentage": 58,
      "unit": "MB"
    },
    "disk": {
      "total": 512000,
      "used": 122880,
      "free": 389120,
      "usage_percentage": 24,
      "unit": "MB"
    },
    "network": {
      "upload_speed": {
        "average": 1.6,
        "peak": 2.1,
        "unit": "MB/s"
      },
      "download_speed": {
        "average": 6.8,
        "peak": 8.5,
        "unit": "MB/s"
      }
    },
    "processes": {
      "total": 160,
      "running": 158,
      "sleeping": 2
    },
    "services": {
      "total": 12,
      "running": 12,
      "stopped": 0
    }
  },
  "alerts": [
    {
      "timestamp": "2025-01-27T10:35:00.000Z",
      "type": "high_cpu_usage",
      "message": "CPU使用率超过阈值: 65%",
      "severity": "warning"
    }
  ]
}
```

---

## 🔧 配置选项

### 环境变量

```bash
# 监控脚本配置
MONITORING_OUTPUT_DIR=reports/monitoring
MONITORING_LOG_DIR=logs
MONITORING_ALERT_THRESHOLD_CPU=80
MONITORING_ALERT_THRESHOLD_MEMORY=85
MONITORING_ALERT_THRESHOLD_DISK=90

# 健康检查配置
HEALTH_CHECK_TIMEOUT=30000
HEALTH_CHECK_RETRY_COUNT=3
HEALTH_CHECK_INTERVAL=5000

# 性能监控配置
PERFORMANCE_MONITOR_INTERVAL=5
PERFORMANCE_MONITOR_DURATION=300
PERFORMANCE_ALERT_RESPONSE_TIME=500
PERFORMANCE_ALERT_ERROR_RATE=5

# 日志分析配置
LOG_ANALYZER_MAX_FILE_SIZE=100MB
LOG_ANALYZER_BACKUP_COUNT=10
LOG_ANALYZER_PATTERN_ERROR=ERROR|FATAL
LOG_ANALYZER_PATTERN_WARNING=WARN|WARNING
```

### 命令行参数

```bash
# health-check.js 参数
--verbose              # 详细输出
--output=<file>        # 输出到文件
--format=<format>      # 输出格式 (json/text)
--timeout=<ms>         # 超时时间
--retry=<count>        # 重试次数

# performance-monitor.js 参数
--duration=<seconds>   # 监控时长
--interval=<seconds>   # 监控间隔
--output=<file>        # 输出文件
--threshold=<ms>       # 响应时间阈值
--alerts               # 启用告警

# log-analyzer.js 参数
--start=<date>         # 开始时间
--end=<date>           # 结束时间
--file=<path>          # 指定日志文件
--pattern=<regex>      # 匹配模式
--output=<file>        # 输出文件
--verbose              # 详细输出

# system-monitor.js 参数
--duration=<seconds>   # 监控时长
--interval=<seconds>   # 监控间隔
--output=<file>        # 输出文件
--cpu-threshold=<%>    # CPU使用率阈值
--memory-threshold=<%> # 内存使用率阈值
--disk-threshold=<%>   # 磁盘使用率阈值
```

---

## 🚨 故障排除

### 常见问题

1. **健康检查失败**
   ```bash
   # 检查服务状态
   docker ps
   netstat -tulpn | grep :8001
   
   # 检查数据库连接
   psql -h localhost -p 5432 -U postgres -d fastify_react_app
   
   # 检查环境配置
   cat .env
   ```

2. **性能监控数据异常**
   ```bash
   # 检查系统资源
   top
   htop
   iostat -x 1
   
   # 检查应用日志
   tail -f logs/app.log
   
   # 重启监控服务
   node tools/scripts/monitoring/performance-monitor.js --restart
   ```

3. **日志分析失败**
   ```bash
   # 检查日志文件权限
   ls -la logs/
   
   # 检查日志文件格式
   head -n 10 logs/app.log
   
   # 清理损坏的日志文件
   rm logs/corrupted.log
   ```

4. **系统监控权限错误**
   ```bash
   # 检查系统权限
   whoami
   groups
   
   # 使用sudo运行（谨慎）
   sudo node tools/scripts/monitoring/system-monitor.js
   
   # 检查系统服务状态
   systemctl status
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/monitoring/health-check.js

# 启用调试模式
NODE_ENV=development node tools/scripts/monitoring/performance-monitor.js

# 预览监控数据
node tools/scripts/monitoring/system-monitor.js --dry-run
```

---

## 📅 定时任务

### 设置自动监控

**Linux/macOS (crontab)**:
```bash
# 编辑crontab
crontab -e

# 每5分钟运行健康检查
*/5 * * * * cd /path/to/project && node tools/scripts/monitoring/health-check.js

# 每小时运行性能监控
0 * * * * cd /path/to/project && node tools/scripts/monitoring/performance-monitor.js --duration 300

# 每天凌晨2点分析日志
0 2 * * * cd /path/to/project && node tools/scripts/monitoring/log-analyzer.js

# 每10分钟运行系统监控
*/10 * * * * cd /path/to/project && node tools/scripts/monitoring/system-monitor.js --duration 60
```

**Windows (任务计划程序)**:
```cmd
# 创建健康检查任务
schtasks /create /tn "HealthCheck" /tr "node tools/scripts/monitoring/health-check.js" /sc minute /mo 5

# 创建性能监控任务
schtasks /create /tn "PerformanceMonitor" /tr "node tools/scripts/monitoring/performance-monitor.js --duration 300" /sc hourly

# 创建日志分析任务
schtasks /create /tn "LogAnalyzer" /tr "node tools/scripts/monitoring/log-analyzer.js" /sc daily /st 02:00

# 创建系统监控任务
schtasks /create /tn "SystemMonitor" /tr "node tools/scripts/monitoring/system-monitor.js --duration 60" /sc minute /mo 10
```

---

## 🔒 安全注意事项

1. **监控数据安全**
   - 不要在监控数据中记录敏感信息
   - 加密存储监控报告
   - 限制监控数据访问权限

2. **系统权限管理**
   - 使用最小权限原则
   - 定期审查监控脚本权限
   - 避免使用root权限运行监控脚本

3. **告警安全**
   - 设置合理的告警阈值
   - 避免告警风暴
   - 保护告警通知通道

---

## 📚 相关文档

- [系统监控最佳实践](../../../docs/monitoring/monitoring-best-practices.md)
- [性能优化指南](../../../docs/performance/performance-optimization.md)
- [日志管理策略](../../../docs/logging/log-management.md)
- [告警配置文档](../../../docs/alerts/alert-configuration.md)

---

## 🤝 贡献指南

1. 添加新的监控指标时，请提供完整的文档和示例
2. 确保所有监控脚本都有适当的错误处理
3. 添加测试用例验证监控功能
4. 遵循项目的代码风格和规范

---

*最后更新: 2025-01-27*