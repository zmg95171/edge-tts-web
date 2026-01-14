export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum Language {
  English = 'English',
  Chinese = 'Chinese'
}

export interface VoiceOption {
  id: string; // Gemini voice name (e.g., 'Puck', 'Kore')
  name: string; // Display name
  gender: Gender;
  style: string; // Description like 'Deep', 'Calm'
}

export interface GenerationConfig {
  voice: VoiceOption;
  language: Language;
  text: string;
}

export interface AudioState {
  isGenerating: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  duration: number;
  currentTime: number;
  error: string | null;
}