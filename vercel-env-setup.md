# Vercel 部署配置指南

## 更新说明 (2026-01-14)

TTS服务已更新为使用Google Translate TTS API,无需额外的API URL配置。新的TTS服务:
- 使用Google Translate TTS API (公开免费API)
- 无需设置API密钥
- 支持多种语言
- 自动回退到Yandex TTS API作为备选

## 原问题诊断

之前的应用部署到 Vercel 后无法连接到 TTS 服务，这是因为原有的TTS API服务 (https://tts.2068.online) 缺少TTS合成端点,导致404错误。

## 解决方案

### 1. TTS服务 (无需配置)

新的TTS服务使用Google Translate公开API,无需任何配置:
- 主服务: `https://translate.google.com/translate_tts`
- 备用服务: `https://tts.voicetech.yandex.net/tts`
- 支持语言: 自动根据语音ID识别

### 2. Whisper API (可选配置)

如果需要使用Whisper语音识别功能,请配置Whisper API URL:

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 (`edge-tts-web`)
3. 点击 "Settings" 选项卡
4. 在左侧菜单中点击 "Environment Variables"
5. 添加以下环境变量:

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `WHISPER_API_URL` | `https://whisper.2068.online` | Production, Preview, Development |

6. 点击 "Save" 保存设置

### 3. LLM功能 (可选配置)

如果需要使用LLM功能,请配置相应的API密钥:

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `OPENAI_API_KEY` | 您的 OpenAI API Key | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | 您的 Anthropic API Key | Production, Preview, Development |

### 4. 重新部署

添加环境变量后,您需要重新部署应用:

1. 在 Vercel 项目页面中,点击 "Deployments" 选项卡
2. 找到最新的部署,点击右侧的三个点（...）
3. 选择 "Redeploy"
4. 或者,推送到 GitHub 仓库以触发新的部署

### 5. 验证设置

部署完成后,您可以:

1. 访问应用:https://edge-tts-sx4vebu7k-zmg95171s-projects-63587fbe.vercel.app/
2. 尝试使用 TTS 功能 (应该正常工作,无需额外配置)
3. 如果配置了Whisper,也可以测试语音识别功能
4. 打开浏览器开发者工具,查看控制台是否还有错误

## 本地开发环境

在本地开发时,您可以直接使用,无需额外配置:

```bash
npm run dev
```

TTS服务会自动使用Google Translate API。

## 故障排除

### TTS功能测试

如果TTS功能出现问题:

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Network" 选项卡
3. 尝试使用 TTS 功能
4. 查找请求到 `translate.google.com` 或 `voicetech.yandex.net` 的请求
5. 检查请求状态码和响应内容

### Whisper API 测试

如果需要使用Whisper功能:

1. 检查环境变量是否正确设置
2. 检查API端点是否可用:
   - 访问 `https://whisper.2068.online/api/whisper/health`
   - 应返回健康状态

### 常见问题

1. **CORS 错误**: Google Translate TTS API可能需要特殊的Referer头,已在前端代码中配置
2. **请求频率限制**: Google TTS可能有请求频率限制,大量请求可能被阻止
3. **网络问题**: 确保能够访问Google和Yandex服务

## 联系支持

如果问题仍然存在,请:

1. 提供浏览器控制台错误截图
2. 提供 Network 选项卡中的请求详情
3. 提供您的 Vercel 部署 URL
4. 说明您尝试使用的语言和语音

---

设置完成后,您的应用应该能够正常使用TTS功能了。TTS服务无需额外配置即可使用。