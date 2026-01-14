import { Language } from "../types";

// 根据环境变量或使用默认的 Whisper API URL
const WHISPER_SERVICE_URL = import.meta.env.WHISPER_API_URL || 'https://whisper.2068.online';

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
    console.log("Whisper Service URL:", WHISPER_SERVICE_URL);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    // 如果指定了语言，添加到表单中
    if (language) {
      const langCode = language === Language.Chinese ? 'zh' : 'en';
      formData.append('language', langCode);
      console.log("Language code:", langCode);
    }

    // 尝试使用多个可能的端点
    const possibleEndpoints = [
      '/api/transcribe',
      '/api/whisper/transcribe',
      '/transcribe',
      '/v1/audio/transcriptions'
    ];
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      const requestUrl = `${WHISPER_SERVICE_URL}${endpoint}`;
      console.log("尝试 Whisper 端点:", requestUrl);
      
      try {
        const testResponse = await fetch(requestUrl, {
          method: 'POST',
          body: formData
        });
        
        if (testResponse.ok) {
          response = testResponse;
          console.log("成功连接到端点:", endpoint);
          break;
        } else {
          const errorText = await testResponse.text();
          console.log(`端点 ${endpoint} 返回错误:`, testResponse.status, errorText);
          lastError = new Error(`Endpoint ${endpoint} returned ${testResponse.status}: ${errorText}`);
        }
      } catch (error) {
        console.log(`端点 ${endpoint} 连接失败:`, error);
        lastError = error as Error;
      }
    }
    
    if (!response && lastError) {
      throw lastError;
    } else if (!response) {
      throw new Error("无法连接到任何 Whisper 端点");
    }

    console.log("Whisper response status:", response.status, response.statusText);
    
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