import { Language } from "../types";

const WHISPER_SERVICE_URL = ''; // 使用相对路径，通过Vite代理访问Whisper服务

/**
 * 将音频文件转录为文本
 * @param audioBlob 音频Blob对象
 * @param language 可选，指定转录语言（如'zh', 'en'）
 * @returns 转录后的文本
 */
export const transcribeAudio = async (
  audioBlob: Blob, 
  language?: Language
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    // 如果指定了语言，添加到表单中
    if (language) {
      const langCode = language === Language.Chinese ? 'zh' : 'en';
      formData.append('language', langCode);
    }

    const response = await fetch(`${WHISPER_SERVICE_URL}/api/whisper/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error transcribing audio - status:", response.status, "text:", errorText);
      throw new Error(`Failed to transcribe audio: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error: any) {
    console.error("Audio Transcription Error:", error);
    throw error;
  }
};

/**
 * 检查Whisper服务健康状态
 * @returns 服务是否可用
 */
export const checkWhisperHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${WHISPER_SERVICE_URL}/api/whisper/health`);
    return response.ok;
  } catch (error) {
    console.error("Whisper health check failed:", error);
    return false;
  }
};