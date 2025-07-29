import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  AlertTriangle, 
  Flag, 
  Clock, 
  CheckCircle, 
  XCircle,
  Ban,
  Lock,
  Pin,
  Star,
  UserX,
  VolumeX
} from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ModerationPanelProps {
  className?: string;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    moderationQueue, 
    reports, 
    loading, 
    takeModerationAction, 
    updateModerationQueue, 
    resolveReport 
  } = useModeration();
  
  const [selectedQueueItem, setSelectedQueueItem] = useState<ModerationQueueItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);

  // Check if user is moderator - we need to check the profile, not the user object
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const checkModeratorStatus = async () => {
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('is_moderator, is_admin')
            .eq('id', user.id)
            .single();
          setUserProfile(data);
        } catch (error) {
          console.error('Error checking moderator status:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoadingProfile(false);
    };
    checkModeratorStatus();
  }, [user]);

  // Show loading while checking moderator status
  if (loadingProfile) {
    return null;
  }

  // Check if user is moderator
  if (!userProfile?.is_moderator && !userProfile?.is_admin) {
    return null;
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-500 text-white';
      case 2: return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleModerationAction = async (
    actionType: string,
    targetUserId?: string,
    targetPostId?: string,
    targetReplyId?: string,
    reason?: string
  ) => {
    try {
      await takeModerationAction(actionType, targetUserId, targetPostId, targetReplyId, reason);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error taking moderation action:', error);
    }
  };

  const handleQueueAction = async (item: ModerationQueueItem, action: string) => {
    try {
      if (user?.id) {
        await updateModerationQueue(item.id, action, user.id);
        setSelectedQueueItem(null);
      }
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  };

  const handleReportAction = async (report: ContentReport, action: string, notes?: string) => {
    try {
      await resolveReport(report.id, action, notes);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const renderModerationQueue = () => (
    <div className="space-y-4">
      {moderationQueue.map((item) => (
        <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={getPriorityColor(item.priority)}>
                  Priority {item.priority}
                </Badge>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {item.content_type} • {item.report_count} reports
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQueueItem(item)}
              >
                Review
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              First reported {formatDistanceToNow(new Date(item.first_reported_at), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {moderationQueue.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items in moderation queue
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(report.report_status)}>
                  {report.report_status}
                </Badge>
                <span className="text-sm font-medium">{report.report_type}</span>
                {report.reporter && (
                  <span className="text-sm text-muted-foreground">
                    by {report.reporter.full_name || report.reporter.email}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(report)}
              >
                Review
              </Button>
            </div>
            <div className="mt-2 text-sm">
              <div className="font-medium">Reason:</div>
              <div className="text-muted-foreground">{report.reason}</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {reports.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No reports to review
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderation Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="queue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Queue ({moderationQueue.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Reports ({reports.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="queue" className="mt-4">
              {loading ? (
                <div className="text-center py-8">Loading moderation queue...</div>
              ) : (
                renderModerationQueue()
              )}
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              {loading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : (
                renderReports()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Queue Item Review Modal */}
      {selectedQueueItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Review Queue Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Content Type:</strong> {selectedQueueItem.content_type}
              </div>
              <div>
                <strong>Report Count:</strong> {selectedQueueItem.report_count}
              </div>
              <div>
                <strong>Priority:</strong> {selectedQueueItem.priority}
              </div>
              <div>
                <strong>Status:</strong> {selectedQueueItem.status}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleQueueAction(selectedQueueItem, 'investigating')}
                  variant="outline"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Investigate
                </Button>
                <Button
                  onClick={() => handleQueueAction(selectedQueueItem, 'resolved')}
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
                <Button
                  onClick={() => handleQueueAction(selectedQueueItem, 'dismissed')}
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => setSelectedQueueItem(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Review Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Type:</strong> {selectedReport.report_type}
              </div>
              <div>
                <strong>Status:</strong> {selectedReport.report_status}
              </div>
              <div>
                <strong>Reason:</strong> {selectedReport.reason}
              </div>
              {selectedReport.evidence && (
                <div>
                  <strong>Evidence:</strong> {selectedReport.evidence}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReportAction(selectedReport, 'resolved')}
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
                <Button
                  onClick={() => handleReportAction(selectedReport, 'dismissed')}
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => setSelectedReport(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 