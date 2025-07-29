
import { sanitizeText, validateInput } from './sanitizer';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const sanitized = sanitizeText(email).trim();
  const errors: string[] = [];
  
  if (!sanitized) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitized,
    errors
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const sanitized = sanitizeText(username).trim();
  const errors: string[] = [];
  
  if (!sanitized) {
    errors.push('Username is required');
  } else if (sanitized.length < 3 || sanitized.length > 20) {
    errors.push('Username must be 3-20 characters long');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitized,
    errors
  };
};

export const validateTextContent = (content: string, maxLength: number = 1000): ValidationResult => {
  const errors: string[] = [];
  
  if (!validateInput(content, maxLength)) {
    errors.push(`Content must be less than ${maxLength} characters and contain no malicious code`);
  }
  
  const sanitized = sanitizeText(content);
  
  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitized,
    errors
  };
};
