import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccountManagement } from '@/hooks/useAccountManagement';

const TestUsernameCheck = () => {
  const [testUsername, setTestUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { checkUsernameAvailability } = useAccountManagement();

  const handleTest = async () => {
    if (!testUsername.trim()) return;
    
    setLoading(true);
    try {
      const result = await checkUsernameAvailability(testUsername);
      setResult(result);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Username Conflict Checking</CardTitle>
          <CardDescription>
            Test the username conflict checking function directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              placeholder="Enter username to test"
              className="flex-1"
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test'}
            </Button>
          </div>
          
          {result && (
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.error ? (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800">
                  <strong>Error:</strong> {result.error}
                </div>
              ) : (
                <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-800">
                  <strong>Status:</strong> {result.available ? 'Available' : 'Not Available'}<br/>
                  <strong>Message:</strong> {result.message}<br/>
                  <strong>Conflict Type:</strong> {result.conflictType || 'None'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestUsernameCheck;
