import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Volume2, RefreshCw } from 'lucide-react';
import { downloadBlob } from '../utils/audioUtils';
import { PlaybackSpeed } from './PlaybackSpeed';

interface AudioPlayerProps {
  audioBlob: Blob | null;
  isGenerating: boolean;
  onReset: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioBlob, 
  isGenerating, 
  onReset, 
  playbackSpeed = 1.0,
  onSpeedChange
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.load();
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // 更新播放速度
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleDownload = () => {
    if (audioBlob) {
      downloadBlob(audioBlob, `speech-${Date.now()}.wav`);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioBlob && !isGenerating) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-2xl pb-safe px-6 py-4 z-50 rounded-t-3xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Generating Speech...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
             <button 
              onClick={onReset}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-3 text-gray-600 hover:text-primary transition-colors bg-gray-50 rounded-full"
            >
              <Download size={24} />
            </button>
          </div>

          {/* Speed Control */}
          {onSpeedChange && (
            <div className="flex justify-center">
              <PlaybackSpeed 
                speed={playbackSpeed} 
                onSpeedChange={onSpeedChange} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};