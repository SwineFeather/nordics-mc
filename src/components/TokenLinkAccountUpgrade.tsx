
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const TokenLinkAccountUpgrade = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'complete'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const isTokenLinkUser = profile?.email?.includes('@tokenlink.local');

  if (!isTokenLinkUser) {
    return null;
  }

  const validateForm = () => {
    if (!formData.email) {
      toast.error('Please enter an email address');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleUpgrade = async () => {
    if (!validateForm() || !profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upgrade-tokenlink-account', {
        body: {
          profileId: profile.id,
          email: formData.email,
          password: formData.password
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Account upgraded successfully! You can now sign in with your email and password.');
        setStep('complete');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } else {
        throw new Error(data.error || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Error upgrading account:', error);
      toast.error(error.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Upgrade Your Account
        </CardTitle>
        <CardDescription>
          Convert your TokenLink account to a full account with email and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'form' && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account currently uses TokenLink authentication. Add an email and password for enhanced security and full website access.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleUpgrade} disabled={loading} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Upgrading...' : 'Upgrade Account'}
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Account upgrade completed! You now have a full account with email and password authentication. Redirecting to login page...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenLinkAccountUpgrade;
