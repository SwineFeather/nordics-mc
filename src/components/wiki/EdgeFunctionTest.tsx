import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

const EdgeFunctionTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<{
    testFunction?: TestResult;
    liveFunction?: TestResult;
  }>({});

  const testBasicFunction = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/functions/v1/test-live-wiki-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        testFunction: {
          success: response.ok,
          data: data,
          error: !response.ok ? data.error : undefined,
          details: data
        }
      }));

      if (response.ok) {
        toast.success('Test function working!');
      } else {
        toast.error(`Test function failed: ${data.error}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        testFunction: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      }));
      toast.error('Test function failed');
    } finally {
      setIsTesting(false);
    }
  };

  const testLiveFunction = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/functions/v1/get-live-wiki-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'town',
          entity_name: 'Garvia'
        }),
      });

      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        liveFunction: {
          success: response.ok,
          data: data,
          error: !response.ok ? data.error : undefined,
          details: data
        }
      }));

      if (response.ok) {
        toast.success('Live function working!');
      } else {
        toast.error(`Live function failed: ${data.error}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        liveFunction: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      }));
      toast.error('Live function failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success?: boolean) => {
    if (success === undefined) return <Badge variant="secondary">Not Tested</Badge>;
    if (success) return <Badge variant="default" className="bg-green-500">Working</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Edge Function Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testBasicFunction} 
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Basic Function
            </Button>
            <Button 
              onClick={testLiveFunction} 
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Live Function
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Test Function</h3>
                  {getStatusIcon(results.testFunction?.success)}
                </div>
                {getStatusBadge(results.testFunction?.success)}
              </CardHeader>
              <CardContent>
                {results.testFunction && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.testFunction.details, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Live Function</h3>
                  {getStatusIcon(results.liveFunction?.success)}
                </div>
                {getStatusBadge(results.liveFunction?.success)}
              </CardHeader>
              <CardContent>
                {results.liveFunction && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(results.liveFunction.details, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionTest; 