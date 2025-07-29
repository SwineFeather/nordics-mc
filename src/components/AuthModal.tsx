
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { validatePassword } from '@/utils/passwordValidator';
import { validateEmail, validateUsername } from '@/utils/inputValidator';
import { useRateLimit } from '@/hooks/useRateLimit';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { checkRateLimit, getRemainingAttempts } = useRateLimit();

  const handleLogin = async () => {
    if (!checkRateLimit('login')) {
      const remaining = getRemainingAttempts('login');
      toast.error(`Too many login attempts. Try again in ${remaining} seconds.`);
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    try {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setValidationErrors(emailValidation.errors);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitizedValue,
        password: formData.password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return;
      }

      toast.success('Successfully logged in!');
      onClose();
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!checkRateLimit('register')) {
      const remaining = getRemainingAttempts('register');
      toast.error(`Too many registration attempts. Try again in ${remaining} seconds.`);
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    try {
      // Validate all inputs
      const emailValidation = validateEmail(formData.email);
      const usernameValidation = validateUsername(formData.username);
      const passwordValidation = validatePassword(formData.password);

      const allErrors = [
        ...emailValidation.errors,
        ...usernameValidation.errors,
        ...passwordValidation.errors
      ];

      if (formData.password !== formData.confirmPassword) {
        allErrors.push('Passwords do not match');
      }

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: emailValidation.sanitizedValue,
        password: formData.password,
        options: {
          data: {
            username: usernameValidation.sanitizedValue
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message);
        return;
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      onClose();
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'login' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('login')}
              className="flex-1"
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === 'register' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('register')}
              className="flex-1"
            >
              Sign Up
            </Button>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>

          <Button
            onClick={activeTab === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Please wait...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
