export type Screen = 'Login' | 'Menu' | 'Game' | 'Result' | 'Highscores' | 'Settings';

export interface GameScore {
  userId: string;
  email: string;
  nickname: string;
  time: number;
  timestamp: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  sensitivity: number;
}

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
};
