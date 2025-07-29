import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostSharingProps {
  postId: string;
  postTitle: string;
  postUrl?: string;
}

const PostSharing = ({ postId, postTitle, postUrl }: PostSharingProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate the full URL if not provided
  const fullUrl = postUrl || `${window.location.origin}/forum/post/${postId}`;
  const encodedTitle = encodeURIComponent(postTitle);
  const encodedUrl = encodeURIComponent(fullUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(`Check out this forum post: ${postTitle}`);
    const body = encodeURIComponent(`I thought you might be interested in this forum post:\n\n${postTitle}\n\n${fullUrl}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Link</label>
            <div className="flex space-x-2">
              <Input
                value={fullUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share to Social Media</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('twitter')}
                className="flex items-center space-x-2"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('facebook')}
                className="flex items-center space-x-2"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center space-x-2"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Email Share */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={shareToEmail}
              className="w-full flex items-center space-x-2"
            >
              <Link className="w-4 h-4" />
              <span>Share via Email</span>
            </Button>
          </div>

          {/* QR Code (Future Enhancement) */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Tip: You can also right-click the post title and select "Copy link address"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSharing; 