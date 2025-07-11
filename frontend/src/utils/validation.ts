/**
 * Validation utilities for task input
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const TASK_VALIDATION_RULES = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 500,
  MAX_LINES: 10,
} as const;

/**
 * Validates task text input with comprehensive checks
 */
export function validateTaskText(text: string): ValidationResult {
  // Basic existence check
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Task text must be a string' };
  }

  // Trim whitespace for validation
  const trimmed = text.trim();

  // Check minimum length
  if (trimmed.length < TASK_VALIDATION_RULES.MIN_LENGTH) {
    return { isValid: false, error: 'Task cannot be empty' };
  }

  // Check maximum length
  if (trimmed.length > TASK_VALIDATION_RULES.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Task cannot exceed ${TASK_VALIDATION_RULES.MAX_LENGTH} characters` 
    };
  }

  // Check for excessive line breaks
  const lineCount = trimmed.split('\n').length;
  if (lineCount > TASK_VALIDATION_RULES.MAX_LINES) {
    return { 
      isValid: false, 
      error: `Task cannot have more than ${TASK_VALIDATION_RULES.MAX_LINES} lines` 
    };
  }

  // Check for potentially harmful content (basic XSS prevention)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: 'Task contains potentially unsafe content' };
    }
  }

  // Check for control characters (except newlines and tabs)
  const controlCharPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (controlCharPattern.test(text)) {
    return { isValid: false, error: 'Task contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Sanitizes task text by removing/replacing unsafe content
 */
export function sanitizeTaskText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize multiple consecutive whitespace to single space
    .replace(/[ \t]+/g, ' ')
    // Limit consecutive newlines to maximum of 2
    .replace(/\n{3,}/g, '\n\n');
}