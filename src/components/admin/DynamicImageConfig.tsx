import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Image, 
  Globe, 
  TestTube, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { DynamicImageService } from '@/services/dynamicImageService';

interface DynamicImageConfig {
  baseUrl: string;
  placeholder: string;
  fallbackUrl?: string;
  enabled: boolean;
}

interface DynamicImageConfigProps {
  onSave?: (config: { nations: DynamicImageConfig; towns: DynamicImageConfig }) => void;
}

const DynamicImageConfig: React.FC<DynamicImageConfigProps> = ({ onSave }) => {
  const [nationsConfig, setNationsConfig] = useState<DynamicImageConfig>({
    baseUrl: 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/nations/',
    placeholder: '%nation%',
    fallbackUrl: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Nation+Image',
    enabled: true
  });

  const [townsConfig, setTownsConfig] = useState<DynamicImageConfig>({
    baseUrl: 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/towns/',
    placeholder: '%town%',
    fallbackUrl: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Town+Image',
    enabled: true
  });

  const [testNation, setTestNation] = useState('Aqua_Union');
  const [testTown, setTestTown] = useState('TestTown');
  const [testResults, setTestResults] = useState<{
    nations: { url: string; exists: boolean; loading: boolean };
    towns: { url: string; exists: boolean; loading: boolean };
  }>({
    nations: { url: '', exists: false, loading: false },
    towns: { url: '', exists: false, loading: false }
  });

  const generateTestUrl = (type: 'nations' | 'towns', name: string) => {
    const config = type === 'nations' ? nationsConfig : townsConfig;
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
    return config.baseUrl.replace(config.placeholder, cleanName) + '?raw=true';
  };

  const testImageUrl = async (type: 'nations' | 'towns') => {
    const name = type === 'nations' ? testNation : testTown;
    const url = generateTestUrl(type, name);
    
    setTestResults(prev => ({
      ...prev,
      [type]: { url, exists: false, loading: true }
    }));

    try {
      const exists = await DynamicImageService.checkImageExists(url);
      setTestResults(prev => ({
        ...prev,
        [type]: { url, exists, loading: false }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [type]: { url, exists: false, loading: false }
      }));
    }
  };

  const handleSave = () => {
    onSave?.({ nations: nationsConfig, towns: townsConfig });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Dynamic Image Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure dynamic image URLs for nations and towns using placeholders like %nation% and %town%
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="nations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nations" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Nations
            </TabsTrigger>
            <TabsTrigger value="towns" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Towns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nations" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="nations-enabled" className="text-sm font-medium">
                Enable Dynamic Nation Images
              </Label>
              <Switch
                id="nations-enabled"
                checked={nationsConfig.enabled}
                onCheckedChange={(enabled) => 
                  setNationsConfig(prev => ({ ...prev, enabled }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nations-base-url">Base URL</Label>
                <Input
                  id="nations-base-url"
                  value={nationsConfig.baseUrl}
                  onChange={(e) => 
                    setNationsConfig(prev => ({ ...prev, baseUrl: e.target.value }))
                  }
                  placeholder="https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/nations/"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nations-placeholder">Placeholder</Label>
                <Input
                  id="nations-placeholder"
                  value={nationsConfig.placeholder}
                  onChange={(e) => 
                    setNationsConfig(prev => ({ ...prev, placeholder: e.target.value }))
                  }
                  placeholder="%nation%"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nations-fallback">Fallback URL (Optional)</Label>
              <Input
                id="nations-fallback"
                value={nationsConfig.fallbackUrl || ''}
                onChange={(e) => 
                  setNationsConfig(prev => ({ ...prev, fallbackUrl: e.target.value }))
                }
                placeholder="https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Nation+Image"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Configuration
              </h4>
              
              <div className="flex gap-2">
                <Input
                  value={testNation}
                  onChange={(e) => setTestNation(e.target.value)}
                  placeholder="Nation name to test"
                  className="flex-1"
                />
                <Button 
                  onClick={() => testImageUrl('nations')}
                  disabled={testResults.nations.loading}
                  variant="outline"
                >
                  {testResults.nations.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {testResults.nations.url && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Generated URL:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {testResults.nations.url}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    {testResults.nations.loading ? (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        Checking...
                      </Badge>
                    ) : testResults.nations.exists ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Image Found
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Image Not Found
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="towns" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="towns-enabled" className="text-sm font-medium">
                Enable Dynamic Town Images
              </Label>
              <Switch
                id="towns-enabled"
                checked={townsConfig.enabled}
                onCheckedChange={(enabled) => 
                  setTownsConfig(prev => ({ ...prev, enabled }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="towns-base-url">Base URL</Label>
                <Input
                  id="towns-base-url"
                  value={townsConfig.baseUrl}
                  onChange={(e) => 
                    setTownsConfig(prev => ({ ...prev, baseUrl: e.target.value }))
                  }
                  placeholder="https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/towns/"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="towns-placeholder">Placeholder</Label>
                <Input
                  id="towns-placeholder"
                  value={townsConfig.placeholder}
                  onChange={(e) => 
                    setTownsConfig(prev => ({ ...prev, placeholder: e.target.value }))
                  }
                  placeholder="%town%"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="towns-fallback">Fallback URL (Optional)</Label>
              <Input
                id="towns-fallback"
                value={townsConfig.fallbackUrl || ''}
                onChange={(e) => 
                  setTownsConfig(prev => ({ ...prev, fallbackUrl: e.target.value }))
                }
                placeholder="https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Town+Image"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Configuration
              </h4>
              
              <div className="flex gap-2">
                <Input
                  value={testTown}
                  onChange={(e) => setTestTown(e.target.value)}
                  placeholder="Town name to test"
                  className="flex-1"
                />
                <Button 
                  onClick={() => testImageUrl('towns')}
                  disabled={testResults.towns.loading}
                  variant="outline"
                >
                  {testResults.towns.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {testResults.towns.url && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Generated URL:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {testResults.towns.url}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    {testResults.towns.loading ? (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        Checking...
                      </Badge>
                    ) : testResults.towns.exists ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Image Found
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Image Not Found
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicImageConfig; 