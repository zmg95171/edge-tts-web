# Vercel 部署配置

本文档包含将 Edge-TTS Web 应用部署到 Vercel 平台的完整配置文件和说明。

## 📋 部署前置条件

### 1. 账户与平台准备
- ✅ **Vercel 账户**：注册 Vercel 账户（[vercel.com](https://vercel.com)）
- ✅ **Git 仓库**：将项目代码托管到 GitHub、GitLab 或 Bitbucket
- ✅ **版本控制**：确保项目已初始化 Git 仓库并提交代码

### 2. API 服务准备
- ✅ **TTS API 服务**：`https://tts.2068.online`（文本转语音）
- ✅ **Whisper API 服务**：`https://whisper.2068.online`（语音转文字）
- ✅ **OpenAI API Key**（如需 LLM 功能）：从 [platform.openai.com](https://platform.openai.com) 获取
- ✅ **Anthropic API Key**（如需 Claude 功能）：从 [console.anthropic.com](https://console.anthropic.com) 获取

### 3. 开发环境准备
- ✅ **Node.js 环境**：安装 Node.js（建议 v18 或更高版本）
- ✅ **包管理器**：npm、yarn 或 pnpm
- ✅ **Vercel CLI**：安装 Vercel 命令行工具
  ```bash
  npm i -g vercel
  ```

### 4. 项目文件检查清单

确保项目包含以下文件：

```bash
EGDE-TTS-WEB/
├── vercel.json                    # Vercel 配置文件 ⭐
├── package.json                   # 项目依赖配置
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite 构建配置
├── api/                           # API 路由目录
│   ├── tts-edge.ts               # TTS API 代理 ⭐
│   ├── whisper-edge.ts           # Whisper API 代理 ⭐
│   └── llm-edge.ts               # LLM API 代理（可选）
├── services/                      # 前端服务
│   ├── ttsService.ts
│   ├── whisperService.ts
│   └── llmService.ts（可选）
├── components/                     # React 组件
├── App.tsx
├── index.html
└── index.tsx
```

### 5. 安全性准备 ⚠️

**关键步骤 - 必须执行：**

```bash
# 1. 检查 .gitignore 文件，确保包含：
.env.local
.env.*.local
node_modules

# 2. 如果之前提交过 .env.local，立即从 Git 历史中删除：
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 3. 强制推送清理后的历史
git push origin --force --all
git push origin --force --tags
```

### 6. 环境变量配置准备

在 Vercel 控制台中准备以下环境变量：

| 变量名 | 值 | 必需 | 说明 |
|--------|-----|------|------|
| `TTS_API_URL` | `https://tts.2068.online` | ✅ | TTS API 地址 |
| `WHISPER_API_URL` | `https://whisper.2068.online` | ✅ | Whisper API 地址 |
| `OPENAI_API_KEY` | `sk-xxxxx` | 🔶 | OpenAI 密钥（可选） |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | 🔶 | Anthropic 密钥（可选） |

### 7. 代码配置检查

**检查 vercel.json 配置：**
```json
{
  "version": 2,
  "builds": [
    { "src": "index.html", "use": "@vercel/static" },
    { "src": "api/**/*.ts", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-Requested-With, Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 8. 依赖安装

```bash
# 安装项目依赖
npm install

# 确保无版本冲突
npm audit fix
```

### 9. 本地测试

```bash
# 本地测试 API 路由（如果使用 Next.js）
npm run dev

# 测试构建
npm run build
```

### 10. Vercel CLI 登录

```bash
# 登录 Vercel
vercel login
```

## 🎯 部署前的最终检查清单

- [ ] Git 仓库已初始化并推送到远程
- [ ] `.gitignore` 已正确配置（特别是环境变量文件）
- [ ] 敏感信息已从 Git 历史中清除
- [ ] 所有 API 端点文件已创建（`api/` 目录）
- [ ] `vercel.json` 配置正确
- [ ] 本地测试通过
- [ ] 已注册 Vercel 账户
- [ ] 已安装 Vercel CLI
- [ ] API 密钥已准备好（如需要 LLM 功能）
- [ ] 外部 API 服务（TTS、Whisper）可正常访问

## 📝 推荐部署流程

```bash
# 1. 最终提交代码
git add .
git commit -m "准备部署到 Vercel"
git push origin main

# 2. 登录 Vercel
vercel login

# 3. 首次部署（预览）
vercel

# 4. 配置环境变量（通过 Vercel 控制台或 CLI）
vercel env add TTS_API_URL
vercel env add WHISPER_API_URL

# 5. 正式部署
vercel --prod
```

## 1. vercel.json 配置

创建 `vercel.json` 文件并放置在项目根目录下：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "TTS_API_URL": "https://tts.2068.online",
    "WHISPER_API_URL": "https://whisper.2068.online"
  }
}
```

## 2. API 路由文件

### 2.1 TTS API 代理

创建 `api/tts-edge.ts` 文件：

```typescript
// Vercel Edge Function for TTS API proxy
import { NextRequest, NextResponse } from 'next/server';

const TTS_API_URL = process.env.TTS_API_URL || 'https://tts.2068.online';

export const config = {
  runtime: 'edge',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 构建请求参数
    const searchParams = new URLSearchParams({
      text: body.text || '',
      voice: body.voice || 'zh-CN-XiaoxiaoNeural',
      rate: body.rate?.toString() || '0',
      volume: body.volume?.toString() || '100',
      pitch: body.pitch?.toString() || '0',
    });

    // 创建请求到实际的 TTS 服务
    const response = await fetch(`${TTS_API_URL}/api/tts?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TTS API responded with status: ${response.status}`);
    }

    // 获取音频数据
    const audioData = await response.arrayBuffer();
    
    // 返回音频流
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process TTS request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求以处理 CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
  });
}
```

### 2.2 Whisper API 代理

创建 `api/whisper-edge.ts` 文件：

```typescript
// Vercel Edge Function for Whisper API proxy
import { NextRequest, NextResponse } from 'next/server';

const WHISPER_API_URL = process.env.WHISPER_API_URL || 'https://whisper.2068.online';

export const config = {
  runtime: 'edge',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 创建新的 FormData 发送到实际的 Whisper 服务
    const newFormData = new FormData();
    
    // 转发文件和其他参数
    for (const [key, value] of formData.entries()) {
      if (key === 'audio' && value instanceof File) {
        // 创建新的 File 对象
        const arrayBuffer = await value.arrayBuffer();
        const newFile = new File([arrayBuffer], value.name, {
          type: value.type,
          lastModified: value.lastModified,
        });
        newFormData.append(key, newFile);
      } else {
        newFormData.append(key, value);
      }
    }

    // 发送请求到实际的 Whisper 服务
    const response = await fetch(`${WHISPER_API_URL}/api/transcribe`, {
      method: 'POST',
      body: newFormData,
    });

    if (!response.ok) {
      throw new Error(`Whisper API responded with status: ${response.status}`);
    }

    // 获取响应数据
    const responseData = await response.json();
    
    // 返回转录结果
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Whisper API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Whisper request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求以处理 CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
  });
}
```

## 3. 环境变量配置

在 Vercel 控制台中设置以下环境变量：

- `TTS_API_URL`: `https://tts.2068.online`
- `WHISPER_API_URL`: `https://whisper.2068.online`

或者在项目根目录创建 `.env.local` 文件（本地开发使用）：

```
TTS_API_URL=https://tts.2068.online
WHISPER_API_URL=https://whisper.2068.online
```

## 4. 客户端 API 服务修改

修改 `services/ttsService.ts` 文件：

```typescript
// 修改后的 TTS 服务
export const synthesizeSpeech = async (text: string, options: TTSOptions = {}) => {
  try {
    const response = await fetch('/api/tts-edge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: options.voice || 'zh-CN-XiaoxiaoNeural',
        rate: options.rate || 0,
        volume: options.volume || 100,
        pitch: options.pitch || 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
};
```

修改 `services/whisperService.ts` 文件：

```typescript
// 修改后的 Whisper 服务
export const transcribeAudio = async (audioFile: File): Promise<TranscriptionResult> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await fetch('/api/whisper-edge', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};
```

## 5. 部署步骤

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel --prod
```

或者通过 Vercel 网站连接 GitHub 仓库进行自动部署。

## 6. 注意事项

1. **Edge Functions 优势**：
   - 更快的冷启动时间
   - 更低的延迟
   - 更好的全球分布
   - 没有标准的 10 秒超时限制

2. **CORS 配置**：
   - 已在 vercel.json 中配置了 CORS 头
   - 每个 API 函数都包含 OPTIONS 处理

3. **错误处理**：
   - 所有 API 函数都包含完整的错误处理
   - 错误信息会记录在 Vercel 函数日志中

4. **性能优化**：
   - 使用流式响应处理音频数据
   - 设置适当的缓存头

5. **成本考虑**：
   - Vercel Edge Functions 按使用量计费
   - 免费套餐包含一定额度

## 7. 故障排除

### 常见问题

1. **API 请求超时**：
   - 检查原始 API 服务是否正常运行
   - 确认 Edge Function 日志中的错误信息

2. **CORS 错误**：
   - 确认 vercel.json 中的头配置
   - 检查浏览器控制台的预检请求

3. **音频无法播放**：
   - 检查返回的 Content-Type 是否正确
   - 确认音频数据完整性

### 监控与日志

- Vercel 控制台提供函数执行日志
- 可以查看请求/响应详情
- 监控函数执行时间和错误率

## 8. 高级配置

### 自定义域名

1. 在 Vercel 控制台中添加自定义域名
2. 配置 DNS 记录
3. 设置 SSL 证书（自动处理）

### 性能监控

```typescript
// 在 API 函数中添加性能监控
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ... 函数逻辑 ...
    
    const duration = Date.now() - startTime;
    console.log(`Function execution time: ${duration}ms`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Function failed after ${duration}ms:`, error);
    
    return errorResponse;
  }
}
```

## 9. 备用方案

如果 Edge Functions 不满足需求，可以考虑：

1. **Vercel 常规函数**：
   - 更长的执行时间（但仍有超时限制）
   - 更大的内存限制

2. **混合部署**：
   - 前端部署到 Vercel
   - API 服务部署到其他平台

3. **使用 Cloudflare Workers**：
   - 类似的边缘计算平台
   - 不同的定价模型

---

本配置提供了完整的 Vercel 部署方案，通过 Edge Functions 作为 API 代理，解决了 CORS 问题，并提供了更好的性能和可靠性。

## 10. LLM API 集成与安全配置

### 10.1 安全问题与立即修复

**重要安全警告**：如果项目中包含 `.env.local` 文件并且已经提交到 Git，请立即执行以下步骤修复：

1. 从 Git 历史中完全删除敏感信息：
```bash
# 立即执行以下命令，删除历史中的敏感信息
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
```

2. 更新 `.gitignore` 文件，确保 `.env.local` 永远不会被提交：
```gitignore
# 环境变量文件
.env.local
.env.*.local
```

3. 强制推送到远程仓库：
```bash
git push origin --force --all
git push origin --force --tags
```

### 10.2 LLM API 代理实现

创建 `api/llm-edge.ts` 文件，作为安全的 LLM API 代理：

```typescript
// Vercel Edge Function for LLM API proxy
import { NextRequest, NextResponse } from 'next/server';

// 获取环境变量中的 API 密钥
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// 请求限制配置
const RATE_LIMIT_REQUESTS = 20; // 每分钟最大请求数
const MAX_TOKENS_PER_REQUEST = 2000; // 单次请求最大令牌数
const MAX_CONTENT_LENGTH = 10000; // 最大内容长度

// 简单的内存存储用于速率限制（生产环境应使用 Redis 或其他持久化存储）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 清理过期的速率限制记录
function cleanExpiredEntries() {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

// 检查速率限制
function checkRateLimit(ip: string): boolean {
  cleanExpiredEntries();
  const now = Date.now();
  const windowStart = now - 60000; // 1分钟窗口
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: windowStart + 60000 });
    return true;
  }
  
  const data = requestCounts.get(ip)!;
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + 60000;
    return true;
  }
  
  if (data.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  data.count++;
  return true;
}

// 获取客户端 IP
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// 验证请求内容
function validateRequest(body: any): { isValid: boolean; error?: string } {
  if (!body.messages || !Array.isArray(body.messages)) {
    return { isValid: false, error: 'Invalid messages format' };
  }
  
  if (body.messages.length === 0) {
    return { isValid: false, error: 'Messages array cannot be empty' };
  }
  
  if (body.messages.length > 10) {
    return { isValid: false, error: 'Too many messages in request' };
  }
  
  // 检查每个消息的内容
  for (const message of body.messages) {
    if (!message.role || !message.content) {
      return { isValid: false, error: 'Each message must have role and content' };
    }
    
    if (!['system', 'user', 'assistant'].includes(message.role)) {
      return { isValid: false, error: 'Invalid message role' };
    }
    
    if (typeof message.content !== 'string' || message.content.length > MAX_CONTENT_LENGTH) {
      return { isValid: false, error: `Message content too long (max ${MAX_CONTENT_LENGTH} characters)` };
    }
  }
  
  // 检查令牌限制
  if (body.max_tokens && (typeof body.max_tokens !== 'number' || body.max_tokens > MAX_TOKENS_PER_REQUEST)) {
    return { isValid: false, error: `Invalid max_tokens (max ${MAX_TOKENS_PER_REQUEST})` };
  }
  
  return { isValid: true };
}

export const config = {
  runtime: 'edge',
};

export async function POST(request: NextRequest) {
  // 获取客户端 IP 进行速率限制
  const clientIP = getClientIP(request);
  
  // 检查速率限制
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求内容
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // 确定 API 提供商
    const provider = body.provider || 'openai';
    
    let apiUrl: string;
    let apiKey: string;
    let requestBody: any;
    
    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
      
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = OPENAI_API_KEY;
      
      // 构建 OpenAI 请求体
      requestBody = {
        model: body.model || 'gpt-3.5-turbo',
        messages: body.messages,
        max_tokens: body.max_tokens || 500,
        temperature: body.temperature || 0.7,
        stream: false, // 暂不支持流式响应
      };
    } else if (provider === 'anthropic') {
      if (!ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Anthropic API key not configured' },
          { status: 500 }
        );
      }
      
      apiUrl = 'https://api.anthropic.com/v1/messages';
      apiKey = ANTHROPIC_API_KEY;
      
      // 构建 Anthropic 请求体
      requestBody = {
        model: body.model || 'claude-3-haiku-20240307',
        max_tokens: body.max_tokens || 500,
        messages: body.messages,
        temperature: body.temperature || 0.7,
      };
    } else {
      return NextResponse.json(
        { error: 'Unsupported provider' },
        { status: 400 }
      );
    }
    
    // 发送请求到 LLM API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Anthropic 需要特殊的 API 版本头
        ...(provider === 'anthropic' && { 'anthropic-version': '2023-06-01' }),
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'LLM API request failed',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      );
    }
    
    // 获取响应数据
    const responseData = await response.json();
    
    // 记录使用情况（可选）
    console.log(`LLM API used: provider=${provider}, tokens=${responseData.usage?.total_tokens || 'unknown'}`);
    
    // 返回响应
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('LLM API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process LLM request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求以处理 CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
  });
}
```

### 10.3 前端 LLM 服务实现

创建 `services/llmService.ts` 文件：

```typescript
// LLM 服务接口定义
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  provider?: 'openai' | 'anthropic';
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LLMMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// LLM API 调用函数
export const callLLM = async (
  messages: LLMMessage[], 
  options: LLMOptions = {}
): Promise<LLMResponse> => {
  try {
    const response = await fetch('/api/llm-edge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        provider: options.provider || 'openai',
        model: options.model,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
};

// 预设的常用系统消息
export const SYSTEM_PROMPTS = {
  TRANSLATOR: '你是一个专业的翻译助手，请将用户提供的内容准确翻译成指定语言。',
  SUMMARIZER: '你是一个专业的内容总结助手，请简洁准确地总结用户提供的内容。',
  EXPLAINER: '你是一个知识丰富的解释助手，请用简单易懂的语言解释用户的问题。',
  CREATOR: '你是一个创意写作助手，请根据用户的提示创作有趣的内容。',
};

// 便捷的翻译函数
export const translateText = async (
  text: string, 
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<string> => {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPTS.TRANSLATOR} 请将${sourceLanguage === 'auto' ? '自动检测语言' : sourceLanguage}翻译成${targetLanguage}，只返回翻译结果，不需要解释。`,
    },
    {
      role: 'user',
      content: text,
    },
  ];

  const response = await callLLM(messages, {
    maxTokens: 1000,
    temperature: 0.3, // 较低温度以获得更准确的翻译
  });

  return response.choices[0]?.message?.content || '翻译失败';
};

// 便捷的总结函数
export const summarizeText = async (text: string): Promise<string> => {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPTS.SUMMARIZER,
    },
    {
      role: 'user',
      content: `请总结以下内容：\n\n${text}`,
    },
  ];

  const response = await callLLM(messages, {
    maxTokens: 500,
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content || '总结失败';
};
```

### 10.4 环境变量与 API 密钥管理

在 Vercel 控制台中安全地设置以下环境变量：

```bash
# OpenAI API 密钥
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic (Claude) API 密钥
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

**重要安全提示**：
1. 绝不在代码中硬编码 API 密钥
2. 绝不将 `.env.local` 文件提交到版本控制系统
3. 使用 Vercel 的加密环境变量功能存储敏感信息
4. 定期轮换 API 密钥

### 10.5 更新 vercel.json 配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "TTS_API_URL": "https://tts.2068.online",
    "WHISPER_API_URL": "https://whisper.2068.online"
  },
  "functions": {
    "api/llm-edge.ts": {
      "maxDuration": 30
    }
  }
}
```

### 10.6 LLM API 使用示例

创建 `components/LLMExample.tsx` 组件：

```typescript
import React, { useState } from 'react';
import { callLLM, translateText, summarizeText, LLMMessage } from '../services/llmService';

