<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e4vzGFAXqK9zfe0kBXvfO92OfjRlFqyX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 技术架构实现

### 系统概述

本项目是一个基于Web的文本转语音（TTS）应用，使用React + TypeScript构建前端界面，通过Edge TTS服务实现高质量语音合成。项目采用微服务架构，前端与后端TTS服务分离，通过API进行通信。

### TTS接入架构

#### 服务架构
- **前端**: React + TypeScript + Vite，运行在 `http://localhost:3111`
- **远程TTS服务**: 运行在 `https://tts.2068.online`
- **远程Whisper服务**: 运行在 `https://Whisper.2068.online`
- **代理配置**: Vite开发服务器代理请求，解决跨域问题

#### TTS服务实现
- **核心引擎**: 使用Edge TTS命令行工具通过子进程调用
- **接口设计**: RESTful API，提供以下端点:
  - `GET /api/tts/voices`: 获取可用声音列表
  - `POST /api/tts/speak`: 文本转语音接口
  - `GET /api/tts/health`: 健康检查
- **音频格式**: MP3格式，24kHz采样率，单声道

#### 前端TTS集成
```typescript
// 语音合成核心流程
const generateSpeech = async (
  text: string,
  voice: VoiceOption,
  language: Language
): Promise<Blob> => {
  const response = await fetch('/api/tts/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      voiceId: voice.id,
      output_format: 'mp3'
    })
  });
  
  if (!response.ok) {
    throw new Error(`TTS generation failed: ${response.status}`);
  }
  
  return await response.blob();
};
```

### Whisper集成

#### 当前状态
项目已集成Whisper语音识别功能，支持将用户语音输入转换为文本。

#### Whisper服务架构
- **语音转文本流程**: 
  1. 使用Web Audio API捕获用户语音输入
  2. 将音频数据发送到远程Whisper服务 (`https://Whisper.2068.online`)
  3. 接收转录文本并填充到输入框
  4. 可直接将转录文本进行TTS转换

#### 实现细节
```typescript
// 语音转录接口实现
const transcribeAudio = async (
  audioBlob: Blob, 
  language?: Language
): Promise<string> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  
  // 如果指定了语言，添加到表单中
  if (language) {
    const langCode = language === Language.Chinese ? 'zh' : 'en';
    formData.append('language', langCode);
  }

  const response = await fetch('/api/whisper/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.text || '';
};
```

### LLM集成架构

#### Gemini API集成
项目集成了Google的Gemini AI模型，用于增强文本处理能力：

1. **环境配置**:
   - 使用`@google/genai`库进行API调用
   - API密钥通过`.env.local`文件管理
   - Vite配置中将环境变量注入到前端

2. **应用场景**:
   - 文本优化和预处理
   - 智能分段和格式化
   - 语音参数建议（语速、语调等）
   - 多语言翻译支持

3. **API集成方式**:
```typescript
// LLM服务调用示例
import { GoogleGenerativeAI } from "@google/genai";

const enhanceText = async (text: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `请优化以下文本，使其更适合语音朗读: ${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
```

### 组件架构

#### 核心组件
1. **App.tsx**: 主应用组件，管理全局状态和服务状态检查
2. **VoiceSelector**: 声音选择组件，支持按性别和语言筛选
3. **TextInput**: 文本输入组件，支持多语言输入
4. **VoiceInput**: 语音输入组件，支持语音转文本功能
5. **AudioPlayer**: 音频播放组件，控制语音播放和播放速度
6. **PlaybackSpeed**: 播放速度控制组件，提供0.5x到2x的速度调节

#### 状态管理
- 使用React Hooks进行本地状态管理
- 支持语言切换（英文/中文）
- 声音参数持久化
- 服务状态实时监控
- 播放速度控制

#### 类型系统
```typescript
// 核心类型定义
export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum Language {
  English = 'English',
  Chinese = 'Chinese'
}

export interface VoiceOption {
  id: string; // 声音ID，如 'en-US-JennyNeural'
  name: string; // 显示名称
  gender: Gender;
  style: string; // 风格描述
}

export interface AudioState {
  isGenerating: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  duration: number;
  currentTime: number;
  error: string | null;
}
```

### 服务器部署

#### 反向代理配置
项目支持通过Nginx反向代理部署到生产环境：

```nginx
# TTS API代理配置
location /api/tts/ {
  proxy_pass https://tts.2068.online;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  proxy_read_timeout 86400;
}

# Whisper API代理配置
location /api/whisper/ {
  proxy_pass https://Whisper.2068.online;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  proxy_read_timeout 86400;
}
```

#### SSL配置
- 支持Let's Encrypt自动证书申请
- HTTP到HTTPS重定向
- HSTS安全策略

### 音频处理

#### 音频工具函数
```typescript
// WAV头部添加（用于原始PCM数据）
export function addWavHeader(
  samples: Uint8Array, 
  sampleRate: number = 24000, 
  numChannels: number = 1
): ArrayBuffer

// Base64解码
export function base64ToUint8Array(base64: string): Uint8Array

// Blob下载
export function downloadBlob(blob: Blob, filename: string)
```

#### 音频缓存策略
- 服务端：生成音频后立即返回，不保留缓存
- 客户端：通过Cache-Control头建议浏览器缓存24小时

### 新增功能

#### 服务状态监控
- 实时检查TTS服务健康状态
- UI中显示服务可用性指示器（绿点表示可用，红点表示不可用）
- 每30秒自动更新服务状态
- 初始加载时显示灰色闪烁点表示检查中

#### 播放速度控制
- 支持0.5x、0.75x、1x、1.25x、1.5x、2.0x六种播放速度
- 直观的速率选择器，显示当前播放速度
- 速度调节即时生效，无需重新生成音频
- 使用HTML5原生playbackRate API实现

### 错误处理与监控

#### 错误处理机制
- API请求错误捕获和用户友好的错误提示
- TTS服务异常处理
- 音频播放错误处理

#### 监控与日志
- 请求日志记录
- 错误详情收集
- 性能指标监控

### 安全考虑

#### API安全
- 输入验证和净化
- 文本长度限制
- 防止注入攻击

#### 跨域处理
- CORS配置
- 代理设置

### 扩展性设计

#### 插件化架构
- 支持多种TTS引擎
- 可插拔的LLM服务
- 模块化组件设计

#### 多语言支持
- 国际化框架准备
- 多语言声音支持
- 本地化UI
