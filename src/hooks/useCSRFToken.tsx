import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CSRFToken {
  token: string;
  expiresAt: number;
}

export interface CSRFValidationResult {
  isValid: boolean;
  error?: string;
}

class CSRFTokenManager {
  private static instance: CSRFTokenManager;
  private currentToken: CSRFToken | null = null;
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager();
    }
    return CSRFTokenManager.instance;
  }

  /**
   * Generate a new CSRF token
   */
  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get or create a valid CSRF token
   */
  async getToken(): Promise<string> {
    // Check if current token is still valid
    if (this.currentToken && Date.now() < this.currentToken.expiresAt) {
      return this.currentToken.token;
    }

    // Generate new token
    const token = this.generateToken();
    const expiresAt = Date.now() + this.TOKEN_EXPIRY;

    this.currentToken = { token, expiresAt };

    // Store token in session storage for persistence across page reloads
    try {
      sessionStorage.setItem('csrf_token', JSON.stringify(this.currentToken));
    } catch (error) {
      console.warn('Failed to store CSRF token in session storage:', error);
    }

    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string): CSRFValidationResult {
    if (!this.currentToken) {
      return { isValid: false, error: 'No CSRF token available' };
    }

    if (Date.now() >= this.currentToken.expiresAt) {
      this.currentToken = null;
      return { isValid: false, error: 'CSRF token has expired' };
    }

    if (this.currentToken.token !== token) {
      return { isValid: false, error: 'Invalid CSRF token' };
    }

    return { isValid: true };
  }

  /**
   * Refresh the CSRF token
   */
  async refreshToken(): Promise<string> {
    this.currentToken = null;
    return this.getToken();
  }

  /**
   * Clear the current token
   */
  clearToken(): void {
    this.currentToken = null;
    try {
      sessionStorage.removeItem('csrf_token');
    } catch (error) {
      console.warn('Failed to clear CSRF token from session storage:', error);
    }
  }

  /**
   * Initialize token from session storage
   */
  initializeFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('csrf_token');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token && parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.currentToken = parsed;
        } else {
          sessionStorage.removeItem('csrf_token');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize CSRF token from storage:', error);
      sessionStorage.removeItem('csrf_token');
    }
  }
}

/**
 * React hook for CSRF token management
 */
export const useCSRFToken = () => {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tokenManager = CSRFTokenManager.getInstance();

  // Initialize token on mount
  useEffect(() => {
    const initializeToken = async () => {
      try {
        // Try to restore from session storage first
        tokenManager.initializeFromStorage();
        
        const newToken = await tokenManager.getToken();
        setToken(newToken);
        setError(null);
      } catch (err) {
        setError('Failed to generate CSRF token');
        console.error('CSRF token initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeToken();
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const newToken = await tokenManager.refreshToken();
      setToken(newToken);
      setError(null);
    } catch (err) {
      setError('Failed to refresh CSRF token');
      console.error('CSRF token refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate token function
  const validateToken = useCallback((tokenToValidate: string): CSRFValidationResult => {
    return tokenManager.validateToken(tokenToValidate);
  }, []);

  // Get token function (returns current token or generates new one)
  const getToken = useCallback(async (): Promise<string> => {
    try {
      const newToken = await tokenManager.getToken();
      setToken(newToken);
      return newToken;
    } catch (err) {
      setError('Failed to get CSRF token');
      throw err;
    }
  }, []);

  // Clear token function
  const clearToken = useCallback(() => {
    tokenManager.clearToken();
    setToken('');
  }, []);

  return {
    token,
    isLoading,
    error,
    refreshToken,
    validateToken,
    getToken,
    clearToken
  };
};

/**
 * Higher-order component for adding CSRF protection to forms
 */
export const withCSRFProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P & { csrfToken: string }>
) => {
  return (props: P) => {
    const { token, isLoading, error } = useCSRFToken();

    if (isLoading) {
      return <div className="flex items-center justify-center p-4">Loading security token...</div>;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-4 text-red-600">
          Security error: {error}
        </div>
      );
    }

    return <WrappedComponent {...props} csrfToken={token} />;
  };
};

/**
 * Utility function to add CSRF token to form data
 */
export const addCSRFTokenToFormData = (formData: FormData, csrfToken: string): FormData => {
  formData.append('csrf_token', csrfToken);
  return formData;
};

/**
 * Utility function to add CSRF token to JSON payload
 */
export const addCSRFTokenToPayload = <T extends Record<string, any>>(
  payload: T,
  csrfToken: string
): T & { csrf_token: string } => {
  return { ...payload, csrf_token: csrfToken };
};

/**
 * Utility function to validate CSRF token in response
 */
export const validateCSRFResponse = (response: Response): boolean => {
  // Check if response includes CSRF validation header
  const csrfValid = response.headers.get('X-CSRF-Valid');
  return csrfValid === 'true';
};

export default useCSRFToken;
