import { TILT_CONTROLS } from '../config/tiltControls';

export type Screen = 'Login' | 'Menu' | 'Game' | 'Result' | 'Highscores' | 'Settings';

export interface GameScore {
  userId: string;
  email: string;
  nickname: string | null;
  time: number;
  timestamp: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  // Tilt control settings
  sensitivity: number;
  invertX: boolean;
  deadzone: number;
  smoothingAlpha: number;
}

export const SETTINGS_KEY = '@tiltmaze_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  // Tilt control defaults
  sensitivity: TILT_CONTROLS.SENSITIVITY,
  invertX: TILT_CONTROLS.INVERT_X,
  deadzone: TILT_CONTROLS.DEADZONE,
  smoothingAlpha: TILT_CONTROLS.SMOOTHING_ALPHA,
};

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
};
