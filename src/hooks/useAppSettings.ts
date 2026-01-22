import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TILT_CONTROLS } from '../config/tiltControls';

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  sensitivity: number;
}

const SETTINGS_KEY = '@tiltmaze_settings';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  sensitivity: TILT_CONTROLS.SENSITIVITY,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (storedSettings && isMounted) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    settings,
    isLoading,
    vibrationEnabled: settings.vibrationEnabled,
  };
}
