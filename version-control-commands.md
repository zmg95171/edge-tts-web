# 版本控制快速参考

## 基本命令

### 初始设置
```bash
git init                                    # 初始化仓库
git config --global user.name "你的名字"     # 设置用户名
git config --global user.email "你的邮箱"    # 设置邮箱
```

### 日常操作
```bash
git add .                                   # 添加所有更改
git commit -m "提交信息"                     # 提交更改
git push origin main                        # 推送到远程仓库
git pull origin main                        # 拉取远程更改
git status                                  # 查看状态
git log --oneline                           # 查看提交历史
```

## 项目特定命令

### 版本发布
```bash
npm run release         # 发布补丁版本 (v1.0.0 → v1.0.1)
npm run release:minor   # 发布次版本 (v1.0.0 → v1.1.0)
npm run release:major   # 发布主版本 (v1.0.0 → v2.0.0)
```

### 手动版本管理
```bash
npm version patch       # 更新补丁版本号
npm version minor       # 更新次版本号
npm version major       # 更新主版本号
git tag                 # 列出所有标签
git tag v1.0.0          # 创建标签
git push --tags         # 推送所有标签
```

### 部署脚本
```bash
node deploy.js [patch|minor|major] [remote]
# 示例:
node deploy.js patch origin     # 发布补丁版本并推送到 origin
node deploy.js minor            # 发布次版本并推送到默认远程
```

## Git 工作流程

### 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发和提交
git add .
git commit -m "添加新功能"

# 3. 推送分支
git push origin feature/new-feature

# 4. 合并到主分支
git checkout main
git merge feature/new-feature

# 5. 推送主分支
git push origin main

# 6. 删除功能分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### 紧急修复流程
```bash
# 1. 从主分支创建修复分支
git checkout -b hotfix/urgent-fix

# 2. 修复问题
git add .
git commit -m "紧急修复: 问题描述"

# 3. 合并回主分支
git checkout main
git merge hotfix/urgent-fix

# 4. 立即发布
npm run release:patch

# 5. 删除修复分支
git branch -d hotfix/urgent-fix
```

## 查看与比较

### 查看历史
```bash
git log --oneline --graph                    # 图形化提交历史
git log --since="2 weeks ago"               # 最近两周的提交
git log --author="作者名"                    # 特定作者的提交
git log --grep="关键词"                      # 搜索提交信息
```

### 查看差异
```bash
git diff                                    # 工作目录与暂存区差异
git diff --staged                           # 暂存区与最新提交差异
git diff HEAD                               # 工作目录与最新提交差异
git diff v1.0.0 v1.1.0                     # 两个版本之间的差异
```

### 查看特定文件
```bash
git show HEAD:文件路径                       # 查看特定提交中的文件
git blame 文件路径                           # 查看文件每行的修改信息
```

## 撤销与恢复

### 撤销更改
```bash
git checkout -- 文件路径                    # 撤销工作目录中的更改
git reset HEAD 文件路径                      # 取消暂存区中的文件
git reset --hard HEAD                       # 重置到最新提交，丢弃所有更改
git revert 提交ID                           # 创建新提交撤销指定提交
```

### 恢复文件
```bash
git checkout 提交ID -- 文件路径             # 从特定提交恢复文件
git restore 文件路径                         # 恢复文件到最新提交状态
```

## 与 Vercel 集成

### 手动触发 Vercel 部署
```bash
git commit --allow-empty -m "触发 Vercel 部署"
git push origin main
```

### 查看部署状态
```bash
# 通过 GitHub Actions 查看
# 访问 https://github.com/你的用户名/edge-tts-web/actions
```

## 常见问题解决

### 推送被拒绝
```bash
git pull origin main --rebase               # 拉取并变基
git push origin main                        # 再次推送
```

### 合并冲突
```bash
git status                                  # 查看冲突文件
# 手动编辑文件解决冲突
git add 冲突文件路径                         # 标记为已解决
git commit                                  # 完成合并
```

### 撤销错误的提交
```bash
git reset --soft HEAD~1                     # 撤销最后一次提交，保留更改
git reset --hard HEAD~1                     # 撤销最后一次提交，丢弃更改
```

## 快速备忘单

| 任务 | 命令 |
|------|------|
| 初始化项目 | `git init && git add . && git commit -m "Initial commit"` |
| 连接远程仓库 | `git remote add origin <URL>` |
| 首次推送 | `git push -u origin main` |
| 发布补丁版本 | `npm run release` |
| 查看历史 | `git log --oneline --graph` |
| 创建功能分支 | `git checkout -b feature/name` |
| 合并分支 | `git merge branch-name` |
| 解决冲突后提交 | `git add . && git commit` |