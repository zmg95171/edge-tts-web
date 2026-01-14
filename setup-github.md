# GitHub 推送设置指南

## 步骤 1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 图标，选择 "New repository"
3. 填写仓库信息：
   - 仓库名称：`edge-tts-web`
   - 描述：Edge-TTS 文本朗读 Web 应用
   - 选择公开或私有（根据您的需求）
   - 不要初始化 README、.gitignore 或 LICENSE（我们已经有了）

## 步骤 2：连接本地仓库到远程仓库

创建仓库后，GitHub 会显示快速设置页面。复制类似以下的命令（替换为您的实际用户名和仓库名）：

```bash
# 将远程仓库添加到本地仓库
git remote add origin https://github.com/您的用户名/edge-tts-web.git

# 推送代码到 GitHub
git push -u origin main
```

## 步骤 3：验证推送

检查您的 GitHub 仓库页面，确认所有文件都已成功上传。

## 步骤 4：设置版本标签（可选）

为了更好地管理版本，您可以创建初始版本标签：

```bash
# 创建并推送 v1.0.0 标签
npm run version:minor
```

这将自动更新版本号并推送标签到 GitHub。

## 步骤 5：配置 Vercel（部署准备）

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置环境变量：
   - `TTS_API_URL`: `https://tts.2068.online`
   - `WHISPER_API_URL`: `https://whisper.2068.online`
   - 可选：`OPENAI_API_KEY` 和 `ANTHROPIC_API_KEY`
5. 点击 "Deploy"

## 日常开发工作流

### 提交新更改

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "您的提交信息"

# 推送到 GitHub
git push origin main
```

### 发布新版本

```bash
# 发布补丁版本 (例如 1.0.0 → 1.0.1)
npm run version:patch

# 发布次版本 (例如 1.0.0 → 1.1.0)
npm run version:minor

# 发布主版本 (例如 1.0.0 → 2.0.0)
npm run version:major
```

### 查看历史和标签

```bash
# 查看提交历史
git log --oneline

# 查看所有标签
git tag

# 查看特定标签的详细信息
git show v1.0.0
```

## 故障排除

### 推送被拒绝

如果遇到推送被拒绝的错误，可能是因为远程仓库有您本地没有的更改：

```bash
# 获取远程更改并合并
git pull origin main --rebase

# 然后再次推送
git push origin main
```

### 认证问题

如果遇到认证问题，请确保已设置 Git 凭据：

```bash
# 设置用户名和邮箱（如果尚未设置）
git config --global user.name "您的姓名"
git config --global user.email "您的邮箱"

# 或使用 Git 凭据管理器
git config --global credential.helper manager-core
```

## 下一步

推送代码到 GitHub 后，您可以：

1. 设置 GitHub Pages（如果需要静态托管）
2. 配置 GitHub Actions（自动部署）
3. 邀请协作者
4. 设置项目看板和里程碑