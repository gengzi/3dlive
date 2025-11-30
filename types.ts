export type Emotion = 
  | 'neutral' 
  | 'happy' 
  | 'surprised' 
  | 'confused' 
  | 'angry' 
  | 'shy' 
  | 'sad' 
  | 'helpless' 
  | 'excited' 
  | 'focused';

export type MouthShape = 'closed' | 'a' | 'o' | 'e' | 'i' | 'u' | 'v';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: Emotion;
  timestamp: number;
}

export interface AvatarState {
  emotion: Emotion;
  isSpeaking: boolean;
  isLoading: boolean;
  mouthShape: MouthShape;
}

// API Response structure expectation
export interface GeminiResponse {
  reply: string;
  emotion: Emotion;
}
