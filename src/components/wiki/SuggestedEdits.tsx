import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit3, 
  Check, 
  X, 
  GitMerge, 
  Clock, 
  User, 
  MessageSquare,
  Diff,
  Eye,
  AlertTriangle,
  CheckCircle,
  Ban
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { WikiSuggestedEdit, UserRole } from '@/types/wiki';
import { wikiCollaborationService } from '@/services/wikiCollaborationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SuggestedEditsProps {
  pageId: string;
  userRole: UserRole;
  currentContent: string;
  currentTitle: string;
  onApplyEdit: (title: string, content: string) => Promise<void>;
}

interface SuggestedEditItemProps {
  edit: WikiSuggestedEdit;
  userRole: UserRole;
  currentContent: string;
  currentTitle: string;
  onReview: (editId: string, status: 'approved' | 'rejected' | 'merged', notes?: string) => Promise<void>;
  onApplyEdit: (title: string, content: string) => Promise<void>;
}

const SuggestedEditItem: React.FC<SuggestedEditItemProps> = ({
  edit,
  userRole,
  currentContent,
  currentTitle,
  onReview,
  onApplyEdit
}) => {
  const { user } = useAuth();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReview = userRole === 'admin' || userRole === 'moderator';
  const isAuthor = user?.id === edit.authorId;

  const getStatusBadge = () => {
    switch (edit.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'merged':
        return <Badge variant="outline"><GitMerge className="w-3 h-3 mr-1" />Merged</Badge>;
      default:
        return null;
    }
  };

  const handleReview = async (status: 'approved' | 'rejected' | 'merged') => {
    if (!reviewNotes.trim() && status === 'rejected') {
      toast.error('Please provide review notes when rejecting an edit');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReview(edit.id, status, reviewNotes.trim() || undefined);
      setShowReviewDialog(false);
      setReviewNotes('');
      toast.success(`Edit ${status}`);
    } catch (error) {
      console.error('Failed to review edit:', error);
      toast.error('Failed to review edit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyEdit = async () => {
    try {
      await onApplyEdit(edit.title, edit.content);
      await onReview(edit.id, 'merged');
      toast.success('Edit applied and merged');
    } catch (error) {
      console.error('Failed to apply edit:', error);
      toast.error('Failed to apply edit');
    }
  };

  const renderDiff = () => {
    // Simple diff implementation - in a real app you'd use a proper diff library
    const titleChanged = edit.title !== currentTitle;
    const contentChanged = edit.content !== currentContent;

    return (
      <div className="space-y-4">
        {titleChanged && (
          <div>
            <h4 className="font-medium mb-2">Title Changes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Current</div>
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                  {currentTitle}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Proposed</div>
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  {edit.title}
                </div>
              </div>
            </div>
          </div>
        )}

        {contentChanged && (
          <div>
            <h4 className="font-medium mb-2">Content Changes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Current</div>
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{currentContent}</pre>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Proposed</div>
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{edit.content}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn(
      "border",
      edit.status === 'pending' && "border-yellow-200 bg-yellow-50/30",
      edit.status === 'approved' && "border-green-200 bg-green-50/30",
      edit.status === 'rejected' && "border-red-200 bg-red-50/30",
      edit.status === 'merged' && "border-blue-200 bg-blue-50/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${edit.authorName}`} />
              <AvatarFallback>{edit.authorName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{edit.authorName}</span>
                {getStatusBadge()}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(edit.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Diff className="w-4 h-4 mr-2" />
                  View Changes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Suggested Edit Changes</DialogTitle>
                </DialogHeader>
                {renderDiff()}
              </DialogContent>
            </Dialog>

            {canReview && edit.status === 'pending' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowReviewDialog(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleApplyEdit}>
                    <GitMerge className="w-4 h-4 mr-2" />
                    Apply & Merge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Proposed Title</h4>
            <p className="text-sm bg-muted/30 p-2 rounded">{edit.title}</p>
          </div>

          {edit.description && (
            <div>
              <h4 className="font-medium text-sm mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{edit.description}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm mb-1">Proposed Content</h4>
            <div className="bg-muted/30 p-3 rounded max-h-32 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{edit.content}</pre>
            </div>
          </div>

          {edit.reviewNotes && (
            <div>
              <h4 className="font-medium text-sm mb-1">Review Notes</h4>
              <p className="text-sm text-muted-foreground">{edit.reviewNotes}</p>
            </div>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Suggested Edit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Review Notes (optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide feedback or notes about this edit..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview('rejected')}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={isSubmitting}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const SuggestedEdits: React.FC<SuggestedEditsProps> = ({
  pageId,
  userRole,
  currentContent,
  currentTitle,
  onApplyEdit
}) => {
  const { user } = useAuth();
  const [suggestedEdits, setSuggestedEdits] = useState<WikiSuggestedEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newEdit, setNewEdit] = useState({
    title: currentTitle,
    content: currentContent,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSuggestedEdits = async () => {
    try {
      setLoading(true);
      const data = await wikiCollaborationService.getSuggestedEdits(pageId);
      setSuggestedEdits(data);
    } catch (error) {
      console.error('Failed to load suggested edits:', error);
      toast.error('Failed to load suggested edits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestedEdits();
  }, [pageId]);

  const handleSubmitEdit = async () => {
    if (!newEdit.title.trim() || !newEdit.content.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await wikiCollaborationService.submitSuggestedEdit(
        pageId,
        newEdit.title.trim(),
        newEdit.content.trim(),
        newEdit.description.trim() || undefined
      );
      setShowSubmitDialog(false);
      setNewEdit({ title: currentTitle, content: currentContent, description: '' });
      loadSuggestedEdits();
      toast.success('Suggested edit submitted for review');
    } catch (error) {
      console.error('Failed to submit edit:', error);
      toast.error('Failed to submit suggested edit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewEdit = async (editId: string, status: 'approved' | 'rejected' | 'merged', notes?: string) => {
    try {
      await wikiCollaborationService.reviewSuggestedEdit(editId, status, notes);
      loadSuggestedEdits();
    } catch (error) {
      console.error('Failed to review edit:', error);
      throw error;
    }
  };

  const pendingEdits = suggestedEdits.filter(edit => edit.status === 'pending');
  const reviewedEdits = suggestedEdits.filter(edit => edit.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>Suggested Edits ({suggestedEdits.length})</span>
          </CardTitle>
          
          {user && (
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Suggest Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Suggested Edit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={newEdit.title}
                      onChange={(e) => setNewEdit(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Page title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={newEdit.content}
                      onChange={(e) => setNewEdit(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Page content in markdown..."
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description (optional)</label>
                    <Textarea
                      value={newEdit.description}
                      onChange={(e) => setNewEdit(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Explain what changes you're suggesting and why..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSubmitDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitEdit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Edit'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading suggested edits...</p>
          </div>
        ) : suggestedEdits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No suggested edits yet.</p>
            {user && <p className="text-sm">Be the first to suggest an improvement!</p>}
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending ({pendingEdits.length})
              </TabsTrigger>
              <TabsTrigger value="reviewed">
                Reviewed ({reviewedEdits.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingEdits.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>No pending edits</p>
                </div>
              ) : (
                pendingEdits.map((edit) => (
                  <SuggestedEditItem
                    key={edit.id}
                    edit={edit}
                    userRole={userRole}
                    currentContent={currentContent}
                    currentTitle={currentTitle}
                    onReview={handleReviewEdit}
                    onApplyEdit={onApplyEdit}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="reviewed" className="space-y-4 mt-4">
              {reviewedEdits.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>No reviewed edits</p>
                </div>
              ) : (
                reviewedEdits.map((edit) => (
                  <SuggestedEditItem
                    key={edit.id}
                    edit={edit}
                    userRole={userRole}
                    currentContent={currentContent}
                    currentTitle={currentTitle}
                    onReview={handleReviewEdit}
                    onApplyEdit={onApplyEdit}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestedEdits; 