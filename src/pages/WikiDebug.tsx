import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { OptimizedWikiService } from '../services/optimizedWikiService';
import { SupabaseWikiService } from '../services/supabaseWikiService';

const WikiDebug: React.FC = () => {
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [originalResult, setOriginalResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOptimizedService = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing optimized service...');
      const start = Date.now();
      const result = await OptimizedWikiService.getFileStructureOnly();
      const end = Date.now();
      
      setOptimizedResult({
        files: result,
        count: result.length,
        time: end - start,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Optimized service result:', result);
    } catch (err) {
      console.error('❌ Optimized service error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testOriginalService = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing original service...');
      const start = Date.now();
      const result = await SupabaseWikiService.getFileStructure();
      const end = Date.now();
      
      setOriginalResult({
        files: result,
        count: result.length,
        time: end - start,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Original service result:', result);
    } catch (err) {
      console.error('❌ Original service error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testBoth = async () => {
    await testOptimizedService();
    await testOriginalService();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Wiki Service Debug</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={testOptimizedService} disabled={loading}>
          Test Optimized Service
        </Button>
        <Button onClick={testOriginalService} disabled={loading}>
          Test Original Service
        </Button>
        <Button onClick={testBoth} disabled={loading}>
          Test Both
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Optimized Service Results */}
        <Card>
          <CardHeader>
            <CardTitle>Optimized Service</CardTitle>
          </CardHeader>
          <CardContent>
            {optimizedResult ? (
              <div className="space-y-2">
                <p><strong>Files Found:</strong> {optimizedResult.count}</p>
                <p><strong>Time:</strong> {optimizedResult.time}ms</p>
                <p><strong>Timestamp:</strong> {optimizedResult.timestamp}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(optimizedResult.files, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-muted-foreground">No test run yet</p>
            )}
          </CardContent>
        </Card>

        {/* Original Service Results */}
        <Card>
          <CardHeader>
            <CardTitle>Original Service</CardTitle>
          </CardHeader>
          <CardContent>
            {originalResult ? (
              <div className="space-y-2">
                <p><strong>Files Found:</strong> {originalResult.count}</p>
                <p><strong>Time:</strong> {originalResult.time}ms</p>
                <p><strong>Timestamp:</strong> {originalResult.timestamp}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(originalResult.files, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-muted-foreground">No test run yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Testing services...</p>
        </div>
      )}
    </div>
  );
};

export default WikiDebug; 