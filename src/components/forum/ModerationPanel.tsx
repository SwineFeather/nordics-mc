
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye, Check, X, Flag, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModerationQueueItem {
  id: string;
  content_type: string;
  content_id: string;
  report_count: number;
  priority: number;
  status: string;
  created_at: string;
  last_reported_at: string;
}

interface ContentReport {
  id: string;
  reporter_id: string;
  report_type: string;
  reason: string;
  created_at: string;
  report_status: string;
  target_post_id?: string;
  target_reply_id?: string;
  target_user_id?: string;
}

const ModerationPanel = () => {
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      const [queueResponse, reportsResponse] = await Promise.all([
        supabase
          .from('moderation_queue')
          .select('*')
          .order('priority', { ascending: false })
          .order('last_reported_at', { ascending: false }),
        supabase
          .from('content_reports')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (queueResponse.error) throw queueResponse.error;
      if (reportsResponse.error) throw reportsResponse.error;

      setQueueItems(queueResponse.data || []);
      setReports(reportsResponse.data || []);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContent = async (item: ModerationQueueItem) => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ status: 'approved' })
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success('Content approved');
      fetchModerationData();
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handleRejectContent = async (item: ModerationQueueItem) => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ status: 'rejected' })
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success('Content rejected');
      fetchModerationData();
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content');
    }
  };

  const handleResolveReport = async (report: ContentReport) => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ report_status: 'resolved' })
        .eq('id', report.id);

      if (error) throw error;
      
      toast.success('Report resolved');
      fetchModerationData();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'destructive';
      case 2: return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      default: return 'Low';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading moderation panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderation Panel</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {queueItems.filter(item => item.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {reports.filter(report => report.report_status === 'pending').length} Reports
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Moderation Queue
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {queueItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No items in moderation queue</p>
              </CardContent>
            </Card>
          ) : (
            queueItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)} Report
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(item.priority)}>
                        {getPriorityLabel(item.priority)} Priority
                      </Badge>
                      <Badge variant="outline">
                        {item.report_count} Report{item.report_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Content ID: {item.content_id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last reported: {new Date(item.last_reported_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveContent(item)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectContent(item)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No reports to review</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                    </CardTitle>
                    <Badge variant={report.report_status === 'pending' ? 'default' : 'secondary'}>
                      {report.report_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Reason:</strong> {report.reason}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reported: {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    {report.report_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-2" />
                          View Content
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationPanel;
