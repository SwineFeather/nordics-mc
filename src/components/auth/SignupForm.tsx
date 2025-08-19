import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAccountManagement } from '@/hooks/useAccountManagement';
import { useToast } from '@/hooks/use-toast';

export const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    message: string;
    conflictType: string;
  } | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  const navigate = useNavigate();
  const { createWebsiteAccount, checkUsernameAvailability, loading } = useAccountManagement();
  const { toast } = useToast();

  // Check username availability when user types
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      console.log('🔄 Starting username check for:', username);
      setIsCheckingUsername(true);
      
      try {
        const result = await checkUsernameAvailability(username);
        console.log('📋 Username check completed:', result);
        setUsernameStatus(result);
      } catch (error) {
        console.error('💥 Username check failed:', error);
        setUsernameStatus({
          available: false,
          message: "Error checking username",
          conflictType: "error"
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (!usernameStatus?.available) {
      toast({
        title: "Invalid Username",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }
    
          try {
        await createWebsiteAccount(email, username);
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
        navigate('/login');
      } catch (error) {
        // Error already handled by the hook
      }
  };

  const getUsernameStatusIcon = () => {
    if (isCheckingUsername) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (usernameStatus?.available) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (usernameStatus && !usernameStatus.available) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getUsernameStatusColor = () => {
    if (usernameStatus?.available) return 'text-green-600';
    if (usernameStatus && !usernameStatus.available) return 'text-red-600';
    return 'text-gray-500';
  };

  const getUsernameStatusMessage = () => {
    if (!usernameStatus) return null;
    
    if (usernameStatus.conflictType === 'minecraft_reserved' || usernameStatus.conflictType === 'minecraft_player_exists') {
      return (
        <div className="text-sm text-red-600">
          <div className="font-medium">{usernameStatus.message}</div>
          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <p className="font-medium text-red-800 mb-1">To claim this username:</p>
            <ol className="text-red-700 space-y-1">
              <li>1. Join the Minecraft server</li>
              <li>2. Type <code className="bg-red-100 px-1 rounded">/login</code> in chat</li>
              <li>3. Click the link provided to claim your account</li>
            </ol>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`text-sm ${getUsernameStatusColor()}`}>
        {usernameStatus.message}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join the Nordics community
          </CardDescription>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Note:</strong> Minecraft usernames are reserved for players. 
              If your username is taken, use <code className="bg-blue-100 px-1 rounded">/login</code> in-game to claim it.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Choose a unique username"
                  className="w-full pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              {getUsernameStatusMessage()}
              {username.length > 0 && username.length < 3 && (
                <div className="text-sm text-yellow-600">
                  Username must be at least 3 characters long
                </div>
              )}
            </div>
            

            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Create a strong password (min 8 characters)"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading || !usernameStatus?.available || password !== confirmPassword}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
