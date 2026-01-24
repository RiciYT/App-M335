/**
 * Tilt Control Configuration
 * 
 * This game uses ONLY X-axis (left/right) tilt for horizontal ball movement.
 * Gravity is constant downward - forward/backward tilting does NOT affect the ball.
 */

export const TILT_CONTROLS = {
  /**
   * Control Inversion (X-axis only)
   * When true, tilting the phone left moves the ball left (natural behavior).
   * The accelerometer by default reports values that feel "reversed".
   */
  INVERT_X: false,  // Invert X-axis: tilting left moves ball left

  /**
   * Sensitivity (X-axis only)
   * Higher values = faster horizontal ball movement. Range: 0.5 - 3.0 recommended.
   * Default: 1.0
   */
  SENSITIVITY: 1.0,

  /**
   * Deadzone
   * Sensor values below this threshold are ignored to prevent jitter
   * from small hand movements. Range: 0.02 - 0.1 recommended.
   * Default: 0.05
   */
  DEADZONE: 0.02,

  /**
   * Smoothing Alpha (Low-pass filter coefficient)
   * Controls how much smoothing is applied to X-axis sensor readings.
   * Lower values = more smoothing (smoother but less responsive).
   * Higher values = less smoothing (more responsive but more jittery).
   * Range: 0.1 - 0.5 recommended.
   * Default: 0.25
   */
  SMOOTHING_ALPHA: 0.5,

  /**
   * Curve Power (non-linear shaping)
   * Values > 1 reduce sensitivity near center and ramp up towards edges.
   * Default: 1.6
   */
  CURVE_POWER: 1.15,

  /**
   * Constant Gravity (Y-axis)
   * The constant downward force applied to the ball.
   * This is NOT affected by device tilt.
   * Default: 0.8
   */
  CONSTANT_GRAVITY_Y: 0.8,

  /**
   * Ball physics tuning
   */
  BALL_FRICTION: 0.04,
  BALL_RESTITUTION: 0.3,
  BALL_FRICTION_AIR: 0.025,

  /**
   * Tilt force tuning
   */
  FORCE: 0.0005,
  MAX_VX: 9,
  MAX_DT_MS: 1000 / 60,

  /**
   * Update Interval (milliseconds)
   * How often DeviceMotion sends updates.
   * Lower values = more frequent updates but more CPU usage.
   * Range: 16 - 100 recommended.
   * Default: 16 (~60 updates per second)
   */
  UPDATE_INTERVAL: 16,
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
 * Low-pass filter (lerp) for smoothing sensor values.
 * @param current The current smoothed value
 * @param target The new raw sensor value
 * @param alpha Smoothing factor (0-1). Higher = more responsive, lower = smoother
 */
export function lerp(current: number, target: number, alpha: number): number {
  return current + alpha * (target - current);
}
