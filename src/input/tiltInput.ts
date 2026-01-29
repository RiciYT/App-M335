/**
 * Tilt Input Module
 *
 * Provides precise tilt control using device motion sensors.
 * Uses exponential moving average (EMA) and response curve for smooth, precise input.
 */

import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { applyDeadzone, lerp, clamp } from '../config/tiltControls';

export interface TiltOptions {
  invertX: boolean;
  smoothingAlpha: number;
  deadzone: number;
  curvePower: number;
  updateInterval: number;
}

// Internal state
let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;
let rawTiltX = 0;
let smoothedTiltX = 0;
let calibrationOffset = 0;
let currentOptions: TiltOptions = {
  invertX: false,
  smoothingAlpha: 0.5,
  deadzone: 0.02,
  curvePower: 1.15,
  updateInterval: 16,
};

/**
 * Apply response curve for better precision near center and full range at extremes.
 * Uses power curve: sign(x) * |x|^power
 */
function applyResponseCurve(value: number, power: number): number {
  if (power === 1) return value;
  const sign = value >= 0 ? 1 : -1;
  return sign * Math.pow(Math.abs(value), power);
}

/**
 * Start listening to device tilt.
 */
export function startTilt(options: TiltOptions): void {
  // Stop any existing subscription
  stopTilt();

  currentOptions = { ...options };

  // Set update interval for smoother readings
  DeviceMotion.setUpdateInterval(options.updateInterval);

  subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
    // Use rotation rate (gyroscope) combined with orientation for best precision
    // DeviceMotion provides rotation which gives us device orientation
    const rotation = data.rotation;
    if (!rotation) return;

    // gamma is the left-to-right tilt in radians (-π to π)
    // Convert to normalized value (-1 to 1) with typical tilt range of ±45°
    const maxTiltAngle = Math.PI / 4; // 45 degrees
    let tiltValue = rotation.gamma / maxTiltAngle;

    // Apply calibration offset
    tiltValue -= calibrationOffset;

    // Clamp to -1 to 1 range
    tiltValue = clamp(tiltValue, -1, 1);

    // Store raw value for calibration
    rawTiltX = tiltValue;

    // Apply deadzone to ignore small movements
    let processed = applyDeadzone(tiltValue, currentOptions.deadzone);

    // Apply response curve for better precision
    processed = applyResponseCurve(processed, currentOptions.curvePower);

    // Apply inversion if needed
    if (currentOptions.invertX) {
      processed = -processed;
    }

    // Apply smoothing (EMA filter)
    smoothedTiltX = lerp(smoothedTiltX, processed, currentOptions.smoothingAlpha);
  });
}

/**
 * Stop listening to device tilt.
 */
export function stopTilt(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  rawTiltX = 0;
  smoothedTiltX = 0;
}

/**
 * Get the current smoothed tilt X value.
 * Returns a value between -1 and 1.
 */
export function getTiltX(): number {
  return smoothedTiltX;
}

/**
 * Calibrate the tilt sensor by setting the current position as neutral.
 * Call this when the user is holding the device in their preferred playing position.
 */
export function calibrateTilt(): void {
  // Set current raw position as the new zero point
  calibrationOffset = rawTiltX;
  // Reset smoothed value to prevent sudden jumps
  smoothedTiltX = 0;
}

/**
 * Reset calibration to default (no offset).
 */
export function resetCalibration(): void {
  calibrationOffset = 0;
}
