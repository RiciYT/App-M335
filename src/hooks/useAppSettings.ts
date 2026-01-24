import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, SETTINGS_KEY, DEFAULT_SETTINGS } from '../types';
import { initMusic, playMainMusic, setMusicEnabled } from '../audio/music';

let musicInitialized = false;

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and start music on first load
  useEffect(() => {
    const initAndPlayMusic = async () => {
      if (!musicInitialized) {
        musicInitialized = true;
        await initMusic();
        // Only play if sound is enabled in settings
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        const parsed = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
        if (parsed.soundEnabled !== false) {
          await playMainMusic(0.4); // Lower volume for background music
        }
      }
    };
    initAndPlayMusic();
  }, []);

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

  // Sync music with soundEnabled setting
  useEffect(() => {
    if (!isLoading && musicInitialized) {
      setMusicEnabled(settings.soundEnabled);
    }
  }, [settings.soundEnabled, isLoading]);

  return {
    settings,
    isLoading,
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    // Tilt settings
    sensitivity: settings.sensitivity,
    invertX: settings.invertX,
    deadzone: settings.deadzone,
    smoothingAlpha: settings.smoothingAlpha,
  };
}
