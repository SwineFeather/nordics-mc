import { useState, useCallback, useEffect } from 'react';
import { validateEmail, validateUsername, validateTextContent } from '@/utils/inputValidator';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { isValid: boolean; error?: string };
  email?: boolean;
  username?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  positive?: boolean;
  fileType?: string[];
  maxFileSize?: number; // in bytes
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue: any;
}

export interface FormValidationState {
  [fieldName: string]: ValidationResult;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormData {
  [fieldName: string]: any;
}

export interface UseFormValidationReturn {
  validateField: (fieldName: string, value: any) => ValidationResult;
  validateForm: (formData: FormData) => { isValid: boolean; errors: Record<string, string[]> };
  validationState: FormValidationState;
  clearValidation: (fieldName?: string) => void;
  isFormValid: boolean;
  hasErrors: boolean;
  getFieldErrors: (fieldName: string) => string[];
  validateOnBlur: (fieldName: string, value: any) => void;
  validateOnChange: (fieldName: string, value: any) => void;
}

/**
 * Universal form validation hook
 */
export const useFormValidation = (
  validationConfig: FormValidationConfig,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  } = {}
): UseFormValidationReturn => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

  /**
   * Validate a single field based on its rules
   */
  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    const rules = validationConfig[fieldName];
    if (!rules) {
      return { isValid: true, errors: [], sanitizedValue: value };
    }

    const errors: string[] = [];
    let sanitizedValue = value;

    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldName} is required`);
    }

    // Skip other validations if value is empty and not required
    if ((value === null || value === undefined || value === '') && !rules.required) {
      return { isValid: true, errors: [], sanitizedValue: value };
    }

    // String validations
    if (typeof value === 'string') {
      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${fieldName} format is invalid`);
      }

      // Email validation
      if (rules.email) {
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          errors.push(...emailValidation.errors);
        }
        sanitizedValue = emailValidation.sanitizedValue;
      }

      // Username validation
      if (rules.username) {
        const usernameValidation = validateUsername(value);
        if (!usernameValidation.isValid) {
          errors.push(...usernameValidation.errors);
        }
        sanitizedValue = usernameValidation.sanitizedValue;
      }

      // URL validation
      if (rules.url) {
        try {
          new URL(value);
        } catch {
          errors.push(`${fieldName} must be a valid URL`);
        }
      }

      // Text content validation
      if (rules.maxLength) {
        const contentValidation = validateTextContent(value, rules.maxLength);
        if (!contentValidation.isValid) {
          errors.push(...contentValidation.errors);
        }
        sanitizedValue = contentValidation.sanitizedValue;
      }
    }

    // Numeric validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      
      if (rules.integer && !Number.isInteger(numValue)) {
        errors.push(`${fieldName} must be an integer`);
      }
      
      if (rules.positive && numValue <= 0) {
        errors.push(`${fieldName} must be positive`);
      }
    }

    // File validations
    if (value instanceof File) {
      if (rules.fileType && rules.fileType.length > 0) {
        const isValidType = rules.fileType.some(type => 
          value.type.startsWith(type) || value.name.endsWith(type)
        );
        if (!isValidType) {
          errors.push(`${fieldName} must be one of: ${rules.fileType.join(', ')}`);
        }
      }

      if (rules.maxFileSize && value.size > rules.maxFileSize) {
        const maxSizeMB = (rules.maxFileSize / (1024 * 1024)).toFixed(1);
        errors.push(`${fieldName} must be smaller than ${maxSizeMB}MB`);
      }
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (!customResult.isValid && customResult.error) {
        errors.push(customResult.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }, [validationConfig]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData: FormData): { isValid: boolean; errors: Record<string, string[]> } => {
    const errors: Record<string, string[]> = {};
    let isFormValid = true;

    Object.keys(validationConfig).forEach(fieldName => {
      const value = formData[fieldName];
      const validation = validateField(fieldName, value);
      
      if (!validation.isValid) {
        errors[fieldName] = validation.errors;
        isFormValid = false;
      }
    });

    return { isValid: isFormValid, errors };
  }, [validationConfig, validateField]);

  /**
   * Clear validation for a specific field or all fields
   */
  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } else {
      setValidationState({});
    }
  }, []);

  /**
   * Validate field on blur
   */
  const validateOnBlur = useCallback((fieldName: string, value: any) => {
    if (!validateOnBlur) return;
    
    const validation = validateField(fieldName, value);
    setValidationState(prev => ({
      ...prev,
      [fieldName]: validation
    }));
  }, [validateOnBlur, validateField]);

  /**
   * Validate field on change with debouncing
   */
  const validateOnChange = useCallback((fieldName: string, value: any) => {
    if (!validateOnChange) return;

    // Clear existing timer
    if (debounceTimers[fieldName]) {
      clearTimeout(debounceTimers[fieldName]);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const validation = validateField(fieldName, value);
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validation
      }));
    }, debounceMs);

    setDebounceTimers(prev => ({
      ...prev,
      [fieldName]: timer
    }));
  }, [validateOnChange, validateField, debounceMs, debounceTimers]);

  /**
   * Get field errors
   */
  const getFieldErrors = useCallback((fieldName: string): string[] => {
    return validationState[fieldName]?.errors || [];
  }, [validationState]);

  /**
   * Check if form has any errors
   */
  const hasErrors = Object.values(validationState).some(state => !state.isValid);

  /**
   * Check if entire form is valid
   */
  const isFormValid = Object.keys(validationConfig).length > 0 && 
    Object.keys(validationConfig).every(fieldName => {
      const state = validationState[fieldName];
      return state && state.isValid;
    });

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    };
  }, [debounceTimers]);

  return {
    validateField,
    validateForm,
    validationState,
    clearValidation,
    isFormValid,
    hasErrors,
    getFieldErrors,
    validateOnBlur,
    validateOnChange
  };
};

/**
 * Predefined validation rules for common field types
 */
export const VALIDATION_RULES = {
  email: {
    required: true,
    email: true,
    maxLength: 255
  },
  username: {
    required: true,
    username: true,
    minLength: 3,
    maxLength: 20
  },
  password: {
    required: true,
    minLength: 12,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string) => {
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[@$!%*?&]/.test(value);
      
      if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
        return {
          isValid: false,
          error: 'Password must contain lowercase, uppercase, number, and special character'
        };
      }
      
      return { isValid: true };
    }
  },
  requiredText: {
    required: true,
    minLength: 1,
    maxLength: 1000
  },
  optionalText: {
    required: false,
    maxLength: 1000
  },
  url: {
    required: false,
    url: true,
    maxLength: 500
  },
  imageFile: {
    required: false,
    fileType: ['image/'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
};

export default useFormValidation;