const LLMExample: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'translate' | 'summarize'>('chat');
  const [targetLanguage, setTargetLanguage] = useState('英语');

  const handleChat = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是一个有帮助的助手，请简洁准确地回答用户的问题。',
        },
        {
          role: 'user',
          content: inputText,
        },
      ];
      
      const response = await callLLM(messages);
      setOutputText(response.choices[0]?.message?.content || '无法获取回复');
    } catch (error) {
      setOutputText(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const translation = await translateText(inputText, targetLanguage);
      setOutputText(translation);
    } catch (error) {
      setOutputText(`翻译错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const summary = await summarizeText(inputText);
      setOutputText(summary);
    } catch (error) {
      setOutputText(`总结错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    switch (mode) {
      case 'chat':
        handleChat();
        break;
      case 'translate':
        handleTranslate();
        break;
      case 'summarize':
        handleSummarize();
        break;
    }
  };

  return (
    <div className="llm-example">
      <h2>LLM 功能示例</h2>
      
      <div className="mode-selector">
        <button 
          className={mode === 'chat' ? 'active' : ''} 
          onClick={() => setMode('chat')}
        >
          对话
        </button>
        <button 
          className={mode === 'translate' ? 'active' : ''} 
          onClick={() => setMode('translate')}
        >
          翻译
        </button>
        <button 
          className={mode === 'summarize' ? 'active' : ''} 
          onClick={() => setMode('summarize')}
        >
          总结
        </button>
      </div>
      
      {mode === 'translate' && (
        <div className="translation-options">
          <label>
            目标语言:
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="英语">英语</option>
              <option value="日语">日语</option>
              <option value="韩语">韩语</option>
              <option value="法语">法语</option>
              <option value="德语">德语</option>
              <option value="西班牙语">西班牙语</option>
            </select>
          </label>
        </div>
      )}
      
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={mode === 'chat' ? '输入你的问题...' : 
                   mode === 'translate' ? '输入要翻译的文本...' : 
                   '输入要总结的文本...'}
          rows={5}
        />
        <button 
          onClick={handleSubmit} 
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? '处理中...' : '提交'}
        </button>
      </div>
      
      {outputText && (
        <div className="output-section">
          <h3>结果:</h3>
          <p>{outputText}</p>
        </div>
      )}
      
      <div className="usage-info">
        <p>
          <strong>注意:</strong> LLM API 使用有配额限制，请合理使用。 
          每次请求都会消耗一定数量的令牌，具体取决于输入和输出的长度。
        </p>
      </div>
    </div>
  );
};

