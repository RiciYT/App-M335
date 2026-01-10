/**
 * Tilt Control Configuration
 * 
 * Adjust these values to tune the ball movement behavior.
 * These settings make the controls feel natural and responsive.
 */

export const TILT_CONTROLS = {
  /**
   * Control Inversion
   * When true, tilting the phone left moves the ball left (natural behavior).
   * The accelerometer by default reports values that feel "reversed".
   */
  INVERT_X: true,  // Invert X-axis: tilting left moves ball left
  INVERT_Y: true,  // Invert Y-axis: tilting forward moves ball forward (up)

  /**
   * Sensitivity
   * Higher values = faster ball movement. Range: 0.5 - 3.0 recommended.
   * Default: 1.0
   */
  SENSITIVITY: 1.0,

  /**
   * Deadzone
   * Sensor values below this threshold are ignored to prevent jitter
   * from small hand movements. Range: 0.02 - 0.1 recommended.
   * Default: 0.05
   */
  DEADZONE: 0.05,

  /**
   * Smoothing Alpha (Low-pass filter coefficient)
   * Controls how much smoothing is applied to sensor readings.
   * Lower values = more smoothing (smoother but less responsive).
   * Higher values = less smoothing (more responsive but more jittery).
   * Range: 0.1 - 0.5 recommended.
   * Default: 0.3
   */
  SMOOTHING_ALPHA: 0.3,

  /**
   * Maximum Force
   * Clamps the maximum force applied to the ball to prevent
   * uncontrollable acceleration. Range: 0.001 - 0.005 recommended.
   * Default: 0.003
   */
  MAX_FORCE: 0.003,

  /**
   * Update Interval (milliseconds)
   * How often the accelerometer sends updates.
   * Lower values = more frequent updates but more CPU usage.
   * Range: 30 - 100 recommended.
   * Default: 50 (20 updates per second)
   */
  UPDATE_INTERVAL: 50,

  /**
   * Base Force Magnitude
   * The base multiplier for converting sensor values to force.
   * This is scaled by SENSITIVITY.
   * Default: 0.0015
   */
  BASE_FORCE_MAGNITUDE: 0.0015,
};

/**
 * Apply deadzone to a sensor value.
 * Values within the deadzone are set to 0.
 */
export function applyDeadzone(value: number, deadzone: number): number {
  // Ensure deadzone is within valid range (0 to 0.99)
  const safeDeadzone = Math.min(Math.max(deadzone, 0), 0.99);
  
  if (Math.abs(value) < safeDeadzone) {
    return 0;
  }
  // Rescale the value so it starts from 0 at the deadzone boundary
  const sign = value > 0 ? 1 : -1;
  return sign * (Math.abs(value) - safeDeadzone) / (1 - safeDeadzone);
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a value to a specified number of decimal places.
 */
export function roundToDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Multiplier used to display force values in a more readable format.
 * Force values are typically very small (e.g., 0.003), so we multiply by this
 * to show them as more intuitive numbers (e.g., 3.0).
 */
export const FORCE_DISPLAY_MULTIPLIER = 1000;
