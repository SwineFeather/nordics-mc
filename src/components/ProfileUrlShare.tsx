
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileUrlShareProps {
  playerName: string;
  className?: string;
}

const ProfileUrlShare = ({ playerName, className }: ProfileUrlShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const profileUrl = `${window.location.origin}/community?player=${encodeURIComponent(playerName)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Profile URL copied!",
        description: "You can now share your profile link with others.",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const openProfile = () => {
    window.open(profileUrl, '_blank');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          Share Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Your Profile URL</label>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-xs flex-1 truncate">{profileUrl}</code>
            <Badge variant="secondary" className="text-xs">Public</Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={copyToClipboard}
            size="sm"
            className="flex-1"
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          
          <Button 
            onClick={openProfile}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Anyone with this link can view your public profile and stats.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfileUrlShare;
