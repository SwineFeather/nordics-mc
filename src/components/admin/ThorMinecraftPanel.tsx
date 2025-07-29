import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useMinecraftWebSocket } from '@/hooks/useMinecraftWebSocket';
import { ThorMinecraftService } from '@/services/thorMinecraftService';
import { Bot, MessageCircle, Settings, TestTube } from 'lucide-react';
import { AIKnowledgeService } from '@/services/aiKnowledgeService';
import { supabase } from '@/integrations/supabase/client';

export default function ThorMinecraftPanel() {
  const { sendThorResponse, isConnected } = useMinecraftWebSocket();
  const [testMessage, setTestMessage] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [config, setConfig] = useState(ThorMinecraftService.getInstance().getConfig());
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTestResponse = async () => {
    if (!testMessage.trim()) return;
    
    setIsProcessing(true);
    try {
      await sendThorResponse(testMessage);
      setTestMessage('');
    } catch (error) {
      console.error('Failed to send test response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfigUpdate = (key: keyof typeof config, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    ThorMinecraftService.getInstance().updateConfig(newConfig);
  };

  const handleTestSupabaseBuckets = async () => {
    setIsTesting(true);
    setTestResult('');
    try {
      // Fully recursive function to list all files and folders in a bucket (Supabase: folders have !file.metadata)
      const listAllFilesAndFolders = async (bucket: string, path: string = '', indent: string = ''): Promise<string> => {
        const { data: files, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
        if (error) return `${indent}Error listing ${bucket}/${path}: ${error.message || error}\n`;
        if (!files || files.length === 0) return '';
        let output = '';
        for (const file of files) {
          const fullPath = path ? `${path}/${file.name}` : file.name;
          if (!file.metadata) { // This is a folder!
            output += `${indent}[Folder] ${fullPath}/\n`;
            output += await listAllFilesAndFolders(bucket, fullPath, indent + '  ');
          } else {
            output += `${indent}- ${fullPath}\n`;
          }
        }
        return output;
      };

      const aiDocsTree = await listAllFilesAndFolders('ai-docs', '');
      const wikiDocsTree = await listAllFilesAndFolders('wiki', '');
      setTestResult(
        'AI Docs:\n' + (aiDocsTree || 'No files found.') +
        '\n\nWiki Docs:\n' + (wikiDocsTree || 'No files found.')
      );
    } catch (err: any) {
      setTestResult('Error: ' + (err?.message || err?.toString() || 'Unknown error'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Thor Minecraft Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsePrefix">Response Prefix</Label>
              <Input
                id="responsePrefix"
                value={config.responsePrefix}
                onChange={(e) => handleConfigUpdate('responsePrefix', e.target.value)}
                placeholder="⚡ Thor: "
              />
            </div>
            
            <div>
              <Label htmlFor="maxLength">Max Response Length</Label>
              <Input
                id="maxLength"
                type="number"
                value={config.maxResponseLength}
                onChange={(e) => handleConfigUpdate('maxResponseLength', parseInt(e.target.value))}
                placeholder="200"
              />
            </div>
          </div>

          <div>
            <Label>Trigger Phrases</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.triggerWords.map((word, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Thor Response
          </h3>
          
          <div className="flex gap-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message to send as Thor..."
              className="flex-1"
            />
            <Button 
              onClick={handleTestResponse}
              disabled={!isConnected || isProcessing || !testMessage.trim()}
              className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isProcessing ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setTestMessage('Hey Thor, what towns are available?')}
              size="sm"
            >
              Load Test Question
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleTestSupabaseBuckets}
              disabled={isTesting}
              size="sm"
            >
              {isTesting ? 'Testing...' : 'Test Supabase Buckets'}
            </Button>
          </div>
          {testResult && (
            <div className="bg-muted/50 rounded p-2 text-xs whitespace-pre-wrap mt-2">
              {testResult}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            How it works
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Players in Minecraft can say "Hey Thor" followed by their question</li>
            <li>• Thor will automatically respond with AI-generated answers</li>
            <li>• Responses are limited to {config.maxResponseLength} characters for Minecraft chat</li>
            <li>• Thor has access to all Nordics database data and AI documents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 