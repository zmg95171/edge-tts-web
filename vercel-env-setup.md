# Vercel 环境变量设置指南

## 问题诊断

您的应用部署到 Vercel 后无法连接到 TTS 服务，这是因为服务配置中缺少必要的 API URL 环境变量。

## 解决方案

### 1. 在 Vercel 中设置环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 (`edge-tts-web`)
3. 点击 "Settings" 选项卡
4. 在左侧菜单中点击 "Environment Variables"
5. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `TTS_API_URL` | `https://tts.2068.online` | Production, Preview, Development |
| `WHISPER_API_URL` | `https://whisper.2068.online` | Production, Preview, Development |

#### 可选的环境变量（用于 LLM 功能）

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `OPENAI_API_KEY` | 您的 OpenAI API Key | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | 您的 Anthropic API Key | Production, Preview, Development |

6. 点击 "Save" 保存设置

### 2. 重新部署

添加环境变量后，您需要重新部署应用：

1. 在 Vercel 项目页面中，点击 "Deployments" 选项卡
2. 找到最新的部署，点击右侧的三个点（...）
3. 选择 "Redeploy"
4. 或者，推送到 GitHub 仓库以触发新的部署

### 3. 验证设置

部署完成后，您可以：

1. 访问应用：https://edge-tts-sx4vebu7k-zmg95171s-projects-63587fbe.vercel.app/
2. 尝试使用 TTS 功能
3. 打开浏览器开发者工具，查看控制台是否还有错误

## 本地开发环境

在本地开发时，您可以使用以下方法之一：

### 方法1：使用 Vite 代理（推荐）

Vite 配置已经设置了代理，将自动路由到正确的 API：

- `/api/tts/*` → `https://tts.2068.online/api/tts/*`
- `/api/whisper/*` → `https://whisper.2068.online/api/whisper/*`

### 方法2：使用环境变量

1. 复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，根据需要修改 API URL

## 故障排除

### 检查 API 端点

如果设置环境变量后仍有问题，请检查 API 端点是否可用：

1. 检查 TTS API：
   - 访问 `https://tts.2068.online/api/tts/voices`
   - 应返回 JSON 格式的声音列表

2. 检查 Whisper API：
   - 访问 `https://whisper.2068.online/api/whisper/health`
   - 应返回健康状态

### 查看网络请求

在浏览器开发者工具中：

1. 打开 "Network" 选项卡
2. 尝试使用 TTS 功能
3. 查看请求 URL 和响应状态码
4. 检查请求头和响应内容

### 常见问题

1. **CORS 错误**：确保 API 服务器允许来自您域名的请求
2. **404 错误**：检查 API URL 是否正确
3. **超时错误**：检查网络连接和 API 服务器状态

## 联系支持

如果问题仍然存在，请：

1. 提供浏览器控制台错误截图
2. 提供 Network 选项卡中的请求详情
3. 提供您的 Vercel 部署 URL
4. 提供您设置的环境变量列表（隐藏敏感信息）

---

设置完成后，您的应用应该能够正常使用 TTS 和 Whisper 服务了。