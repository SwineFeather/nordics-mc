import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'uuid';
  enum?: string[];
  custom?: string; // Function name for custom validation
}

interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, any>;
}

interface ValidationRequest {
  data: Record<string, any>;
  schema: ValidationSchema;
  options?: {
    strict?: boolean;
    allowUnknown?: boolean;
    sanitize?: boolean;
  };
}

interface ValidationResponse {
  success: boolean;
  result?: ValidationResult;
  error?: string;
}

// Predefined validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(
      null,
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    )
  }

  try {
    const { data, schema, options = {} }: ValidationRequest = await req.json()
    
    if (!data || !schema) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing data or validation schema'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const validationResult = await validateData(data, schema, options)
    
    return new Response(
      JSON.stringify({
        success: true,
        result: validationResult
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Validation middleware error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

/**
 * Main validation function
 */
async function validateData(
  data: Record<string, any>,
  schema: ValidationSchema,
  options: { strict?: boolean; allowUnknown?: boolean; sanitize?: boolean } = {}
): Promise<ValidationResult> {
  const { strict = true, allowUnknown = false, sanitize = true } = options;
  
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

  // Check for unknown fields if strict mode is enabled
  if (strict && !allowUnknown) {
    const unknownFields = Object.keys(data).filter(field => !schema[field]);
    if (unknownFields.length > 0) {
      errors['_unknown'] = [`Unknown fields: ${unknownFields.join(', ')}`];
    }
  }

  // Validate each field according to schema
  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = data[fieldName];
    const fieldErrors: string[] = [];

    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      fieldErrors.push(`${fieldName} is required`);
    }

    // Skip other validations if value is empty and not required
    if ((value === null || value === undefined || value === '') && !rule.required) {
      if (sanitize) sanitizedData[fieldName] = value;
      continue;
    }

    // Type validation
    if (rule.type) {
      const typeError = validateType(value, rule.type, fieldName);
      if (typeError) fieldErrors.push(typeError);
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${fieldName} must be no more than ${rule.maxLength} characters long`);
      }
    }

    // Pattern validation
    if (rule.pattern) {
      const pattern = VALIDATION_PATTERNS[rule.pattern as keyof typeof VALIDATION_PATTERNS] || new RegExp(rule.pattern);
      if (!pattern.test(String(value))) {
        fieldErrors.push(`${fieldName} format is invalid`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(String(value))) {
      fieldErrors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
    }

    // Custom validation
    if (rule.custom) {
      const customError = await runCustomValidation(rule.custom, value, fieldName);
      if (customError) fieldErrors.push(customError);
    }

    // Store errors if any
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    } else if (sanitize) {
      // Sanitize and store valid data
      sanitizedData[fieldName] = sanitizeValue(value, rule);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Validate data type
 */
function validateType(value: any, expectedType: string, fieldName: string): string | null {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string' ? null : `${fieldName} must be a string`;
    case 'number':
      return !isNaN(Number(value)) ? null : `${fieldName} must be a number`;
    case 'boolean':
      return typeof value === 'boolean' ? null : `${fieldName} must be a boolean`;
    case 'email':
      return VALIDATION_PATTERNS.email.test(String(value)) ? null : `${fieldName} must be a valid email`;
    case 'url':
      return VALIDATION_PATTERNS.url.test(String(value)) ? null : `${fieldName} must be a valid URL`;
    case 'uuid':
      return VALIDATION_PATTERNS.uuid.test(String(value)) ? null : `${fieldName} must be a valid UUID`;
    default:
      return null;
  }
}

/**
 * Run custom validation functions
 */
async function runCustomValidation(
  functionName: string,
  value: any,
  fieldName: string
): Promise<string | null> {
  try {
    switch (functionName) {
      case 'validateUsername':
        return VALIDATION_PATTERNS.username.test(String(value)) ? null : `${fieldName} must be 3-20 characters, letters, numbers, underscores, hyphens only`;
      
      case 'validatePassword':
        return VALIDATION_PATTERNS.password.test(String(value)) ? null : `${fieldName} must be at least 12 characters with lowercase, uppercase, number, and special character`;
      
      case 'validateAlphanumeric':
        return VALIDATION_PATTERNS.alphanumeric.test(String(value)) ? null : `${fieldName} must contain only letters and numbers`;
      
      case 'validatePositiveNumber':
        const num = Number(value);
        return !isNaN(num) && num > 0 ? null : `${fieldName} must be a positive number`;
      
      case 'validateInteger':
        return Number.isInteger(Number(value)) ? null : `${fieldName} must be an integer`;
      
      default:
        return null;
    }
  } catch (error) {
    console.error(`Custom validation error for ${functionName}:`, error);
    return `${fieldName} validation failed`;
  }
}

/**
 * Sanitize value based on rule
 */
function sanitizeValue(value: any, rule: ValidationRule): any {
  if (typeof value === 'string') {
    let sanitized = value.trim();
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Truncate if exceeds max length
    if (rule.maxLength && sanitized.length > rule.maxLength) {
      sanitized = sanitized.substring(0, rule.maxLength);
    }
    
    return sanitized;
  }
  
  if (rule.type === 'number') {
    return Number(value);
  }
  
  if (rule.type === 'boolean') {
    return Boolean(value);
  }
  
  return value;
}

/**
 * Export validation function for use in other Edge Functions
 */
export async function validateInput(
  data: Record<string, any>,
  schema: ValidationSchema,
  options?: { strict?: boolean; allowUnknown?: boolean; sanitize?: boolean }
): Promise<ValidationResult> {
  return validateData(data, schema, options);
}

/**
 * Common validation schemas
 */
export const COMMON_SCHEMAS = {
  userProfile: {
    username: { required: true, type: 'string', pattern: 'username', minLength: 3, maxLength: 20 },
    email: { required: true, type: 'email', maxLength: 255 },
    bio: { required: false, type: 'string', maxLength: 1000 },
    avatar_url: { required: false, type: 'url', maxLength: 500 }
  },
  
  forumPost: {
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    content: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
    tags: { required: false, type: 'string', maxLength: 500 },
    category_id: { required: true, type: 'uuid' }
  },
  
  comment: {
    content: { required: true, type: 'string', minLength: 1, maxLength: 2000 },
    parent_id: { required: false, type: 'uuid' }
  },
  
  fileUpload: {
    filename: { required: true, type: 'string', maxLength: 255 },
    file_type: { required: true, type: 'string', maxLength: 100 },
    file_size: { required: true, type: 'number', custom: 'validatePositiveNumber' }
  }
};
