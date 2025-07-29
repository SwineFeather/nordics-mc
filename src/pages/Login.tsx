
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const supabase = createClient(
  "https://erdconvorgecupvavlwv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZGNvbnZvcmdlY3VwdmF2bHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM4ODcsImV4cCI6MjA2NTE1OTg4N30.1JAp47oJDpiNmnKjpYB_tS9__0Sytk18o8dL-Dfnrdg"
);

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
        const response = await fetch(
          `https://erdconvorgecupvavlwv.supabase.co/functions/v1/validate-token?token=${token}&create_session=true`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LoginResponse = await response.json();

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
          <CardTitle className="text-2xl font-bold">TokenLink Login</CardTitle>
          <CardDescription>
            Authenticating your Minecraft account...
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
