import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Map, 
  Copy, 
  CheckCircle,
  ExternalLink,
  Download,
  Globe
} from 'lucide-react';
import { NationImageService } from '@/services/nationImageService';
import { UrlTransformService } from '@/services/urlTransformService';

const BlueMapConfig: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const nationUrlTemplate = NationImageService.getBlueMapUrlTemplate();
  const townUrlTemplate = UrlTransformService.getBlueMapUrlTemplate('town');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateBlueMapConfig = () => {
    return `# BlueMap Nation/Town Image Configuration

# Nation Images
# Replace %nation% with the actual nation name
nation_images:
  - url: "${nationUrlTemplate}"
    placeholder: "%nation%"

# Town Images  
# Replace %town% with the actual town name
town_images:
  - url: "${townUrlTemplate}"
    placeholder: "%town%"

# Example usage:
# For nation "Aqua Union" -> ${nationUrlTemplate.replace('%nation%', 'aqua_union')}
# For town "TestTown" -> ${townUrlTemplate.replace('%town%', 'testtown')}

# Note: Images are automatically stored on our server when nation leaders upload them
# BlueMap will find the images at these predictable URLs`;
  };

  const downloadConfig = () => {
    const config = generateBlueMapConfig();
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bluemap-image-config.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          BlueMap Image Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure BlueMap to use your nation and town images with predictable URLs
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nation Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nation Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">URL Template</Label>
                <div className="flex gap-2">
                  <Input
                    value={nationUrlTemplate}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(nationUrlTemplate, 'nation')}
                  >
                    {copied === 'nation' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Placeholder</Label>
                <Badge variant="secondary" className="font-mono">%nation%</Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Example</Label>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {nationUrlTemplate.replace('%nation%', 'aqua_union')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Town Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-4 w-4" />
                Town Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">URL Template</Label>
                <div className="flex gap-2">
                  <Input
                    value={townUrlTemplate}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(townUrlTemplate, 'town')}
                  >
                    {copied === 'town' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Placeholder</Label>
                <Badge variant="secondary" className="font-mono">%town%</Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Example</Label>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {townUrlTemplate.replace('%town%', 'testtown')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Complete Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Complete BlueMap Configuration</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generateBlueMapConfig(), 'config')}
                className="flex items-center gap-2"
              >
                {copied === 'config' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Config
              </Button>
              <Button
                onClick={downloadConfig}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Config
              </Button>
            </div>
          </div>

          <Textarea
            value={generateBlueMapConfig()}
            readOnly
            className="font-mono text-xs h-64"
          />
        </div>

        <Separator />

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How to Use</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">For Nation Leaders:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Upload your nation image using Discord/Imgur</li>
                <li>Paste the link in the nation image upload dialog</li>
                <li>The image will be stored on our server</li>
                <li>BlueMap will automatically find it at the predictable URL</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">For BlueMap Setup:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy the configuration above</li>
                <li>Add it to your BlueMap config file</li>
                <li>Replace %nation% and %town% with actual names</li>
                <li>Restart BlueMap to apply changes</li>
              </ol>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
              💡 Pro Tip
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The image URLs are predictable and follow the pattern: 
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded mx-1">
                your-domain.com/images/nations/nation_name.png
              </code>
              This allows BlueMap to automatically find images for any nation or town!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlueMapConfig; 