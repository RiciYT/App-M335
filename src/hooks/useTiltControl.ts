import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import Matter from 'matter-js';
import { TILT_CONTROLS, applyDeadzone, clamp, lerp } from '../config/tiltControls';

export interface TiltSettings {
  invertX: boolean;
  sensitivity: number;
  deadzone: number;
  smoothingAlpha: number;
  updateInterval: number;
}

interface UseTiltControlProps {
  engine: Matter.Engine | null;
  enabled: boolean;
  settings: TiltSettings;
}

/**
 * Custom hook for tilt-based ball control.
 * Controls ONLY horizontal (X-axis) movement based on device tilt.
 * Gravity is constant downward and NOT affected by device tilt.
 */
export function useTiltControl({ engine, enabled, settings }: UseTiltControlProps) {
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const smoothedXRef = useRef(0);
  const settingsRef = useRef(settings);

  // Keep settings ref updated
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Set up constant gravity (downward only, not affected by tilt)
  useEffect(() => {
    if (engine) {
      engine.gravity.y = TILT_CONTROLS.CONSTANT_GRAVITY_Y;
      engine.gravity.x = 0;
    }
  }, [engine]);

  // Handle accelerometer subscription
  useEffect(() => {
    if (!enabled || !engine) {
      // Clean up subscription if disabled
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      return;
    }

    // Set update interval
    Accelerometer.setUpdateInterval(settings.updateInterval);

    // Subscribe to accelerometer
    subscriptionRef.current = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      if (!engine) return;

      const currentSettings = settingsRef.current;
      
      // Only use X-axis - Y and Z axes are completely ignored
      const { x } = data;

      // Apply low-pass filter for smoothing (reduces jitter)
      smoothedXRef.current = lerp(
        smoothedXRef.current,
        x,
        currentSettings.smoothingAlpha
      );

      // Apply deadzone to ignore small movements
      let filteredX = applyDeadzone(smoothedXRef.current, currentSettings.deadzone);

      // Apply inversion if needed (for natural control feel)
      if (currentSettings.invertX) {
        filteredX = -filteredX;
      }

      // Clamp to prevent extreme values
      filteredX = clamp(filteredX, -1.0, 1.0);

      // Apply sensitivity and set horizontal gravity
      // This controls left/right movement based on tilt
      engine.gravity.x = filteredX * currentSettings.sensitivity;
      
      // Y-gravity remains constant (set once above) - NOT affected by any tilt
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, engine, settings.updateInterval]);

  // Update interval when setting changes
  useEffect(() => {
    if (enabled) {
      Accelerometer.setUpdateInterval(settings.updateInterval);
    }
  }, [enabled, settings.updateInterval]);

  // Reset smoothed value when disabled
  const reset = useCallback(() => {
    smoothedXRef.current = 0;
    if (engine) {
      engine.gravity.x = 0;
      engine.gravity.y = TILT_CONTROLS.CONSTANT_GRAVITY_Y;
    }
  }, [engine]);

  return { reset };
}

export const DEFAULT_TILT_SETTINGS: TiltSettings = {
  invertX: TILT_CONTROLS.INVERT_X,
  sensitivity: TILT_CONTROLS.SENSITIVITY,
  deadzone: TILT_CONTROLS.DEADZONE,
  smoothingAlpha: TILT_CONTROLS.SMOOTHING_ALPHA,
  updateInterval: TILT_CONTROLS.UPDATE_INTERVAL,
};
