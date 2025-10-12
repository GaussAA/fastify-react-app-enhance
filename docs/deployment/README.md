# 🚀 部署指南

本指南将帮助您将 Fastify-React-App-Enhance 项目部署到生产环境。

## 🛠️ 生产环境要求

### 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ 推荐)
- **Node.js**: v20+ (推荐 v22)
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 20GB 可用空间
- **网络**: 稳定的网络连接

### 服务依赖

- **PostgreSQL**: v15+ (数据库)
- **Redis**: v7+ (缓存，可选)
- **Nginx**: v1.18+ (反向代理，推荐)

### 可选工具

- **PM2**: 进程管理
- **Docker**: 容器化部署
- **Docker Compose**: 多服务编排

## 🐳 Docker 部署（推荐）

### 使用 Docker Compose

```bash
# 1. 克隆项目
git clone <repository-url>
cd fastify-react-app-enhance

# 2. 配置环境变量
cp config/env-templates/root.env .env
# 编辑 .env 文件，设置生产环境配置

# 3. 启动所有服务
docker-compose -f infrastructure/docker/docker-compose.yml up -d --build

# 4. 查看服务状态
docker-compose -f infrastructure/docker/docker-compose.yml ps
```

### 单独构建镜像

```bash
# 构建 API 镜像
docker build -f infrastructure/docker/fastify.Dockerfile -t fastify-api:latest apps/api/

# 构建 Web 镜像
docker build -f infrastructure/docker/web.Dockerfile -t fastify-web:latest apps/web/

# 运行容器
docker run -d -p 8001:8001 --name api fastify-api:latest
docker run -d -p 5173:5173 --name web fastify-web:latest
```

## 🖥️ 传统部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. 项目部署

```bash
# 1. 克隆项目
git clone <repository-url>
cd fastify-react-app-enhance

# 2. 安装依赖
pnpm install

# 3. 构建项目
pnpm run build

# 4. 配置环境变量
cp config/env-templates/root.env .env
# 编辑 .env 文件

# 5. 设置数据库
pnpm run setup:db
```

### 3. 启动服务

#### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动 API 服务
cd apps/api
pm2 start dist/server.js --name "fastify-api"

# 启动 Web 服务
cd ../web
pm2 start "pnpm run preview" --name "fastify-web"

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 使用 systemd

```bash
# 创建 systemd 服务文件
sudo nano /etc/systemd/system/fastify-api.service
```

```ini
[Unit]
Description=Fastify API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/fastify-react-app-enhance/apps/api
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl enable fastify-api
sudo systemctl start fastify-api
```

## 🌐 Nginx 配置

### 反向代理配置

```nginx
# /etc/nginx/sites-available/fastify-app
server {
    listen 80;
    server_name your-domain.com;

    # API 服务
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Web 应用
    location / {
        proxy_pass http://localhost:5173/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/fastify-app /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 🔒 SSL 证书配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和日志

### 日志管理

```bash
# 查看 PM2 日志
pm2 logs

# 查看 systemd 日志
sudo journalctl -u fastify-api -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 性能监控

```bash
# 安装监控工具
npm install -g pm2-logrotate

# 配置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔄 自动化部署

### GitHub Actions

项目已配置 CI/CD 流水线，支持自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        run: |
          # 部署脚本
          ./scripts/deploy.sh
```

### 部署脚本

```bash
# 使用自动化脚本
pnpm run check:all        # 运行所有检查
pnpm run maintenance      # 系统维护

# 或手动部署
pnpm run test
pnpm run build
pm2 restart all
```

## 🚨 故障排除

### 常见问题

1. **服务无法启动**

   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :8001

   # 检查日志
   pm2 logs fastify-api
   ```

2. **数据库连接失败**

   ```bash
   # 检查数据库状态
   sudo systemctl status postgresql

   # 测试连接
   psql -h localhost -U dev -d mydb
   ```

3. **Nginx 502 错误**

   ```bash
   # 检查后端服务
   curl http://localhost:8001/api/users

   # 检查 Nginx 配置
   sudo nginx -t
   ```

### 性能优化

1. **启用 Gzip 压缩**

   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **配置缓存**

   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **数据库优化**

   ```sql
   -- 创建索引
   CREATE INDEX idx_user_email ON users(email);

   -- 分析查询性能
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
   ```

## 📚 相关文档

- [Docker 部署详情](docker.md)
- [开发指南](../development/README.md)
- [数据库配置](../database/README.md)

---

_最后更新: 2025-01-27_