export default LLMExample;
```

### 10.7 API 密钥轮换策略

实现安全的 API 密钥轮换机制：

1. **定期轮换**：
   - 设置每月或每季度的 API 密钥轮换提醒
   - 使用自动化脚本批量更新环境变量

2. **版本控制**：
   - 在环境变量名称中包含版本号
   - 示例：`OPENAI_API_KEY_V2`

3. **回退机制**：
   - 保留旧密钥一段时间作为回退
   - 逐步迁移流量到新密钥

```typescript
// 在 api/llm-edge.ts 中添加密钥轮换逻辑
const getApiKey = (provider: string): string => {
  if (provider === 'openai') {
    // 尝试新密钥，如果无效则使用旧密钥
    return process.env.OPENAI_API_KEY_V2 || process.env.OPENAI_API_KEY || '';
  } else if (provider === 'anthropic') {
    return process.env.ANTHROPIC_API_KEY_V2 || process.env.ANTHROPIC_API_KEY || '';
  }
  return '';
};
```

### 10.8 使用监控与成本控制

实现使用监控和成本控制机制：

1. **使用量监控**：
   ```typescript
   // 在 api/llm-edge.ts 中添加使用量记录
   interface UsageRecord {
     timestamp: number;
     provider: string;
     model: string;
     tokens: number;
     cost: number;
   }
   
   // 简单的内存存储（生产环境应使用数据库）
   const usageRecords: UsageRecord[] = [];
   
   // 记录使用情况
   function recordUsage(
     provider: string, 
     model: string, 
     tokens: number
   ) {
     const cost = calculateCost(provider, model, tokens);
     usageRecords.push({
       timestamp: Date.now(),
       provider,
       model,
       tokens,
       cost
     });
   }
   
   // 计算费用（简化示例）
   function calculateCost(provider: string, model: string, tokens: number): number {
     const pricing: Record<string, number> = {
       'openai-gpt-3.5-turbo': 0.002 / 1000, // 每 1000 令牌 $0.002
       'openai-gpt-4': 0.03 / 1000,        // 每 1000 令牌 $0.03
       'anthropic-claude-3-haiku': 0.00025 / 1000, // 每 1000 令牌 $0.00025
     };
     
     const key = `${provider}-${model}`;
     return (pricing[key] || 0) * tokens;
   }
   ```

2. **成本控制**：
   ```typescript
   // 在 api/llm-edge.ts 中添加成本控制
   const MONTHLY_COST_LIMIT = 50; // 每月 $50 限制
   
   function checkMonthlyLimit(): boolean {
     const now = Date.now();
     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
     
     // 计算本月使用量
     const monthlyUsage = usageRecords
       .filter(record => record.timestamp >= monthStart)
       .reduce((total, record) => total + record.cost, 0);
     
     return monthlyUsage < MONTHLY_COST_LIMIT;
   }
   ```

3. **管理面板**：
   创建一个简单的使用情况监控面板：
   ```typescript
   // components/UsageMonitor.tsx
   import React, { useState, useEffect } from 'react';
   
   interface UsageData {
     dailyUsage: number;
     monthlyUsage: number;
     costLimit: number;
     remainingBudget: number;
   }
   
   const UsageMonitor: React.FC = () => {
     const [usageData, setUsageData] = useState<UsageData | null>(null);
     const [isLoading, setIsLoading] = useState(true);
   
     useEffect(() => {
       // 获取使用情况数据
       const fetchUsageData = async () => {
         try {
           // 在实际应用中，这里应该调用专门的 API 端点
           const response = await fetch('/api/usage-stats');
           const data = await response.json();
           setUsageData(data);
         } catch (error) {
           console.error('获取使用情况失败:', error);
         } finally {
           setIsLoading(false);
         }
       };
   
       fetchUsageData();
     }, []);
   
     if (isLoading) {
       return <div>加载使用情况中...</div>;
     }
   
     if (!usageData) {
       return <div>无法获取使用情况</div>;
     }
   
     const usagePercentage = (usageData.monthlyUsage / usageData.costLimit) * 100;
   
     return (
       <div className="usage-monitor">
         <h3>API 使用情况</h3>
         
         <div className="usage-stats">
           <div className="stat-item">
             <span className="label">今日使用:</span>
             <span className="value">{usageData.dailyUsage.toFixed(4)} 美元</span>
           </div>
           
           <div className="stat-item">
             <span className="label">本月使用:</span>
             <span className="value">{usageData.monthlyUsage.toFixed(2)} 美元</span>
           </div>
           
           <div className="stat-item">
             <span className="label">预算限制:</span>
             <span className="value">{usageData.costLimit.toFixed(2)} 美元</span>
           </div>
           
           <div className="stat-item">
             <span className="label">剩余预算:</span>
             <span className="value">{usageData.remainingBudget.toFixed(2)} 美元</span>
           </div>
         </div>
         
         <div className="usage-bar">
           <div 
             className="usage-fill" 
             style={{ width: `${Math.min(usagePercentage, 100)}%` }}
           ></div>
         </div>
         
         <div className="usage-percentage">
           {usagePercentage.toFixed(1)}% 已使用
         </div>
         
         {usagePercentage > 80 && (
           <div className="usage-warning">
             ⚠️ 接近预算限制，请注意控制使用
           </div>
         )}
       </div>
     );
   };
   
   export default UsageMonitor;
   ```

### 10.9 测试与部署

1. **本地测试**：
   ```bash
   # 设置本地环境变量
   echo "OPENAI_API_KEY=your-test-key-here" > .env.local
   echo "ANTHROPIC_API_KEY=your-test-key-here" >> .env.local
   
   # 确保安装了必要的依赖
   npm install
   
   # 启动开发服务器
   npm run dev
   ```

2. **部署到 Vercel**：
   ```bash
   # 部署到 Vercel
   vercel --prod
   
   # 在 Vercel 控制台设置环境变量
   # OPENAI_API_KEY
   # ANTHROPIC_API_KEY
   ```

3. **测试 API 端点**：
   ```bash
   # 测试 LLM API 端点
   curl -X POST https://your-app.vercel.app/api/llm-edge \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [
         {"role": "user", "content": "Hello, how are you?"}
       ],
       "provider": "openai"
     }'
   ```

### 10.10 故障排除与最佳实践

1. **常见问题**：
   - **速率限制错误**：增加请求之间的延迟或实施指数退避
   - **令牌限制**：减小 `max_tokens` 参数或分割长文本
   - **模型不可用**：检查模型名称是否正确，或尝试回退到其他模型

2. **性能优化**：
   - 实现请求缓存机制
   - 使用流式响应处理长文本
   - 优化提示词以减少令牌使用

3. **安全最佳实践**：
   - 定期轮换 API 密钥
   - 监控异常使用模式
   - 实施最小权限原则
   - 记录所有 API 调用以进行审计

通过以上配置，您的 Edge-TTS Web 应用现在可以安全地集成 LLM 功能，同时保护 API 密钥不被泄露，并提供了全面的使用监控和成本控制机制。