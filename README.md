# 🔥 Kintone 开发工具集

现代化的 Kintone 自定义开发工具，支持真正的热更新和高效开发流程。

## 🚀 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境
pnpm run setup

# 3. 开始开发 (推荐)
pnpm run dev:hot
```

## 📋 开发模式说明

### 1. **真正热更新模式** (`pnpm run dev:hot`) 🔥
- ⚡ **毫秒级热更新** - 修改代码立即在 Kintone 中生效
- 🌐 **本地 HTTPS 服务器** - 自动生成证书，Kintone 直接从本地加载
- 🔄 **无需上传** - 真正的开发时热更新体验

### 2. **文件上传模式** (`pnpm run dev:upload`) 📤
- 🔨 **自动构建+上传** - 文件变化时自动构建并上传到 Kintone
- 📱 **稳定可靠** - 适合网络受限环境
- ⚡ **比手动操作快 5-10 倍**

### 3. **生产部署** (`pnpm run build:upload`) 🏭
- 🏗️ **生产环境构建** - 代码压缩、优化、单文件打包
- 📦 **所有资源打包成单个文件** - JS/CSS 全部内联
- 🎯 **使用生产环境配置** - 自动读取生产环境变量

## 🔐 HTTPS 证书管理

### 首次使用时：
1. **自动生成证书** - `vite-plugin-mkcert` 自动创建本地 HTTPS 证书
2. **系统提示** - 可能会弹出安全提示，**请选择"允许"**
3. **添加到信任列表** - 证书会自动添加到系统信任列表
4. **仅限本地开发** - 证书只用于本地开发，不影响系统安全

### 证书位置：
```
Windows: C:\Users\{username}\.vite-plugin-mkcert\
  ├── dev.pem    # 私钥
  └── cert.pem   # 证书
```

### 特点：
- ✅ **首次配置后永久有效** - 以后不会再出现提示
- ✅ **自动管理** - 无需手动操作
- ✅ **安全可靠** - 仅限本地开发使用

## 🏭 环境配置说明

### 开发环境 (development)
```bash
# .env 文件配置
DEV_KINTONE_DOMAIN=your-dev.cybozu.com
DEV_KINTONE_USERNAME=dev-user@example.com
DEV_KINTONE_PASSWORD=dev-password
DEV_KINTONE_APP_ID=123
```

### 生产环境 (production)
```bash
# .env 文件配置
KINTONE_DOMAIN=your-prod.cybozu.com
KINTONE_USERNAME=prod-user@example.com
KINTONE_PASSWORD=prod-password
KINTONE_APP_ID=456
```

### 环境使用规则：
- 🔥 **热更新模式** → 开发环境配置
- 📤 **文件上传模式** → 开发环境配置  
- 🏭 **生产部署** → **生产环境配置**

## 📦 打包配置

### 生产环境特点：
- **单文件打包** - 所有 JS/CSS 合并成单个文件
- **资源内联** - 小于 10MB 的资源全部内联
- **代码压缩** - 移除 console.log 和 debugger
- **依赖打包** - 所有外部依赖打包进主文件

### 构建产物：
```
dist/
├── desktop.js    # 桌面端入口 (包含所有依赖和CSS)
├── mobile.js     # 移动端入口 (包含所有依赖)
├── config.js     # 配置页面入口
└── App.css       # 样式文件 (可选，已内联到JS中)
```

## 🌐 网络配置说明

### 为什么使用 localhost 而不是 IP？
1. **兼容性更好** - localhost 在所有环境都能正常工作
2. **证书有效** - HTTPS 证书默认为 localhost 签发
3. **防火墙友好** - 不会被防火墙阻止
4. **Kintone 支持** - Kintone 可以正常访问 localhost

### 如果遇到网络问题：
```bash
# 自动回退到文件上传模式
# 无需手动处理，系统会自动检测并切换
```

## 🛠️ 包管理器

项目使用 **pnpm** 作为首选包管理器：

```bash
# 推荐使用 pnpm
pnpm install
pnpm run dev:hot
pnpm run build:upload

# 也兼容 npm（备用）
npm install
npm run dev:hot
npm run build:upload
```

## 📝 常用命令

```bash
# 开发相关
pnpm run dev:hot      # 真正热更新开发
pnpm run dev:upload   # 文件上传开发
pnpm run dev         # 纯前端开发服务器

# 构建部署
pnpm run build:upload # 生产环境构建+部署
pnpm run build       # 仅构建 (不上传)

