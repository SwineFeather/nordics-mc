import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useCSRFToken } from '@/hooks/useCSRFToken';

export interface CSRFFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, csrfToken: string) => void;
  onCSRFError?: (error: string) => void;
  showCSRFToken?: boolean; // For debugging purposes
}

export interface CSRFFormRef {
  submit: () => void;
  getCSRFToken: () => string | null;
  validateCSRF: () => boolean;
}

const CSRFForm = forwardRef<CSRFFormRef, CSRFFormProps>(
  ({ children, onSubmit, onCSRFError, showCSRFToken = false, ...formProps }, ref) => {
    const { token, isLoading, error, validateToken } = useCSRFToken();
    const formRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
      submit: () => {
        formRef.current?.requestSubmit();
      },
      getCSRFToken: () => token || null,
      validateCSRF: () => {
        if (!token) return false;
        const result = validateToken(token);
        if (!result.isValid && onCSRFError) {
          onCSRFError(result.error || 'Invalid CSRF token');
        }
        return result.isValid;
      }
    }));

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!token) {
        const errorMsg = 'CSRF token not available';
        console.error(errorMsg);
        onCSRFError?.(errorMsg);
        return;
      }

      const validation = validateToken(token);
      if (!validation.isValid) {
        const errorMsg = validation.error || 'Invalid CSRF token';
        console.error(errorMsg);
        onCSRFError?.(errorMsg);
        return;
      }

      if (onSubmit) {
        onSubmit(e, token);
      }
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Loading security token...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-4 text-red-600">
          <span>Security error: {error}</span>
        </div>
      );
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit} {...formProps}>
        {/* Hidden CSRF token field */}
        <input
          type="hidden"
          name="csrf_token"
          value={token}
          required
        />
        
        {/* Debug CSRF token display (only when showCSRFToken is true) */}
        {showCSRFToken && (
          <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted rounded">
            CSRF Token: {token}
          </div>
        )}
        
        {children}
      </form>
    );
  }
);

CSRFForm.displayName = 'CSRFForm';

export default CSRFForm;
