
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, User, Key } from "lucide-react";
import { UsernameLoginForm } from "@/components/UsernameLoginForm";

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  minecraft_username?: string;
  bio?: string;
  avatar_url?: string;
}

interface LoginResponse {
  valid: boolean;
  player_uuid: string;
  player_name: string;
  profile_id?: string;
  profile?: Profile;
  session?: any;
  error?: string;
}

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokenlink' | 'username'>('tokenlink');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        setLoading(true);
        
        // Request session creation along with token validation
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-token?token=${token}&create_session=true`;
        console.log('Calling Edge Function:', functionUrl);
        
        const response = await fetch(functionUrl, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('Response URL:', response.url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Log response details for debugging
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        let data: LoginResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          console.error('Response was:', responseText);
          throw new Error('Invalid response format from server');
        }

        if (!data.valid) {
          setError(data.error || "Invalid or expired token.");
          setLoading(false);
          return;
        }

        // Store TokenLink authentication data
        localStorage.setItem("player_uuid", data.player_uuid);
        localStorage.setItem("player_name", data.player_name);
        
        if (data.profile_id) {
          localStorage.setItem("tokenlink_profile_id", data.profile_id);
        }
        
        if (data.profile) {
          localStorage.setItem("profile", JSON.stringify(data.profile));
        }

        // If we have session data, try to establish Supabase session
        if (data.session && data.session.access_token) {
          console.log('Attempting to establish Supabase session');
          
          try {
            // Create a custom session using the magic link approach
            const { error: sessionError } = await supabase.auth.signInWithOtp({
              email: data.profile.email,
              options: {
                shouldCreateUser: false // Don't create a new user, use existing profile
              }
            });

            if (sessionError) {
              console.warn('Failed to create Supabase session:', sessionError);
              // Continue with TokenLink-only auth
            } else {
              console.log('Supabase session established successfully');
            }
          } catch (sessionErr) {
            console.warn('Session creation error:', sessionErr);
            // Continue with TokenLink-only auth
          }
        }

        // Set success state
        setSuccess(true);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

      } catch (e) {
        console.error("Login error:", e);
        setError("Failed to validate token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  const handleRetryLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login to Nordics</CardTitle>
          <CardDescription>
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('tokenlink')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tokenlink'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            TokenLink
          </button>
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'username'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Username
          </button>
        </div>
        
        <CardContent>
          {activeTab === 'tokenlink' ? (
            // TokenLink Login Tab
            <>
              {loading && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Validating login token...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Creating your session and syncing your profile
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Login successful!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Welcome, {localStorage.getItem("player_name")}!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your profile has been synced and you now have full website access.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        To get a new login link:
                      </p>
                      <ol className="text-sm text-muted-foreground text-left space-y-1">
                        <li>1. Join the Minecraft server</li>
                        <li>2. Type <code className="bg-background px-1 rounded">/login</code> in chat</li>
                        <li>3. Click the link provided</li>
                      </ol>
                    </div>
                    
                    <Button 
                      onClick={handleRetryLogin}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Return to Homepage
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      Don't have a Minecraft account?{' '}
                      <a 
                        href="/signup" 
                        className="text-blue-500 hover:text-blue-400 font-medium underline"
                      >
                        Create a website account
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Username Login Tab
            <UsernameLoginForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
