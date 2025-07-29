import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare,
  Eye,
  Diff,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface SuggestedEdit {
  id: string;
  page_id: string;
  page_title: string;
  page_slug: string;
  suggested_title: string;
  suggested_content: string;
  suggested_by: string;
  suggested_by_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface SuggestedEditsReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
}

const SuggestedEditsReviewModal = ({ 
  open, 
  onOpenChange, 
  userRole 
}: SuggestedEditsReviewModalProps) => {
  const [suggestions, setSuggestions] = useState<SuggestedEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedEdit | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const canReview = ['admin', 'moderator'].includes(userRole);

  useEffect(() => {
    if (open && canReview) {
      loadSuggestions();
    }
  }, [open, canReview]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('suggested_edits')
        .select(`
          *,
          wiki_pages!inner(title, slug)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSuggestions = data?.map(suggestion => ({
        id: suggestion.id,
        page_id: suggestion.page_id,
        page_title: suggestion.wiki_pages.title,
        page_slug: suggestion.wiki_pages.slug,
        suggested_title: suggestion.suggested_title,
        suggested_content: suggestion.suggested_content,
        suggested_by: suggestion.suggested_by,
        suggested_by_name: suggestion.suggested_by_name,
        reason: suggestion.reason,
        status: suggestion.status,
        created_at: suggestion.created_at,
        reviewed_by: suggestion.reviewed_by,
        reviewed_at: suggestion.reviewed_at,
        review_notes: suggestion.review_notes
      })) || [];

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggested edits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (suggestionId: string, status: 'approved' | 'rejected') => {
    if (!selectedSuggestion) return;

    setIsReviewing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to review suggestions');

      // Update suggestion status
      const { error: updateError } = await supabase
        .from('suggested_edits')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes.trim() || null
        })
        .eq('id', suggestionId);

      if (updateError) throw updateError;

      // If approved, apply the changes to the wiki page
      if (status === 'approved') {
        const { error: pageUpdateError } = await supabase
          .from('wiki_pages')
          .update({
            title: selectedSuggestion.suggested_title,
            content: selectedSuggestion.suggested_content,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedSuggestion.page_id);

        if (pageUpdateError) throw pageUpdateError;
      }

      toast({
        title: "Success",
        description: `Suggestion ${status} successfully`,
      });

      // Reload suggestions and close modal
      await loadSuggestions();
      setSelectedSuggestion(null);
      setReviewNotes('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error reviewing suggestion:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!canReview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <span>You don't have permission to review suggested edits.</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Review Suggested Edits</span>
            {suggestions.length > 0 && (
              <Badge variant="secondary">{suggestions.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full space-x-4">
          {/* Suggestions List */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-[70vh]">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading suggestions...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No pending suggestions
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedSuggestion?.id === suggestion.id ? 'bg-accent/50 border-primary' : ''
                      }`}
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getStatusIcon(suggestion.status)}
                              <span className="text-sm font-medium truncate">
                                {suggestion.page_title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              Suggested by {suggestion.suggested_by_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(suggestion.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(suggestion.status)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Suggestion Details */}
          <div className="flex-1">
            {selectedSuggestion ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedSuggestion.page_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Suggested by {selectedSuggestion.suggested_by_name} on{' '}
                      {new Date(selectedSuggestion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedSuggestion.status)}
                </div>

                <Separator />

                {/* Reason */}
                <div>
                  <Label className="text-sm font-medium">Reason for suggestion:</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSuggestion.reason || 'No reason provided'}
                  </p>
                </div>

                {/* Changes Preview */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Current Version */}
                  <div>
                    <Label className="text-sm font-medium">Current Version</Label>
                    <Card className="mt-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{selectedSuggestion.page_title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="h-48">
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={selectedSuggestion.suggested_content} />
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Suggested Version */}
                  <div>
                    <Label className="text-sm font-medium">Suggested Changes</Label>
                    <Card className="mt-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{selectedSuggestion.suggested_title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="h-48">
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={selectedSuggestion.suggested_content} />
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <Label htmlFor="review-notes" className="text-sm font-medium">
                    Review Notes (optional)
                  </Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSuggestion(null);
                      setReviewNotes('');
                    }}
                    disabled={isReviewing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview(selectedSuggestion.id, 'rejected')}
                    disabled={isReviewing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleReview(selectedSuggestion.id, 'approved')}
                    disabled={isReviewing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a suggestion to review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestedEditsReviewModal; 