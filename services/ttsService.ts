import { VoiceOption, Language, Gender } from "../types";

// 根据环境变量或使用默认的 TTS API URL
const TTS_SERVICE_URL = import.meta.env.TTS_API_URL || 'https://tts.2068.online';

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
    console.log("TTS Service URL:", TTS_SERVICE_URL);
    console.log("Generating speech with voice ID:", voice.id); // Log the voice ID being sent
    
    // 使用查询参数构建 GET 请求
    const params = new URLSearchParams({
      text: text,
      voice: voice.id, // 使用voice字段名
      output_format: 'mp3' // Assuming mp3 based on documentation
    });
    
    const requestUrl = `${TTS_SERVICE_URL}/api/tts?${params.toString()}`;
    console.log("Request URL:", requestUrl);
    
    const response = await fetch(requestUrl, {
      method: 'GET'
    });

    console.log("Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      // Attempt to parse error response as JSON, fallback to text
      let errorDetails = response.statusText;
      try {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        errorDetails = errorText;
      } catch (e) {
        console.log("Failed to parse error response");
      }
      throw new Error(`TTS generation failed: ${response.status} - ${errorDetails}`);
    }

    // The documentation states the response is an audio stream (binary)
    const audioBlob = await response.blob();
    return audioBlob;

  } catch (error: any) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};

/**
 * 检查TTS服务健康状态
 * @returns 服务是否可用
 */
export const checkTTSHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${TTS_SERVICE_URL}/api/tts/health`);
    return response.ok;
  } catch (error) {
    console.error("TTS health check failed:", error);
    return false;
  }
};
