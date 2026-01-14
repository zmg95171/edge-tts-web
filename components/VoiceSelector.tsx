import React from 'react';
import { VoiceOption, Gender } from '../types';
import { User, Mic2 } from 'lucide-react';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: VoiceOption | null;
  onSelect: (voice: VoiceOption) => void;
  selectedGender: Gender;
  onGenderSelect: (gender: Gender) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelect,
  selectedGender,
  onGenderSelect
}) => {
  
  const filteredVoices = voices.filter(v => v.gender === selectedGender);

  return (
    <div className="space-y-4">
      {/* Gender Tabs */}
      <div className="flex bg-gray-200 p-1 rounded-xl">
        {Object.values(Gender).map((gender) => (
          <button
            key={gender}
            onClick={() => onGenderSelect(gender)}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
              selectedGender === gender
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {gender}
          </button>
        ))}
      </div>

      {/* Voice List */}
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
        {filteredVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onSelect(voice)}
            className={`relative flex items-center p-4 rounded-xl border-2 transition-all text-left ${
              selectedVoice.id === voice.id
                ? 'border-primary bg-indigo-50/50'
                : 'border-white bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
              selectedVoice?.id === voice.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {selectedVoice?.id === voice.id ? <Mic2 size={20} /> : <User size={20} />}
            </div>
            <div>
              <div className="font-bold text-gray-900">{voice.name}</div>
              <div className="text-xs text-gray-500 font-medium">{voice.style}</div>
            </div>
            {selectedVoice?.id === voice.id && (
              <div className="absolute right-4 w-3 h-3 bg-primary rounded-full shadow-sm ring-2 ring-indigo-100"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};