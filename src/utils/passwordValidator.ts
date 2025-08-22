
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Minimum length - much more lenient
  if (password.length < 4) {
    errors.push('Password must be at least 4 characters long');
  } else {
    score += 1;
  }

  // Uppercase letter - optional
  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Lowercase letter - optional
  if (/[a-z]/.test(password)) {
    score += 1;
  }

  // Number - optional
  if (/\d/.test(password)) {
    score += 1;
  }

  // Special character - optional
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  // Common password check - keep this for security
  const commonPasswords = ['password123', '123456789', 'qwerty123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common patterns');
    score = Math.max(0, score - 1);
  }

  // Determine strength - adjusted for more lenient scoring
  let strength: PasswordValidationResult['strength'];
  if (score >= 4) strength = 'very-strong';
  else if (score >= 3) strength = 'strong';
  else if (score >= 2) strength = 'medium';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};
