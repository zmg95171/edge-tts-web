# ttsService错误的修复

## 问题概述

在集成edge-tts服务时，前端应用遇到了几个关键问题，导致无法正确生成语音。以下是问题的详细描述和解决方案。

## 发现的问题

### 1. API调用参数不匹配

**问题描述**：
在`ttsService.ts`的`generateSpeech`函数中，发送给TTS服务的请求体使用了`voiceId`作为参数名，但根据API文档，服务期望的参数名应该是`voice`。

**原始代码**：
```typescript
body: JSON.stringify({
  text: text,
  voiceId: voice.id, // 使用了错误的参数名
  output_format: 'mp3',
}),
```

**解决方案**：
将参数名从`voiceId`改为`voice`，以匹配API期望的参数名。

**修复后代码**：
```typescript
body: JSON.stringify({
  text: text,
  voice: voice.id, // 使用正确的参数名
  output_format: 'mp3',
}),
```

### 2. 跨域问题

**问题描述**：
前端应用运行在`http://localhost:3010`，而TTS服务运行在`http://localhost:3001`。由于没有配置代理，直接请求会导致跨域问题。

**解决方案**：
在`vite.config.ts`中添加代理配置，将`/api/tts`请求代理到`http://localhost:3001`。

**修复后代码**：
```typescript
server: {
  port: 3010,
  host: '0.0.0.0',
  proxy: {
    '/api/tts': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    }
  }
},
```

### 3. TTS_SERVICE_URL配置问题

**问题描述**：
`ttsService.ts`中的`TTS_SERVICE_URL`被设置为`http://localhost:3001`，这会导致直接请求TTS服务，绕过代理，从而引发跨域问题。

**解决方案**：
将`TTS_SERVICE_URL`设置为空字符串，使用相对路径，通过Vite代理访问TTS服务。

**修复后代码**：
```typescript
const TTS_SERVICE_URL = ''; // 使用相对路径，通过Vite代理访问TTS服务
```

### 4. VoiceSelector组件中的null值处理

**问题描述**：
在`VoiceSelector.tsx`组件中，`selectedVoice`的类型被定义为`VoiceOption`，但在`App.tsx`中，`selectedVoice`的初始值被设置为`null`。这会导致类型不匹配，并且在`selectedVoice`为`null`时访问`selectedVoice.id`会引发错误。

**解决方案**：
将`selectedVoice`的类型改为`VoiceOption | null`，并使用可选链操作符`?.`安全地访问`selectedVoice.id`。

**修复后代码**：
```typescript
interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: VoiceOption | null; // 允许null值
  onSelect: (voice: VoiceOption) => void;
  selectedGender: Gender;
  onGenderSelect: (gender: Gender) => void;
}

// 使用可选链操作符安全访问selectedVoice.id
selectedVoice?.id === voice.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
```

## 修复后的效果

经过以上修复，应用现在能够：
1. 正确获取edge-tts服务提供的声音列表
2. 将选择的声音ID正确传递给TTS服务
3. 生成对应声音的语音，而不是始终使用默认声音
4. 避免跨域问题和类型不匹配导致的错误

## 额外改进

### 5. 修复参数名错误

**问题描述**：
尽管前端代码能够正确获取并显示edge-tts服务提供的朗读者列表，并且将选择的朗读者ID正确传递给服务，但所有生成的语音均使用相同的默认女性声音。

**问题原因**：
在generateSpeech函数中，我们使用了错误的参数名`voice`，但后端期望的参数名是`voiceId`。当后端没有接收到有效的`voiceId`参数时，它会自动使用默认的`en-US-JennyNeural`（即默认女声）。

**解决方案**：
修改generateSpeech函数，将参数名从`voice`改为`voiceId`，确保后端能够正确接收到声音ID。

**修复后代码**：
```typescript
// 之前
body: JSON.stringify({
  text: text,
  voice: voice.id,
  output_format: 'mp3',
}),

// 修复后
body: JSON.stringify({
  text: text,
  voiceId: voice.id, // 使用voiceId字段名，并传递完整的id
  output_format: 'mp3',
}),
```

### 6. 修复声音ID提取错误

**问题描述**：
尽管前端代码能够正确获取并显示edge-tts服务提供的朗读者列表，并且将选择的朗读者ID正确传递给服务，但所有生成的语音均使用相同的默认女性声音。

**问题原因**：
在fetchAvailableVoices函数中，我们尝试从`voice.voiceTag.voiceName`获取声音ID，但实际上API返回的声音对象中，声音ID直接在`voice.id`字段中。这导致我们提取的声音ID不正确，从而无法生成对应声音的语音。

**解决方案**：
修改fetchAvailableVoices函数，直接从`voice.id`字段提取声音ID，而不是从`voice.voiceTag.voiceName`提取。

**修复后代码**：
```typescript
// 之前
const voiceId = voice.voiceTag?.voiceName;

// 修复后
const voiceId = voice.id; // 直接使用voice.id作为声音ID
```

同时，我们也修改了style字段的提取方式，从`voice.voiceTag?.styleList?.[0]`改为使用`voice.description`，因为API返回的声音对象中没有voiceTag字段。

### 6. 扩展PLACEHOLDER_VOICES

**问题描述**：
原有的PLACEHOLDER_VOICES只包含少数几个英文声音，没有中文声音选项。当无法从API获取声音列表时，用户只能选择有限的声音，特别是没有中文声音选项。

**解决方案**：
扩展PLACEHOLDER_VOICES，添加更多声音ID，包括中文声音和多语言声音，以确保后备选项更加全面。

**修复后内容**：
- 添加了更多英文女性声音（Emma, Michelle等）
- 添加了更多英文男性声音（Brian等）
- 添加了中文女性声音（晓晓、晓伊、晓涵、晓梦、晓萱、晓颜）
- 添加了中文男性声音（云希、云健、云扬、云泽、云枫）
- 添加了多语言声音（Ava Multilingual, Emma Multilingual, Brian Multilingual）

这样，即使在无法从API获取声音列表的情况下，用户也能有更多声音选项，包括中文声音，提高了应用的可用性。

## 总结

这次修复主要解决了API调用参数不匹配、跨域问题和类型安全问题。通过正确配置代理、使用正确的API参数以及正确处理可能的null值，应用现在能够稳定地与edge-tts服务通信，提供准确的文本转语音功能。
