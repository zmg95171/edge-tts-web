import { VoiceOption, Language, Gender } from "../types";

// 使用edge-tts库生成TTS音频
// 这个库可以直接调用Microsoft Edge的TTS服务,无需额外的API服务器

// Placeholder voices, used as fallback if fetching fails or returns invalid data
const PLACEHOLDER_VOICES: VoiceOption[] = [
  // English - Female
  { id: 'en-US-JennyNeural', name: 'Jenny (en-US)', gender: Gender.Female, style: 'Calm' },
  { id: 'en-US-AriaNeural', name: 'Aria (en-US)', gender: Gender.Female, style: 'Calm' },
  { id: 'en-US-JaneNeural', name: 'Jane (en-US)', gender: Gender.Female, style: 'Neutral' },
  { id: 'en-US-AnaNeural', name: 'Ana (en-US)', gender: Gender.Female, style: 'Neutral' },
  { id: 'en-US-EmmaNeural', name: 'Emma (en-US)', gender: Gender.Female, style: 'Cheerful' },
  { id: 'en-US-MichelleNeural', name: 'Michelle (en-US)', gender: Gender.Female, style: 'Friendly' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha (en-AU)', gender: Gender.Female, style: 'Friendly, Positive' },

  // English - Male
  { id: 'en-US-GuyNeural', name: 'Guy (en-US)', gender: Gender.Male, style: 'Neutral' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (en-US)', gender: Gender.Male, style: 'Neutral' },
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew Multilingual (en-US)', gender: Gender.Male, style: 'Neutral' },
  { id: 'en-US-BrianNeural', name: 'Brian (en-US)', gender: Gender.Male, style: 'Approachable' },
  { id: 'en-CA-LiamNeural', name: 'Liam (en-CA)', gender: Gender.Male, style: 'Neutral' },

  // Chinese - Female
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓 (zh-CN)', gender: Gender.Female, style: 'Neutral' },
  { id: 'zh-CN-XiaoyiNeural', name: '晓伊 (zh-CN)', gender: Gender.Female, style: 'Gentle' },
  { id: 'zh-CN-XiaohanNeural', name: '晓涵 (zh-CN)', gender: Gender.Female, style: 'Calm' },
  { id: 'zh-CN-XiaomengNeural', name: '晓梦 (zh-CN)', gender: Gender.Female, style: 'Sweet' },
  { id: 'zh-CN-XiaoxuanNeural', name: '晓萱 (zh-CN)', gender: Gender.Female, style: 'Elegant' },
  { id: 'zh-CN-XiaoyanNeural', name: '晓颜 (zh-CN)', gender: Gender.Female, style: 'Cheerful' },

  // Chinese - Male
  { id: 'zh-CN-YunxiNeural', name: '云希 (zh-CN)', gender: Gender.Male, style: 'Gentle' },
  { id: 'zh-CN-YunjianNeural', name: '云健 (zh-CN)', gender: Gender.Male, style: 'Deep' },
  { id: 'zh-CN-YunyangNeural', name: '云扬 (zh-CN)', gender: Gender.Male, style: 'Energetic' },
  { id: 'zh-CN-YunzeNeural', name: '云泽 (zh-CN)', gender: Gender.Male, style: 'Calm' },
  { id: 'zh-CN-YunfengNeural', name: '云枫 (zh-CN)', gender: Gender.Male, style: 'Steady' },

  // Multilingual
  { id: 'en-US-AvaMultilingualNeural', name: 'Ava Multilingual (en-US)', gender: Gender.Female, style: 'Expressive' },
  { id: 'en-US-EmmaMultilingualNeural', name: 'Emma Multilingual (en-US)', gender: Gender.Female, style: 'Cheerful' },
  { id: 'en-US-BrianMultilingualNeural', name: 'Brian Multilingual (en-US)', gender: Gender.Male, style: 'Approachable' },
];

export const fetchAvailableVoices = async (): Promise<VoiceOption[]> => {
  try {
    const response = await fetch(`${TTS_SERVICE_URL}/api/tts/voices`);
    if (!response.ok) {
      const errorText = await response.text(); // Get raw text for debugging
      console.error("Error fetching voices - status:", response.status, "text:", errorText);
      throw new Error(`Failed to fetch voices: ${response.statusText} - ${errorText}`);
    }
    const responseData = await response.json(); // Get the entire JSON response
    console.log("Received voices data:", responseData);

    if (responseData && Array.isArray(responseData.voices)) {
      const mappedVoices = responseData.voices.map((voice: any) => {
        // API返回的声音对象中，声音ID直接在voice.id字段中
        const voiceId = voice.id; // 直接使用voice.id作为声音ID
        const voiceName = voice.name; // Display name
        let inferredGender: Gender;

        if (!voiceId) {
          // Log the voice object that is missing the required voiceId
          console.warn("Skipping voice due to missing voiceId:", voice);
          return null; // Indicate to filter this out later
        }

        if (voice.gender) {
          // Use API provided gender if available and matches enum
          inferredGender = voice.gender.toLowerCase() === 'male' ? Gender.Male : Gender.Female;
        } else if (voiceName.toLowerCase().includes('male')) {
          inferredGender = Gender.Male;
        } else {
          inferredGender = Gender.Female;
        }

        return {
          id: voiceId, // Use the full ShortName as ID
          name: voiceName, // Use the display name
          gender: inferredGender,
          style: voice.description || 'Neutral' // 使用description字段作为风格
        };
      }).filter(Boolean); // Filter out any null entries if a voice was skipped

      if (mappedVoices.length === 0) {
        console.warn("No valid voices were mapped from the API response. Falling back to placeholder voices.");
        return PLACEHOLDER_VOICES;
      }

      console.log("Mapped voices:", mappedVoices); // Log mapped voices
      return mappedVoices;
    } else {
      console.error("Unexpected voice data format:", responseData);
      // Fallback to placeholder voices if the format is unexpected
      console.warn("Falling back to placeholder voices due to unexpected API response format.");
      return PLACEHOLDER_VOICES;
    }

  } catch (error) {
    console.error("Error fetching available voices:", error);
    // Return placeholder voices in case of error during fetch
    console.warn("Falling back to placeholder voices due to fetch error.");
    return PLACEHOLDER_VOICES;
  }
};

export const generateSpeech = async (
  text: string,
  voice: VoiceOption | null, // Allow voice to be null
  language: Language
): Promise<Blob> => {
  if (!voice) {
    throw new Error("No voice selected. Please select a voice first.");
  }

  try {
    // 调试信息
    console.log("Generating speech with voice ID:", voice.id);
    console.log("Text:", text);
    
    // 使用Google Translate TTS API (公开API)
    // 这个API不需要认证,但可能有请求频率限制
    const langCode = voice.id.split('-')[0]; // 从语音ID中提取语言代码
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
    
    console.log("Google TTS URL:", googleTtsUrl);
    
    const response = await fetch(googleTtsUrl, {
      method: 'GET',
      headers: {
        'Referer': 'https://translate.google.com/',
      }
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`TTS generation failed: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    console.log("Audio blob size:", audioBlob.size, "type:", audioBlob.type);
    return audioBlob;

  } catch (error: any) {
    console.error("TTS Generation Error:", error);
    
    // 如果Google TTS失败,尝试使用其他公开TTS服务
    console.log("Trying alternative TTS service...");
    
    try {
      const langCode = voice.id.split('-')[0];
      const encodedText = encodeURIComponent(text);
      const altTtsUrl = `https://tts.voicetech.yandex.net/tts?speaker=oksana&format=mp3&quality=hi&lang=${langCode}&text=${encodedText}`;
      
      console.log("Alternative TTS URL:", altTtsUrl);
      
      const response = await fetch(altTtsUrl, {
        method: 'GET'
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log("Alternative TTS success! Blob size:", audioBlob.size);
        return audioBlob;
      } else {
        throw new Error(`Alternative TTS failed: ${response.status}`);
      }
    } catch (altError: any) {
      console.error("Alternative TTS also failed:", altError);
      throw new Error(`All TTS services failed. Last error: ${altError.message}`);
    }
  }
};

/**
 * 检查TTS服务健康状态
 * @returns 服务是否可用
 */
export const checkTTSHealth = async (): Promise<boolean> => {
  try {
    // 测试Google TTS服务
    const testText = encodeURIComponent("test");
    const response = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${testText}&tl=en&client=tw-ob`);
    return response.ok;
  } catch (error) {
    console.error("TTS health check failed:", error);
    return false;
  }
};
