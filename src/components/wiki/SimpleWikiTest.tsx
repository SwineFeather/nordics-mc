import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SimpleWikiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      // Test environment variables
      const envVars = {
        VITE_SUPABASE_S3_SECRET_KEY: import.meta.env.VITE_SUPABASE_S3_SECRET_KEY,
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      };

      // Test basic file fetch
      const testFile = 'Nordics/nations/constellation.md';
      const publicUrl = `https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/wiki/${testFile}`;
      
      const response = await fetch(publicUrl);
      const fileContent = await response.text();

      // Test S3 credentials directly
      const s3Test = {
        accessKeyId: '96dbaa973dcb77349745eb36d4e9e93a',
        secretAccessKey: import.meta.env.VITE_SUPABASE_S3_SECRET_KEY,
        hasSecretKey: !!import.meta.env.VITE_SUPABASE_S3_SECRET_KEY,
        secretKeyLength: import.meta.env.VITE_SUPABASE_S3_SECRET_KEY?.length || 0,
        secretKeyStartsWith: import.meta.env.VITE_SUPABASE_S3_SECRET_KEY?.substring(0, 10) || 'N/A'
      };

      setTestResults({
        envVars,
        fileTest: {
          url: publicUrl,
          status: response.status,
          ok: response.ok,
          contentLength: fileContent.length,
          contentPreview: fileContent.substring(0, 100) + '...'
        },
        s3Test
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Wiki Test - Environment & S3 Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={loading}>
            {loading ? 'Testing...' : 'Test Environment & S3'}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">VITE_SUPABASE_S3_SECRET_KEY:</span>
                      <Badge variant={testResults.envVars?.VITE_SUPABASE_S3_SECRET_KEY ? 'default' : 'destructive'}>
                        {testResults.envVars?.VITE_SUPABASE_S3_SECRET_KEY ? '✅ Set' : '❌ Missing'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">VITE_SUPABASE_URL:</span>
                      <Badge variant={testResults.envVars?.VITE_SUPABASE_URL ? 'default' : 'destructive'}>
                        {testResults.envVars?.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">VITE_SUPABASE_ANON_KEY:</span>
                      <Badge variant={testResults.envVars?.VITE_SUPABASE_ANON_KEY ? 'default' : 'destructive'}>
                        {testResults.envVars?.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">S3 Credentials Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Access Key ID:</span>
                      <Badge variant="outline">{testResults.s3Test?.accessKeyId}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Secret Key Present:</span>
                      <Badge variant={testResults.s3Test?.hasSecretKey ? 'default' : 'destructive'}>
                        {testResults.s3Test?.hasSecretKey ? '✅ Yes' : '❌ No'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Secret Key Length:</span>
                      <Badge variant="outline">{testResults.s3Test?.secretKeyLength}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Secret Key Preview:</span>
                      <Badge variant="outline">{testResults.s3Test?.secretKeyStartsWith}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Access Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Test URL:</span>
                      <Badge variant="outline" className="text-xs">{testResults.fileTest?.url}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Status:</span>
                      <Badge variant={testResults.fileTest?.ok ? 'default' : 'destructive'}>
                        {testResults.fileTest?.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Content Length:</span>
                      <Badge variant="outline">{testResults.fileTest?.contentLength}</Badge>
                    </div>
                    <div className="mt-2">
                      <span className="font-mono text-sm">Content Preview:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {testResults.fileTest?.contentPreview}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {testResults.error && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-red-600 text-sm">{testResults.error}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleWikiTest; 