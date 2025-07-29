
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModerationItem {
  id: string;
  content_type: string;
  content_id: string;
  report_count: number;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: number;
  created_at: string;
  last_reported_at: string;
}

export const ModerationPanel = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  const loadModerationQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('last_reported_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId: string, status: 'pending' | 'investigating' | 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status } : item
      ));

      toast.success(`Item marked as ${status}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const handleApprove = async (itemId: string) => {
    await updateItemStatus(itemId, 'resolved');
  };

  const handleReject = async (itemId: string) => {
    await updateItemStatus(itemId, 'dismissed');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'destructive';
      case 2: return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'investigating': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  useEffect(() => {
    loadModerationQueue();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Moderation Panel</h2>
          <p className="text-muted-foreground">Review reported content and manage community safety</p>
        </div>
        <Button onClick={loadModerationQueue} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {item.content_type} Report #{item.id.slice(-6)}
                  </CardTitle>
                  <CardDescription>
                    Content ID: {item.content_id} • Reports: {item.report_count}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(item.priority)}>
                    Priority {item.priority}
                  </Badge>
                  <Badge variant="outline">
                    {item.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Last reported: {new Date(item.last_reported_at).toLocaleString()}
              </div>
              
              {item.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(item.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(item.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateItemStatus(item.id, 'investigating')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Investigate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items in the moderation queue</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
