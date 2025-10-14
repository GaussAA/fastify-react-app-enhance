# 图片素材目录

这个目录用于存放项目的静态图片资源。

## 📁 目录结构

```
public/images/
├── auth/              # 登录注册相关图片
│   ├── login-bg.jpg   # 登录页面背景图
│   ├── register-bg.jpg # 注册页面背景图
│   └── logo.svg       # 应用Logo
├── dashboard/         # 仪表板相关图片
│   ├── hero-bg.jpg    # 仪表板主背景图
│   └── features/      # 功能特性图片
├── llm/              # AI聊天相关图片
│   ├── ai-avatar.png  # AI头像
│   └── chat-bg.jpg    # 聊天背景图
├── icons/            # 图标文件
│   ├── app-icon.svg   # 应用图标
│   └── feature-icons/ # 功能图标
└── backgrounds/      # 通用背景图片
    ├── gradient-1.jpg # 渐变背景1
    └── pattern-1.svg  # 图案背景1
```

## 🎯 使用方式

### 在组件中使用
```typescript
// 直接引用
<img src="/images/auth/login-bg.jpg" alt="登录背景" />
<img src="/images/llm/ai-avatar.png" alt="AI头像" />

// 在CSS中使用
background-image: url('/images/backgrounds/gradient-1.jpg');
```

### 在React组件中使用
```typescript
function LoginPage() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/auth/login-bg.jpg')" }}
    >
      {/* 页面内容 */}
    </div>
  );
}
```

## 📝 图片规范

### 文件格式
- **JPG**: 适用于照片和复杂图像
- **PNG**: 适用于需要透明背景的图像
- **SVG**: 适用于图标和矢量图形
- **WebP**: 适用于现代浏览器的高效格式

### 命名规范
- 使用小写字母和连字符
- 描述性命名，如 `login-background.jpg`
- 版本号用下划线，如 `logo_v2.svg`

### 尺寸建议
- **背景图**: 1920x1080 或更高分辨率
- **头像**: 200x200 或 400x400
- **图标**: 24x24, 32x32, 48x48, 64x64
- **Logo**: 200x60 或 300x90

## 🚀 优化建议

1. **压缩图片**: 使用工具压缩图片以减少文件大小
2. **响应式图片**: 为不同屏幕尺寸提供不同分辨率的图片
3. **懒加载**: 对非关键图片使用懒加载
4. **CDN**: 考虑使用CDN来加速图片加载

## 📦 推荐工具

- **图片压缩**: [TinyPNG](https://tinypng.com/)
- **格式转换**: [CloudConvert](https://cloudconvert.com/)
- **图标生成**: [Favicon Generator](https://realfavicongenerator.net/)
- **SVG优化**: [SVGO](https://github.com/svg/svgo)
