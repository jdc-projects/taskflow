/**
 * Animation constants for consistent timing across the application
 */

export const ANIMATION_DURATIONS = {
  // Main task animations (seconds)
  TASK_TRANSITION: 0.3,
  
  // Section expand/collapse animations (seconds)
  SECTION_TOGGLE: 0.2,
  
  // Test wait times (milliseconds)
  TEST_WAIT: 200,
  
  // Focus management delay buffer (milliseconds)
  FOCUS_DELAY_BUFFER: 100,
} as const;

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Get total focus delay including animation and buffer
 */
export function getFocusDelay(animationDuration: number): number {
  return secondsToMs(animationDuration) + ANIMATION_DURATIONS.FOCUS_DELAY_BUFFER;
}