# 配置和工具
pnpm run setup       # 交互式环境配置
pnpm run lint        # 代码检查
pnpm run lint:fix    # 自动修复代码问题
```

## 🎯 最佳实践

### 开发流程：
1. **环境配置** - `pnpm run setup` 配置开发和生产环境
2. **日常开发** - `pnpm run dev:hot` 享受毫秒级热更新
3. **生产部署** - `pnpm run build:upload` 一键部署到生产

### 注意事项：
- ✅ 开发时优先使用热更新模式
- ✅ 网络问题时自动回退到上传模式
- ✅ 生产部署前确保配置正确的生产环境变量
- ✅ 生产环境会自动使用单文件打包和代码压缩

## 🔧 故障排除

### 证书问题：
```bash
# 删除旧证书重新生成
rm -rf ~/.vite-plugin-mkcert
pnpm run dev:hot
```

### 网络问题：
```bash
# 使用文件上传模式
pnpm run dev:upload
```

### 构建问题：
```bash
# 清理并重新构建
rm -rf dist node_modules
pnpm install
pnpm run build:upload
```

## 📚 技术栈

- **构建工具**: Vite 5.x
- **框架**: React 18 + TypeScript
- **包管理**: pnpm (推荐) / npm (备用)
- **代码质量**: ESLint + Prettier
- **HTTPS**: vite-plugin-mkcert
- **文件监听**: chokidar
- **API 客户端**: @kintone/rest-api-client

---

🎉 **享受现代化的 Kintone 开发体验！**

## ✨ 特性

- 🚀 **现代化技术栈**: React 18 + TypeScript + Vite
- 🛠️ **开发体验**: 热更新、ESLint、Prettier 代码格式化
- 📱 **多端支持**: 桌面端、移动端、配置页面
- 🔄 **自动部署**: 开发环境热更新、生产环境一键部署
- 🎯 **环境分离**: 开发和生产环境完全分离
- 🔐 **安全认证**: 支持 API Token 和用户名密码认证

## 📁 项目结构

```
├── src/
│   ├── components/
│   │   ├── App.tsx          # 主组件
│   │   └── App.css          # 样式文件
│   ├── desktop.tsx          # 桌面端入口
│   ├── mobile.tsx           # 移动端入口
│   └── config.tsx           # 配置页面入口
├── scripts/
│   ├── utils/
│   │   ├── kintone-client.js # Kintone API 客户端
│   │   └── config.js         # 配置管理
│   ├── dev-upload.js         # 开发环境上传脚本
│   ├── build-upload.js       # 生产环境构建上传脚本
│   └── setup.js             # 配置向导
├── dist/                    # 构建输出目录
├── env.example              # 环境变量模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置
```

## 🔧 配置说明

### 环境变量

复制 `env.example` 为 `.env` 并配置：

```env
# 生产环境
KINTONE_DOMAIN=your-domain.cybozu.com
KINTONE_API_TOKEN=your-api-token
KINTONE_APP_ID=123

# 开发环境
DEV_KINTONE_DOMAIN=dev-domain.cybozu.com
DEV_KINTONE_API_TOKEN=dev-api-token
DEV_KINTONE_APP_ID=456

# 其他配置
DEBUG=false
DEV_PORT=3000
```

### 认证方式

支持两种认证方式：

**1. API Token（推荐）**
```env
KINTONE_API_TOKEN=your-api-token
```

**2. 用户名密码**
```env
KINTONE_USERNAME=your-username
KINTONE_PASSWORD=your-password
```

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm run setup` | 交互式配置向导 |
| `pnpm run dev` | 启动 Vite 开发服务器 |
| `pnpm run dev:upload` | 开发环境热更新上传 |
| `pnpm run build` | 构建生产版本 |
| `pnpm run build:upload` | 构建并上传到生产环境 |
| `pnpm run lint` | 代码检查 |
| `pnpm run format` | 代码格式化 |

## 🎯 开发指南

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `App.tsx` 中引入并使用
3. 修改后会自动热更新到 Kintone

### 多端适配

- **桌面端**: 编辑 `src/desktop.tsx`
- **移动端**: 编辑 `src/mobile.tsx`
- **配置页面**: 编辑 `src/config.tsx`

### 样式开发

- 使用标准 CSS 或 CSS 模块
- 已预设 Kintone 风格的基础样式
- 支持响应式设计

## 🚨 故障排除

### 401 认证错误

1. 检查 API Token 是否正确
2. 确认用户有应用自定义权限
3. 使用 `pnpm run setup` 重新配置

### 构建失败

1. 检查 TypeScript 错误
2. 确认所有依赖已安装
3. 运行 `pnpm run lint` 检查代码

### 上传失败

1. 检查网络连接
2. 确认应用 ID 正确
3. 检查 Kintone 域名配置

## 📖 相关资源

- [Kintone 开发者文档](https://kintone.dev/)
- [Kintone REST API](https://kintone.dev/en/docs/kintone/rest-api/)
- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License 