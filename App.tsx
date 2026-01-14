import React, { useState, useEffect } from 'react';
import { VoiceSelector } from './components/VoiceSelector';
import { TextInput } from './components/TextInput';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceInput } from './components/VoiceInput';
import { VoiceOption, Gender, Language } from './types';
import { fetchAvailableVoices, generateSpeech, checkTTSHealth } from './services/ttsService'; // Updated import
import { Settings2, Volume2, Sparkles } from 'lucide-react';

export default function App() {
  const [text, setText] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<Gender>(Gender.Female);
  const [voices, setVoices] = useState<VoiceOption[]>([]); // State for voices
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null); // Allow null initially
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.English);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Check service availability on component mount
  useEffect(() => {
    const checkService = async () => {
      try {
        const available = await checkTTSHealth();
        setIsServiceAvailable(available);
      } catch (err) {
        console.error("Service health check failed:", err);
        setIsServiceAvailable(false);
      }
    };

    checkService();
    // Set up periodic health check every 30 seconds
    const interval = setInterval(checkService, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch available voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const fetchedVoices = await fetchAvailableVoices();
        setVoices(fetchedVoices);
        // Set the default voice once voices are fetched
        if (fetchedVoices.length > 0) {
          const defaultForGender = fetchedVoices.find(v => v.gender === selectedGender);
          setSelectedVoice(defaultForGender || fetchedVoices[0]);
        }
      } catch (err) {
        console.error("Failed to load voices:", err);
        setError("Could not load voice options. Please try refreshing.");
        // Fallback to empty array or placeholder if needed
        setVoices([]);
        setSelectedVoice(null);
      }
    };

    loadVoices();
  }, [selectedGender]); // Re-fetch if gender changes (though typically voices are static per server)

  // Sync default voice when gender changes, but only if voices are already loaded
  useEffect(() => {
    if (voices.length > 0) {
      const defaultForGender = voices.find(v => v.gender === selectedGender);
      setSelectedVoice(defaultForGender || voices[0]);
    }
  }, [selectedGender, voices]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }
    if (!selectedVoice) {
      setError("Please select a voice first.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setAudioBlob(null);

    try {
      const blob = await generateSpeech(text, selectedVoice, selectedLanguage);
      setAudioBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setError(null);
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    setText(transcribedText);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 relative">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-primary to-indigo-400 text-white p-2 rounded-lg">
            <Volume2 size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AudioGen</h1>
        </div>
        <div className="flex items-center space-x-2">
            <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="bg-gray-100 text-xs font-semibold text-gray-600 px-3 py-1.5 rounded-full border-none outline-none focus:ring-2 focus:ring-primary/20"
            >
                <option value={Language.English}>EN</option>
                <option value={Language.Chinese}>CN</option>
            </select>
            <button className="text-gray-400 p-1">
                <Settings2 size={20} />
            </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-start">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {/* Text Input Section */}
        <section>
          <TextInput text={text} setText={setText} />
          <div className="flex justify-end mt-2">
            <VoiceInput 
              onTranscriptionComplete={handleVoiceTranscription}
              selectedLanguage={selectedLanguage}
            />
          </div>
        </section>

        {/* Settings Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Voice Settings
            </label>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isServiceAvailable === null 
                  ? 'bg-gray-400 animate-pulse' 
                  : isServiceAvailable 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
              }`}></div>
              <span className="text-xs bg-indigo-100 text-primary px-2 py-0.5 rounded font-medium">
                Edge-TTS Service
              </span>
            </div>
          </div>
         
          <VoiceSelector
            voices={voices} // Use the fetched voices
            selectedVoice={selectedVoice}
            onSelect={setSelectedVoice}
            selectedGender={selectedGender}
            onGenderSelect={setSelectedGender}
          />
        </section>

        {/* Generate Action - only visible if no audio or audio closed */}
        {!audioBlob && !isGenerating && (
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || !selectedVoice}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <Sparkles size={20} className="text-indigo-200" />
            <span>Generate Audio</span>
          </button>
        )}
        
        <div className="h-20"></div> {/* Spacer for fixed player */}
      </main>

      {/* Floating Player */}
      <AudioPlayer 
        audioBlob={audioBlob} 
        isGenerating={isGenerating} 
        onReset={handleReset}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />
    </div>
  );
}
