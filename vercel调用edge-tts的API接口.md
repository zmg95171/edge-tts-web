# Vercel 调用 Edge-TTS 的 API 接口技术文档

## 概述

本文档详细说明了在 Vercel 环境中调用 Edge-TTS 的技术实现要点,包括 API 接口、请求参数、错误处理和最佳实践。

---

## 1. TTS 服务架构

### 1.1 双服务备份机制

本项目采用双服务备份策略,确保高可用性:

```
主服务: Google Translate TTS API
    ↓ (失败)
备用服务: Yandex TTS API
    ↓ (失败)
错误提示: 所有服务不可用
```

### 1.2 服务选择逻辑

```typescript
// 优先使用 Google Translate TTS
try {
  response = await googleTtsApi(text, voice);
} catch (error) {
  // 失败后自动切换到 Yandex TTS
  response = await yandexTtsApi(text, voice);
}
```

---

## 2. API 接口详情

### 2.1 Google Translate TTS API (主服务)

**端点:** `https://translate.google.com/translate_tts`

**请求方法:** GET

**请求参数:**

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `ie` | string | 是 | 编码格式,固定为UTF-8 | `UTF-8` |
| `q` | string | 是 | 要转换的文本,需要URL编码 | `Hello%20World` |
| `tl` | string | 是 | 目标语言代码 | `en`, `zh-CN` |
| `client` | string | 是 | 客户端标识,固定为tw-ob | `tw-ob` |

**请求示例:**

```typescript
const langCode = voice.id.split('-')[0]; // 从语音ID中提取语言代码
const encodedText = encodeURIComponent(text);
const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
```

**请求头:**

```typescript
headers: {
  'Referer': 'https://translate.google.com/',
}
```

**响应格式:**
- Content-Type: `audio/mpeg` 或 `audio/mp3`
- 返回音频数据的 Blob 对象

**特点:**
- ✅ 无需API密钥
- ✅ 公开免费API
- ⚠️ 可能有请求频率限制
- ⚠️ 需要设置Referer头以避免CORS问题

### 2.2 Yandex TTS API (备用服务)

**端点:** `https://tts.voicetech.yandex.net/tts`

**请求方法:** GET

**请求参数:**

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `speaker` | string | 是 | 说话人ID | `oksana` |
| `format` | string | 是 | 音频格式 | `mp3` |
| `quality` | string | 是 | 音频质量 | `hi` |
| `lang` | string | 是 | 语言代码 | `en`, `zh-CN` |
| `text` | string | 是 | 要转换的文本,需要URL编码 | `Hello%20World` |

**请求示例:**

```typescript
const langCode = voice.id.split('-')[0];
const encodedText = encodeURIComponent(text);
const altTtsUrl = `https://tts.voicetech.yandex.net/tts?speaker=oksana&format=mp3&quality=hi&lang=${langCode}&text=${encodedText}`;
```

**响应格式:**
- Content-Type: `audio/mpeg` 或 `audio/mp3`
- 返回音频数据的 Blob 对象

**特点:**
- ✅ 无需API密钥
- ✅ 支持多种语言
- ⚠️ 语音选项有限
- ⚠️ 可能不如Google TTS自然

---

## 3. 语音ID和语言识别

### 3.1 语音ID格式

语音ID遵循 Microsoft Edge TTS 的命名规范:

```
格式: [语言代码]-[地区代码]-[名称][类型]
示例: en-US-JennyNeural
       zh-CN-XiaoxiaoNeural
```

### 3.2 语言代码提取

```typescript
// 从语音ID中提取语言代码
const voiceId = 'zh-CN-XiaoxiaoNeural';
const langCode = voiceId.split('-')[0]; // 'zh'
```

**常见语言代码映射:**

| 语言代码 | 语言 | 示例语音ID |
|----------|------|-----------|
| `en` | 英语 | `en-US-JennyNeural` |
| `zh` | 中文 | `zh-CN-XiaoxiaoNeural` |
| `ja` | 日语 | `ja-JP-NanamiNeural` |
| `ko` | 韩语 | `ko-KR-SunHiNeural` |
| `es` | 西班牙语 | `es-ES-ElviraNeural` |
| `fr` | 法语 | `fr-FR-DeniseNeural` |

---

## 4. 核心函数实现

### 4.1 generateSpeech - 生成语音

**函数签名:**

```typescript
export const generateSpeech = async (
  text: string,
  voice: VoiceOption | null,
  language: Language
): Promise<Blob>
```

**参数说明:**

- `text`: 要转换为语音的文本内容
- `voice`: 语音选项对象,包含语音ID等信息
- `language`: 目标语言枚举值

**返回值:**
- `Promise<Blob>`: 音频数据的Blob对象

**实现流程:**

```
1. 验证语音选项是否已选择
   ↓
