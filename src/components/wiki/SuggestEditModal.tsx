import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitPullRequest, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  Clock
} from 'lucide-react';
import { WikiPage } from '@/types/wiki';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface SuggestEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: WikiPage;
}

const SuggestEditModal = ({ open, onOpenChange, page }: SuggestEditModalProps) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to suggest edits');
        return;
      }

      const { error } = await supabase
        .from('suggested_edits')
        .insert({
          page_id: page.id,
          title: title.trim(),
          content: content.trim(),
          author_id: user.id
        });

      if (error) throw error;

      toast.success('✅ Edit suggestion submitted successfully!');
      onOpenChange(false);
      
      // Reset form
      setTitle(page.title);
      setContent(page.content);
    } catch (error) {
      console.error('Error submitting edit suggestion:', error);
      toast.error(`❌ Failed to submit edit suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = title !== page.title || content !== page.content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5" />
            <span>Suggest Edit - {page.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    How Suggested Edits Work
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p>• Your suggested changes will be reviewed by moderators</p>
                    <p>• If approved, the changes will be applied to the page</p>
                    <p>• You'll be notified of the review outcome</p>
                    <p>• This helps maintain quality while allowing community contributions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current vs Suggested */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Version */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Current Version</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground mt-1">{page.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Content Preview</Label>
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg max-h-40 overflow-y-auto">
                    <MarkdownRenderer 
                      content={page.content.substring(0, 300) + (page.content.length > 300 ? '...' : '')} 
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitPullRequest className="w-5 h-5 text-blue-600" />
                  <span>Your Suggested Changes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="suggested-title">Title</Label>
                  <Input
                    id="suggested-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                    placeholder="Enter suggested title..."
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="suggested-content">Content</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                  </div>
                  
                  {showPreview ? (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg max-h-40 overflow-y-auto">
                      <MarkdownRenderer 
                        content={content} 
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <Textarea
                      id="suggested-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-1 min-h-[200px] font-mono text-sm"
                      placeholder="Enter your suggested content changes..."
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-4">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Changes Summary
                </h4>
                <div className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
                  {title !== page.title && (
                    <p>• Title changed from "{page.title}" to "{title}"</p>
                  )}
                  {content !== page.content && (
                    <p>• Content modified ({Math.abs(content.length - page.content.length)} characters difference)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestEditModal; 