import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServerIPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServerIPModal: React.FC<ServerIPModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const handleCopyIP = () => {
    navigator.clipboard.writeText('nordics.world');
    toast({
      title: "IP Copied!",
      description: "Server IP has been copied to your clipboard",
    });
  };

  const handleCopyButtonClick = async () => {
    try {
      await navigator.clipboard.writeText('nordics.world');
      toast({
        title: "Copied!",
        description: "Server IP copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const handleJoinDiscord = () => {
    window.open('https://discord.gg/JXSVG367ux', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Join Nordics Minecraft
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Server IP Section */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Server IP</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                  nordics.world
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyButtonClick}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Version Compatibility</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-green-500 hover:bg-green-600">
                  Works best on 1.21.1
                </Badge>
                <Badge variant="outline">
                  Compatible with any version
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleJoinDiscord}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Our Discord
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="text-center">
              <strong>How to join:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Copy the server IP above</li>
              <li>Open Minecraft and go to Multiplayer</li>
              <li>Click "Add Server" and paste the IP</li>
              <li>Click "Join Server" and start playing!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServerIPModal; 