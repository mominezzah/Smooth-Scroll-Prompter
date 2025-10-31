export interface Settings {
  speed: number;
  fontSize: number;
  lineHeight: number;
  isMirroredX: boolean;
  isMirroredY: boolean;
  isLooping: boolean;
  theme: 'light' | 'dark';
  fontFamily: string;
  hideControlsWhileScrolling: boolean;
  backgroundType: 'color' | 'image';
  backgroundColor: string;
  backgroundImage: string | null;
  textColor: string;
}

export interface SavedScript {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}