import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Edit3, 
  AlertTriangle, 
  Bell, 
  Users,
  GitMerge,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { UserRole } from '@/types/wiki';
import Comments from './Comments';
import SuggestedEdits from './SuggestedEdits';
import EditConflictDetection from './EditConflictDetection';
import CollaborationNotifications from './CollaborationNotifications';
import { useWikiCollaboration } from '@/hooks/useWikiCollaboration';

interface CollaborationDashboardProps {
  pageId: string;
  userRole: UserRole;
  currentContent: string;
  currentTitle: string;
  onApplyEdit: (title: string, content: string) => Promise<void>;
  allowComments?: boolean;
}

const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  pageId,
  userRole,
  currentContent,
  currentTitle,
  onApplyEdit,
  allowComments = true
}) => {
  const [activeTab, setActiveTab] = useState('comments');
  const [conflicts, setConflicts] = useState<any[]>([]);
  
  const {
    commentCount,
    suggestedEditCount,
    unreadNotificationCount,
    conflicts: detectedConflicts,
    isCheckingConflicts
  } = useWikiCollaboration(pageId);

  const handleConflictDetected = (newConflicts: any[]) => {
    setConflicts(newConflicts);
  };

  const handleConflictResolved = () => {
    setConflicts([]);
  };

  const getTabBadge = (tab: string) => {
    switch (tab) {
      case 'comments':
        return commentCount > 0 ? commentCount : null;
      case 'suggestions':
        return suggestedEditCount > 0 ? suggestedEditCount : null;
      case 'notifications':
        return unreadNotificationCount > 0 ? unreadNotificationCount : null;
      case 'conflicts':
        return conflicts.length > 0 ? conflicts.length : null;
      default:
        return null;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'comments':
        return <MessageSquare className="w-4 h-4" />;
      case 'suggestions':
        return <Edit3 className="w-4 h-4" />;
      case 'notifications':
        return <Bell className="w-4 h-4" />;
      case 'conflicts':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Collaboration Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{commentCount}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Edit3 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{suggestedEditCount}</div>
              <div className="text-sm text-muted-foreground">Suggestions</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Bell className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{unreadNotificationCount}</div>
              <div className="text-sm text-muted-foreground">Notifications</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {isCheckingConflicts ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                ) : (
                  detectedConflicts.length
                )}
              </div>
              <div className="text-sm text-muted-foreground">Active Editors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Conflict Detection */}
      <EditConflictDetection
        pageId={pageId}
        onConflictDetected={handleConflictDetected}
        onConflictResolved={handleConflictResolved}
      />

      {/* Main Collaboration Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Collaboration Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="comments" className="flex items-center space-x-2">
                {getTabIcon('comments')}
                <span>Comments</span>
                {getTabBadge('comments') && (
                  <Badge variant="secondary" className="ml-1">
                    {getTabBadge('comments')}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="suggestions" className="flex items-center space-x-2">
                {getTabIcon('suggestions')}
                <span>Suggestions</span>
                {getTabBadge('suggestions') && (
                  <Badge variant="secondary" className="ml-1">
                    {getTabBadge('suggestions')}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                {getTabIcon('notifications')}
                <span>Notifications</span>
                {getTabBadge('notifications') && (
                  <Badge variant="destructive" className="ml-1">
                    {getTabBadge('notifications')}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="conflicts" className="flex items-center space-x-2">
                {getTabIcon('conflicts')}
                <span>Conflicts</span>
                {getTabBadge('conflicts') && (
                  <Badge variant="destructive" className="ml-1">
                    {getTabBadge('conflicts')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="mt-6">
              <Comments
                pageId={pageId}
                userRole={userRole}
                allowComments={allowComments}
              />
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-6">
              <SuggestedEdits
                pageId={pageId}
                userRole={userRole}
                currentContent={currentContent}
                currentTitle={currentTitle}
                onApplyEdit={onApplyEdit}
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <CollaborationNotifications
                pageId={pageId}
                showPageSubscription={true}
              />
            </TabsContent>
            
            <TabsContent value="conflicts" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {conflicts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No edit conflicts detected</p>
                      <p className="text-sm">You can safely edit this page</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="font-medium">Active Edit Conflicts</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {conflicts.map((conflict, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <div>
                                <div className="font-medium text-sm">{conflict.conflictUserName}</div>
                                <div className="text-xs text-muted-foreground">
                                  Last active {new Date(conflict.lastActivity).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Communicate with other editors to coordinate changes</li>
                          <li>• Save your work frequently to avoid losing changes</li>
                          <li>• Consider waiting if others are making major changes</li>
                          <li>• Use the page history to see recent changes</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitMerge className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">Add Comment</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => setActiveTab('suggestions')}
            >
              <Edit3 className="w-6 h-6" />
              <span className="text-sm">Suggest Edit</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-6 h-6" />
              <span className="text-sm">View Notifications</span>
              {unreadNotificationCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadNotificationCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => setActiveTab('conflicts')}
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm">Check Conflicts</span>
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {conflicts.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationDashboard; 