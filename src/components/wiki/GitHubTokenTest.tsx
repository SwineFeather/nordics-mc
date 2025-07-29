import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  Eye, 
  EyeOff, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const GitHubTokenTest = () => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testGitHubToken = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      console.log('🔑 Testing GitHub token...');
      
      // Test the edge function
      const { data, error } = await supabase.functions.invoke('get-github-token');
      
      if (error) {
        console.error('❌ Edge function error:', error);
        setTestResult({
          success: false,
          error: `Edge function error: ${error.message}`,
          details: error
        });
        toast.error(`Edge function error: ${error.message}`);
        return;
      }

      if (!data?.token) {
        setTestResult({
          success: false,
          error: 'No token returned from edge function',
          details: data
        });
        toast.error('No token returned from edge function');
        return;
      }

      // Test GitHub API access
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Nordics-Wiki-App'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        setTestResult({
          success: false,
          error: `GitHub API error: ${response.status} ${response.statusText}`,
          details: { status: response.status, statusText: response.statusText, body: errorText }
        });
        toast.error(`GitHub API error: ${response.status} ${response.statusText}`);
        return;
      }

      const userData = await response.json();
      
      setTestResult({
        success: true,
        message: 'GitHub token is valid and working',
        details: {
          user: userData.login,
          tokenPrefix: data.token.substring(0, 8) + '...',
          apiResponse: userData
        }
      });
      
      toast.success('GitHub token is valid and working!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTesting(false);
    }
  };

  const testRepositoryAccess = async () => {
    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-github-token');
      
      if (error || !data?.token) {
        toast.error('Cannot get GitHub token');
        return;
      }

      // Test repository access
      const response = await fetch('https://api.github.com/repos/SwineFeather/Nordics', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Nordics-Wiki-App'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Repository access failed: ${response.status} ${response.statusText}`);
        console.error('Repository access error:', { status: response.status, body: errorText });
        return;
      }

      const repoData = await response.json();
      toast.success(`Repository access successful! Found: ${repoData.name}`);
      console.log('Repository data:', repoData);
      
    } catch (error) {
      console.error('Repository access test failed:', error);
      toast.error('Repository access test failed');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          GitHub Token Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">GitHub Personal Access Token (for testing)</Label>
          <div className="flex gap-2">
            <Input
              id="token"
              type={showToken ? "text" : "password"}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testGitHubToken}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test Edge Function
              </>
            )}
          </Button>
          
          <Button 
            onClick={testRepositoryAccess}
            disabled={isTesting}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test Repository Access
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    {testResult.success ? 'Success' : 'Error'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testResult.message || testResult.error}
                  </div>
                  {testResult.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        Show details
                      </summary>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>If the edge function fails, you need to:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to Settings → API</li>
            <li>Add your GitHub Personal Access Token as a secret named <code>GITHUB_TOKEN</code></li>
            <li>Deploy the edge function: <code>supabase functions deploy get-github-token</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}; 