import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Bug } from "lucide-react";

interface DebugInfo {
  hasToken: boolean;
  tokenValue: string | null;
  localStorageData: any;
  error: string | null;
  functionResponse: any;
}

const LoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasToken: false,
    tokenValue: null,
    localStorageData: {},
    error: null,
    functionResponse: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    
    // Get localStorage data
    const localStorageData = {
      player_uuid: localStorage.getItem("player_uuid"),
      player_name: localStorage.getItem("player_name"),
      tokenlink_profile_id: localStorage.getItem("tokenlink_profile_id"),
      profile: localStorage.getItem("profile"),
      supabase_auth_token: localStorage.getItem("supabase.auth.token")
    };

    setDebugInfo({
      hasToken: !!token,
      tokenValue: token,
      localStorageData,
      error: null,
      functionResponse: null
    });

    if (token) {
      testTokenValidation(token);
    }
  }, []);

  const testTokenValidation = async (token: string) => {
    setLoading(true);
    try {
      console.log('Testing token validation with:', token);
      
      const response = await fetch(
        `https://erdconvorgecupvavlwv.supabase.co/functions/v1/validate-token?token=${token}&create_session=true`
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setDebugInfo(prev => ({
        ...prev,
        functionResponse: data
      }));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!data.valid) {
        setDebugInfo(prev => ({
          ...prev,
          error: data.error || "Invalid or expired token."
        }));
      }

    } catch (e) {
      console.error("Token validation error:", e);
      setDebugInfo(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : "Unknown error occurred"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLogin = () => {
    window.location.href = '/';
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("player_uuid");
    localStorage.removeItem("player_name");
    localStorage.removeItem("tokenlink_profile_id");
    localStorage.removeItem("profile");
    localStorage.removeItem("supabase.auth.token");
    
    // Remove all Supabase auth keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Bug className="h-6 w-6" />
            Login Debug Information
          </CardTitle>
          <CardDescription>
            Debug information for login troubleshooting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* URL Parameters */}
          <div className="space-y-2">
            <h3 className="font-semibold">URL Parameters:</h3>
            <div className="bg-muted p-3 rounded-lg">
              <p><strong>Has Token:</strong> {debugInfo.hasToken ? 'Yes' : 'No'}</p>
              <p><strong>Token Value:</strong> {debugInfo.tokenValue || 'None'}</p>
            </div>
          </div>

          {/* LocalStorage Data */}
          <div className="space-y-2">
            <h3 className="font-semibold">LocalStorage Data:</h3>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.localStorageData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Function Response */}
          {debugInfo.functionResponse && (
            <div className="space-y-2">
              <h3 className="font-semibold">Function Response:</h3>
              <div className="bg-muted p-3 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.functionResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error Display */}
          {debugInfo.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {debugInfo.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
              <p className="font-medium">Testing token validation...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleRetryLogin}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Button>
            
            <Button 
              onClick={clearLocalStorage}
              variant="destructive"
            >
              Clear LocalStorage
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                To test login:
              </p>
              <ol className="text-sm text-muted-foreground text-left space-y-1">
                <li>1. Join the Minecraft server</li>
                <li>2. Type <code className="bg-background px-1 rounded">/login</code> in chat</li>
                <li>3. Click the link provided</li>
                <li>4. Check this debug page for information</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginDebug; 