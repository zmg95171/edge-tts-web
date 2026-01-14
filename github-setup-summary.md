# GitHub 推送和版本控制设置总结

## 已完成的工作

### 1. 初始化 Git 仓库
- ✅ 初始化本地 Git 仓库
- ✅ 配置 Git 用户信息
- ✅ 更新 .gitignore 文件，确保敏感信息不会被提交

### 2. 版本控制配置
- ✅ 在 package.json 中添加版本控制脚本
- ✅ 创建自动化部署脚本 (deploy.js)
- ✅ 设置版本发布命令 (patch/minor/major)

### 3. GitHub 工作流
- ✅ 添加自动部署到 Vercel 的 GitHub Actions 工作流
- ✅ 添加版本发布工作流，自动创建 GitHub Release

### 4. 文档和指南
- ✅ 更新 README.md，添加项目说明和部署指南
- ✅ 创建 setup-github.md，详细的 GitHub 推送步骤
- ✅ 创建 version-control-commands.md，版本控制快速参考

## 下一步操作

### 1. 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com) 并登录
2. 点击 "+" 图标，选择 "New repository"
3. 填写仓库信息：
   - 名称: `edge-tts-web`
   - 描述: Edge-TTS 文本朗读 Web 应用
   - 公开或私有 (根据需要)
   - 不要初始化 README、.gitignore 或 LICENSE

### 2. 连接并推送代码
```bash
# 添加远程仓库 (替换为您的实际 URL)
git remote add origin https://github.com/您的用户名/edge-tts-web.git

# 推送到 GitHub
git push -u origin main
```

### 3. 配置 Vercel 部署
1. 访问 [Vercel](https://vercel.com) 并登录
2. 导入 GitHub 仓库
3. 配置环境变量:
   - `TTS_API_URL`: `https://tts.2068.online`
   - `WHISPER_API_URL`: `https://whisper.2068.online`
4. 部署应用

### 4. 配置 GitHub Secrets (用于 GitHub Actions)
在 GitHub 仓库设置中添加以下 Secrets:
- `VERCEL_TOKEN`: Vercel API 令牌
- `ORG_ID`: Vercel 组织 ID
- `PROJECT_ID`: Vercel 项目 ID

## 日常开发工作流

### 提交和发布更改
```bash
# 1. 添加并提交更改
git add .
git commit -m "您的提交信息"

# 2. 推送到 GitHub (会自动触发 Vercel 部署)
git push origin main

# 3. 如需发布新版本
npm run release        # 发布补丁版本
npm run release:minor   # 发布次版本
npm run release:major   # 发布主版本
```

### 创建功能分支
```bash
# 创建新分支
git checkout -b feature/new-feature

# 开发和提交
git add .
git commit -m "添加新功能"

# 推送分支
git push origin feature/new-feature
```

### 紧急修复
```bash
# 创建修复分支
git checkout -b hotfix/urgent-fix

# 修复并提交
git add .
git commit -m "紧急修复: 问题描述"

# 合并并发布
git checkout main
git merge hotfix/urgent-fix
npm run release:patch
```

## 项目文件结构

```
edge-tts-web/
├── .github/workflows/      # GitHub Actions 工作流
│   ├── deploy.yml         # 自动部署到 Vercel
│   └── release.yml        # 版本发布工作流
├── api/                   # API 路由 (用于 Vercel)
├── components/            # React 组件
├── services/              # API 服务
├── utils/                 # 工具函数
├── deploy.js             # 部署脚本
├── github-setup-summary.md # 本文件
├── setup-github.md        # GitHub 设置指南
├── version-control-commands.md # 版本控制命令参考
├── Vercel 部署配置.md      # Vercel 部署配置指南
├── package.json          # 项目配置和脚本
└── README.md             # 项目说明
```

## 自动化流程

### 1. 自动部署
- 推送代码到 main 分支
- GitHub Actions 自动触发构建
- 自动部署到 Vercel

### 2. 自动版本发布
- 创建版本标签 (`git tag v1.0.0`)
- 推送标签 (`git push --tags`)
- GitHub Actions 自动创建 Release

### 3. 使用部署脚本
```bash
node deploy.js patch origin   # 发布补丁版本并部署
node deploy.js minor origin   # 发布次版本并部署
node deploy.js major origin   # 发布主版本并部署
```

## 总结

通过以上设置，您的项目现在具有：

1. **完整的版本控制**: 使用 Git 进行代码管理，支持分支、标签和合并
2. **自动化部署**: 推送到 GitHub 自动触发 Vercel 部署
3. **版本发布流程**: 使用脚本自动更新版本号和创建 Release
4. **详细的文档**: 包含设置指南、命令参考和最佳实践

现在您可以安全地将代码推送到 GitHub，并享受自动化部署和版本控制带来的便利！