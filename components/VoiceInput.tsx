import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { transcribeAudio, checkWhisperHealth } from '../services/whisperService';

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  selectedLanguage: Language;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptionComplete, 
  selectedLanguage 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 检查Whisper服务是否可用
  useEffect(() => {
    const checkServiceAvailability = async () => {
      try {
        const available = await checkWhisperHealth();
        setIsServiceAvailable(available);
      } catch (err) {
        console.error('Health check failed:', err);
        setIsServiceAvailable(false);
      }
    };

    checkServiceAvailability();
  }, []);

  const startRecording = async () => {
    setError(null);
    
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建MediaRecorder实例
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // 处理数据可用事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // 处理录音停止事件
      mediaRecorder.onstop = async () => {
        // 关闭所有音轨
        stream.getTracks().forEach(track => track.stop());
        
        // 如果有音频数据，则进行转录
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setIsProcessing(true);
          
          try {
            const transcription = await transcribeAudio(audioBlob, selectedLanguage);
            onTranscriptionComplete(transcription);
          } catch (err: any) {
            setError(err.message || '转录失败，请重试');
          } finally {
            setIsProcessing(false);
          }
        }
      };
      
      // 开始录音
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || '无法访问麦克风');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 如果服务不可用，显示禁用状态
  if (isServiceAvailable === false) {
    return (
      <button
        className="p-3 bg-gray-100 rounded-full cursor-not-allowed opacity-60"
        title="语音转录服务不可用"
        disabled
      >
        <MicOff size={20} className="text-gray-500" />
      </button>
    );
  }

  // 如果正在检查服务状态，显示加载中
  if (isServiceAvailable === null) {
    return (
      <button
        className="p-3 bg-gray-100 rounded-full"
        disabled
      >
        <Loader2 size={20} className="text-gray-500 animate-spin" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleRecording}
        disabled={isProcessing}
        className={`p-3 rounded-full transition-all ${
          isRecording 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${isProcessing ? 'cursor-wait' : ''}`}
        title={isRecording ? '停止录音' : '开始语音输入'}
      >
        {isProcessing ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>
      
      {isRecording && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};