2. 从语音ID中提取语言代码
   ↓
3. 对文本进行URL编码
   ↓
4. 构建Google TTS请求URL
   ↓
5. 发送GET请求
   ↓
6. 检查响应状态
   ├─ 成功 → 返回音频Blob
   └─ 失败 → 步骤7
   ↓
7. 尝试备用服务 (Yandex TTS)
   ↓
8. 检查备用服务响应
   ├─ 成功 → 返回音频Blob
   └─ 失败 → 抛出错误
```

**代码示例:**

```typescript
export const generateSpeech = async (
  text: string,
  voice: VoiceOption | null,
  language: Language
): Promise<Blob> => {
  if (!voice) {
    throw new Error("No voice selected. Please select a voice first.");
  }

  try {
    const langCode = voice.id.split('-')[0];
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
    
    const response = await fetch(googleTtsUrl, {
      method: 'GET',
      headers: {
        'Referer': 'https://translate.google.com/',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS generation failed: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error: any) {
    // 回退到备用服务
    try {
      const altTtsUrl = `https://tts.voicetech.yandex.net/tts?speaker=oksana&format=mp3&quality=hi&lang=${langCode}&text=${encodedText}`;
      const response = await fetch(altTtsUrl);
      return await response.blob();
    } catch (altError: any) {
      throw new Error(`All TTS services failed. Last error: ${altError.message}`);
    }
  }
};
```

### 4.2 fetchAvailableVoices - 获取可用语音

**函数签名:**

```typescript
export const fetchAvailableVoices = async (): Promise<VoiceOption[]>
```

**返回值:**
- `Promise<VoiceOption[]>`: 语音选项对象数组

**实现特点:**
- 支持从API获取实时语音列表
- 如果API失败,返回内置的placeholder语音
- 自动映射API响应数据到应用格式

**VoiceOption类型定义:**

```typescript
interface VoiceOption {
  id: string;        // 语音唯一标识符
  name: string;      // 语音显示名称
  gender: Gender;    // 性别 (Male/Female)
  style: string;     // 语音风格描述
}
```

### 4.3 checkTTSHealth - 健康检查

**函数签名:**

```typescript
export const checkTTSHealth = async (): Promise<boolean>
```

**实现:**

```typescript
export const checkTTSHealth = async (): Promise<boolean> => {
  try {
    const testText = encodeURIComponent("test");
    const response = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${testText}&tl=en&client=tw-ob`);
    return response.ok;
  } catch (error) {
    console.error("TTS health check failed:", error);
    return false;
  }
};
```

---

## 5. 错误处理机制

### 5.1 分层错误处理

```typescript
Level 1: 参数验证
├─ 检查语音是否已选择
└─ 检查文本是否为空

Level 2: 主服务错误
├─ 网络错误 → 记录日志,尝试备用服务
├─ HTTP错误 (4xx, 5xx) → 记录错误详情,尝试备用服务
└─ 超时错误 → 记录超时信息,尝试备用服务

Level 3: 备用服务错误
├─ 网络错误 → 抛出最终错误
├─ HTTP错误 → 抛出最终错误
└─ 超时错误 → 抛出最终错误
```

### 5.2 错误日志记录

```typescript
console.log("Generating speech with voice ID:", voice.id);
console.log("Text:", text);
console.log("Google TTS URL:", googleTtsUrl);
console.log("Response status:", response.status);
console.log("Audio blob size:", audioBlob.size, "type:", audioBlob.type);
```

### 5.3 错误消息

| 场景 | 错误消息 |
|------|----------|
| 未选择语音 | `"No voice selected. Please select a voice first."` |
| 主服务失败 | `"TTS generation failed: [status] - [details]"` |
| 备用服务失败 | `"All TTS services failed. Last error: [message]"` |

---

## 6. Vercel 部署注意事项

### 6.1 环境变量

**当前实现无需环境变量配置:**

- ✅ TTS服务使用公开API,无需API密钥
- ✅ 自动处理CORS问题
- ✅ 自动处理语言识别

**可选环境变量:**

```bash
# Whisper API (语音识别,可选)
WHISPER_API_URL=https://whisper.2068.online

# LLM功能 (可选)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 6.2 构建配置

**vite.config.ts:**

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});
```

### 6.3 部署验证

部署后验证步骤:

1. 访问应用URL
2. 打开浏览器开发者工具 (F12)
3. 选择任意语音
4. 输入测试文本
5. 点击生成按钮
6. 检查Network标签:
   - 查看请求到 `translate.google.com` 的请求
   - 验证响应状态码为 200
   - 确认Content-Type为 `audio/mpeg`

---

## 7. 性能优化

### 7.1 请求优化

```typescript
// 1. 文本长度限制
if (text.length > 2000) {
  throw new Error("Text too long. Maximum 2000 characters allowed.");
}

// 2. 避免重复请求
const cacheKey = `${voice.id}:${text}`;
if (ttsCache.has(cacheKey)) {
  return ttsCache.get(cacheKey);
}

// 3. 超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);
```

### 7.2 音频处理优化

```typescript
// 使用Blob URL避免重复加载
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();

// 清理资源
audio.onended = () => {
  URL.revokeObjectURL(audioUrl);
};
```

---

## 8. 常见问题和解决方案

### 8.1 CORS 跨域问题

**问题:** 浏览器阻止跨域请求

**解决方案:**
- 已在代码中添加 `Referer` 头
- 使用客户端标识 `client=tw-ob`

### 8.2 请求频率限制

**问题:** Google TTS返回429错误

**解决方案:**
```typescript
// 添加请求限流
const lastRequestTime = new Map<string, number>();
const MIN_INTERVAL = 1000; // 1秒间隔

const now = Date.now();
const lastTime = lastRequestTime.get(langCode) || 0;
if (now - lastTime < MIN_INTERVAL) {
  await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL));
}
```

### 8.3 网络超时

**问题:** 请求超时或无响应

**解决方案:**
```typescript
// 使用AbortController
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, { signal: controller.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    console.error("Request timeout");
  }
}
```

### 8.4 音频格式不兼容

**问题:** 某些浏览器不支持mp3格式

**解决方案:**
```typescript
// 检测浏览器支持
const audio = new Audio();
if (audio.canPlayType('audio/mp3')) {
  // 使用mp3
} else {
  // 转换为其他格式或使用备用服务
}
```

---

## 9. 安全考虑

### 9.1 输入验证

```typescript
// 1. 文本长度限制
const MAX_TEXT_LENGTH = 2000;
if (text.length > MAX_TEXT_LENGTH) {
  throw new Error(`Text too long. Maximum ${MAX_TEXT_LENGTH} characters.`);
}

// 2. 特殊字符过滤
const sanitizedText = text.replace(/[<>]/g, '');

// 3. XSS防护
const safeText = DOMPurify.sanitize(text);
```

### 9.2 请求安全

```typescript
// 不发送敏感信息
headers: {
  'Referer': 'https://translate.google.com/',
  // 不发送: Cookie, Authorization等
}
```

---

## 10. 监控和调试

### 10.1 关键监控指标

- ✅ API响应时间
- ✅ 错误率
- ✅ 备用服务切换率
- ✅ 音频生成成功率

### 10.2 调试信息

```typescript
// 启用调试模式
const DEBUG = import.meta.env.MODE === 'development';

if (DEBUG) {
  console.log('[TTS Debug]', {
    voiceId: voice.id,
    textLength: text.length,
    langCode,
    requestUrl,
    responseStatus: response.status,
    audioSize: audioBlob.size
  });
}
```

---

## 11. 未来改进方向

1. **支持更多TTS服务**
   - Microsoft Azure TTS
   - Amazon Polly
   - IBM Watson TTS

2. **音频质量控制**
   - 支持多种采样率
   - 支持立体声
   - 音频压缩优化

3. **高级功能**
   - 语音风格调整
   - 语速控制
   - 音调控制
   - 情感表达

4. **性能优化**
   - 实现请求缓存
   - 支持流式传输
   - 预加载常用语音

---

## 12. 总结

本项目在Vercel环境中的TTS实现具有以下特点:

**优势:**
- ✅ 使用公开免费API,无需认证
- ✅ 双服务备份,高可用性
- ✅ 自动语言识别
- ✅ 完善的错误处理
- ✅ 部署简单,无需配置

**注意事项:**
- ⚠️ Google TTS可能有频率限制
- ⚠️ Yandex TTS语音选项有限
- ⚠️ 网络依赖性强
- ⚠️ 音频质量受服务影响

**最佳实践:**
- 📝 做好错误处理和日志记录
- 📝 实现请求限流
- 📝 添加缓存机制
- 📝 监控服务可用性

---

**文档版本:** 1.0
**最后更新:** 2026-01-14
**维护者:** Edge-TTS Web Team
