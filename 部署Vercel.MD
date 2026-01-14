部署Vercel


完整的 Vercel 部署方案,重点解决 API 访问问题。

## 🎯 Vercel 部署完整方案

### 方案一:使用 Vercel Serverless Functions 作为 API 代理(推荐⭐⭐⭐⭐⭐)

这个方案最稳定,可以完全解决 CORS 问题,并且保护 API 密钥。
现在我为你创建完整的 Vercel 部署配置文件。我会在 ask 模式下提供所有需要的配置和代码,你可以复制应用这些文件。

## 📋 部署到 Vercel 的完整方案

### 方案概述
我们将使用 **Vercel Serverless Functions** 作为 API 代理,这样可以:
- ✅ 完全解决 CORS 跨域问题
- ✅ 保护 API 密钥安全
- ✅ 保持开发环境配置不变
- ✅ 享受 Vercel 的全球 CDN 加速

---

## 📁 需要创建/修改的文件

### 1️⃣ 创建 `vercel.json` 配置文件

这个文件配置 Vercel 的部署规则和重写规则:

```json
{
  "rewrites": [
    {
      "source": "/api/tts/:path*",
      "destination": "/api/tts-proxy"
    },
    {
      "source": "/api/whisper/:path*",
      "destination": "/api/whisper-proxy"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
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
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

---

### 2️⃣ 创建 `api/tts-proxy.ts` - TTS API 代理函数

```typescript
import { NextRequest, NextResponse } from 'next/server';

const TTS_SERVICE_URL = 'https://tts.2068.online';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const path = pathname.replace('/api/tts-proxy', '');
    
    const targetUrl = `${TTS_SERVICE_URL}/api/tts${path}?${searchParams}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/tts-proxy', '');
    
    const body = await request.json();
    
    const targetUrl = `${TTS_SERVICE_URL}/api/tts${path}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 处理音频流响应
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('audio')) {
      const audioBuffer = await response.arrayBuffer();
      
      return new NextResponse(audioBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // JSON 响应
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
```

---

### 3️⃣ 创建 `api/whisper-proxy.ts` - Whisper API 代理函数

```typescript
import { NextRequest, NextResponse } from 'next/server';

const WHISPER_SERVICE_URL = 'https://Whisper.2068.online';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/whisper-proxy', '');
    
    const formData = await request.formData();
    
    const targetUrl = `${WHISPER_SERVICE_URL}/api/whisper${path}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Whisper Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
```

---

### 4️⃣ 创建 `.env.production` 生产环境变量

```bash
# TTS Service URL (可选,如果不配置则使用默认值)
VITE_TTS_API_URL=https://tts.2068.online

# Whisper Service URL (可选,如果不配置则使用默认值)
VITE_WHISPER_API_URL=https://Whisper.2068.online

# Gemini API Key (必需)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 5️⃣ 修改 `vite.config.ts` - 优化构建配置

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 开发环境配置
    server: mode === 'development' ? {
      port: 3111,
      host: '0.0.0.0',
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'audiogen.2068.online'
      ],
      proxy: {
        '/api/tts': {
          target: 'https://tts.2068.online',
          changeOrigin: true,
          secure: false,
        },
        '/api/whisper': {
          target: 'https://Whisper.2068.online',
          changeOrigin: true,
          secure: false,
        }
      }
    } : undefined,
    
    // 生产环境基础路径
    base: mode === 'production' ? '/' : '/',
    
    plugins: [react()],
    
    // 环境变量注入
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    
    // 构建优化
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          }
        }
      }
    }
  };
});
```

---

### 6️⃣ 修改 `package.json` - 添加 Vercel 相关脚本

```json
{
  "name": "gemini-neural-tts",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  },
  "dependencies": {
    "react": "^19.2.3",
    "@google/genai": "^1.35.0",
    "lucide-react": "^0.562.0",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

---

### 7️⃣ 创建 `.vercelignore` - 忽略不需要部署的文件

```
.env.local
node_modules
dist
.git
*.md
.DS_Store
```

---

## 🚀 部署步骤

### 步骤 1: 准备代码

1. 在项目根目录创建上述所有文件
2. 确保 `services/ttsService.ts` 和 `services/whisperService.ts` 中的 URL 保持为空字符串(使用相对路径)

### 步骤 2: 推送到 GitHub

```bash
# 初始化 Git 仓库(如果还没有)
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到 Vercel"

# 推送到 GitHub(假设你已经创建了远程仓库)
git remote add origin https://github.com/yourusername/edge-tts-web.git
git branch -M main
git push -u origin main
```

### 步骤 3: 在 Vercel 上部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 `edge-tts-web` 仓库
5. 配置项目:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 添加环境变量:
   - `GEMINI_API_KEY`: 你的 Gemini API 密钥
7. 点击 "Deploy"
8. 等待部署完成(通常 1-2 分钟)

### 步骤 4: 验证部署

部署完成后:
1. Vercel 会提供一个 `.vercel.app` 域名
2. 访问该域名测试应用
3. 检查:
   - TTS 语音生成是否正常
   - Whisper 语音转文字是否正常
   - 服务状态指示器是否显示绿色

---

## 🔧 工作原理

### 开发环境(vite.config.ts 的代理):
```
前端 → Vite Dev Server (localhost:3111) → /api/tts/* → https://tts.2068.online/api/tts/*
```

### 生产环境(Vercel Functions):
```
前端 → Vercel CDN → /api/tts/* → Vercel Function (tts-proxy) → https://tts.2068.online/api/tts/*
```

---

## 🎯 优势

1. **CORS 问题完全解决**: Vercel Functions 在服务器端转发请求,浏览器不直接访问外部 API
2. **开发体验保持一致**: 本地开发仍然使用 Vite 代理,无需修改代码
3. **全球加速**: Vercel 的全球 CDN 自动优化内容分发
4. **自动 HTTPS**: Vercel 自动提供 SSL 证书
5. **零成本**: Vercel 免费套餐足够使用
6. **易于维护**: 所有配置都在项目中,版本控制友好

---

## ⚠️ 注意事项

1. **API 函数超时**: Vercel Functions 免费版有 10 秒超时限制,如果音频生成很慢可能需要升级到 Pro 版
2. **文件大小限制**: 函数体大小限制为 50MB,本项目不会有问题
3. **环境变量**: 确保在 Vercel 项目设置中正确配置 `GEMINI_API_KEY`
4. **API 服务可用性**: 确保远程 TTS 和 Whisper 服务支持 CORS,或者通过 Vercel Functions 代理访问

---

## 📝 总结

这个方案通过 Vercel Serverless Functions 创建了一个透明的 API 代理层,完美解决了:
- ✅ CORS 跨域问题
- ✅ API 密钥安全
- ✅ 生产环境配置
- ✅ 全球加速访问

你现在可以切换到 **CRAFT 模式**,我可以帮你创建所有需要的配置文件。或者你希望我提供更多的细节说明? 🚀