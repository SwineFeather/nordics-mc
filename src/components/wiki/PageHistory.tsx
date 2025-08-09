import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  RotateCcw, 
  Eye, 
  User, 
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface PageRevision {
  id: string;
  page_id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'published';
  author_id: string;
  revision_number: number;
  created_at: string;
  comment?: string;
  is_current: boolean;
  author_name?: string;
}

interface PageHistoryProps {
  pageId: string; // May be a UUID or a storage path
  pageTitle: string;
  pageSlug?: string; // Fallback identifier to resolve DB page ID
  onRevisionRestored?: () => void;
}

const PageHistory: React.FC<PageHistoryProps> = ({ 
  pageId, 
  pageTitle, 
  pageSlug,
  onRevisionRestored 
}) => {
  const [revisions, setRevisions] = useState<PageRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<PageRevision | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadRevisions();
  }, [pageId]);

  const loadRevisions = async () => {
    try {
      setLoading(true);

      // Resolve DB page UUID if needed
      let dbPageId = pageId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(dbPageId)) {
        // Try to resolve via slug first
        if (pageSlug) {
          const { data: pageRow, error: pageErr } = await supabase
            .from('wiki_pages')
            .select('id')
            .eq('slug', pageSlug)
            .single();
          if (!pageErr && pageRow?.id) {
            dbPageId = pageRow.id as string;
          }
        }

        // If still not a UUID, try deriving slug from path and lookup
        if (!uuidRegex.test(dbPageId)) {
          const derivedSlug = pageId.split('/').pop()?.replace(/\.md$/, '') || '';
          if (derivedSlug) {
            const { data: pageRow2 } = await supabase
              .from('wiki_pages')
              .select('id')
              .eq('slug', derivedSlug)
              .maybeSingle();
            if (pageRow2?.id) {
              dbPageId = pageRow2.id as string;
            }
          }
        }
      }

      const { data, error } = await supabase
        .from('page_revisions')
        .select(`
          *,
          profiles:author_id (
            full_name,
            email
          )
        `)
        .eq('page_id', dbPageId)
        .order('revision_number', { ascending: false });

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116') {
          // Table doesn't exist or no data
          console.log('No revisions found for this page');
          setRevisions([]);
          return;
        }
        if (error.code === '406' || error.message?.includes('Not Acceptable')) {
          console.log('Permission denied accessing revisions');
          setRevisions([]);
          return;
        }
        throw error;
      }

      const revisionsWithAuthor = (data || []).map((revision: any) => ({
        ...revision,
        author_name: revision.profiles?.full_name || revision.profiles?.email || 'Unknown'
      }));

      setRevisions(revisionsWithAuthor);
    } catch (error) {
      console.error('Failed to load revisions:', error);
      // Don't show error toast for expected cases like missing table
      if (error instanceof Error && !error.message.includes('relation "page_revisions" does not exist')) {
        toast.error('Failed to load page history');
      }
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (revision: PageRevision) => {
    if (!confirm(`Are you sure you want to restore this page to revision ${revision.revision_number}? This will create a new revision.`)) {
      return;
    }

    try {
      setRestoring(true);
      
      const { error } = await (supabase.rpc as any)('restore_page_revision', {
        p_revision_id: revision.id
      });

      if (error) throw error;

      toast.success(`Page restored to revision ${revision.revision_number}`);
      onRevisionRestored?.();
      loadRevisions(); // Reload to get the new revision
    } catch (error) {
      console.error('Failed to restore revision:', error);
      toast.error('Failed to restore revision');
    } finally {
      setRestoring(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'review':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      review: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      published: 'bg-green-500/20 text-green-700 border-green-500/30'
    };

    return (
      <Badge className={`${statusConfig[status as keyof typeof statusConfig]} flex items-center space-x-1`}>
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading page history...</p>
        </div>
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Page History</h3>
          <p className="text-muted-foreground">
            This page doesn't have any revision history yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            <History className="w-6 h-6" />
            <span>Page History</span>
          </h2>
          <p className="text-muted-foreground mt-1">{pageTitle}</p>
        </div>
        <Badge variant="outline">{revisions.length} revisions</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revision List */}
        <Card>
          <CardHeader>
            <CardTitle>Revision History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRevision?.id === revision.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRevision(revision)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{revision.revision_number}</Badge>
                        {revision.is_current && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      {getStatusBadge(revision.status)}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{revision.title}</h4>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{revision.author_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(revision.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {revision.comment && (
                      <div className="flex items-start space-x-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{revision.comment}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Revision Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revision Preview</span>
              {selectedRevision && !selectedRevision.is_current && (
                <Button
                  size="sm"
                  onClick={() => handleRestore(selectedRevision)}
                  disabled={restoring}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRevision ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{selectedRevision.title}</h3>
                  {getStatusBadge(selectedRevision.status)}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedRevision.author_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedRevision.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                {selectedRevision.comment && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Revision Comment</p>
                        <p className="text-sm text-muted-foreground">{selectedRevision.comment}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Content Preview</h4>
                  <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto">
                    <MarkdownRenderer content={selectedRevision.content} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a revision to preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageHistory; 