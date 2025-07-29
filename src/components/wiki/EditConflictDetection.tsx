import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  Eye, 
  X,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { EditConflict, WikiEditSession } from '@/types/wiki';
import { wikiCollaborationService } from '@/services/wikiCollaborationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditConflictDetectionProps {
  pageId: string;
  onConflictDetected: (conflicts: EditConflict[]) => void;
  onConflictResolved: () => void;
}

interface ActiveEditorItemProps {
  session: WikiEditSession;
  onViewProfile: (userId: string) => void;
}

const ActiveEditorItem: React.FC<ActiveEditorItemProps> = ({ session, onViewProfile }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true }));
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [session.lastActivity]);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${session.userName}`} />
          <AvatarFallback>{session.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{session.userName}</span>
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {timeAgo}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Session started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewProfile(session.userId)}
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
};

const EditConflictDetection: React.FC<EditConflictDetectionProps> = ({
  pageId,
  onConflictDetected,
  onConflictResolved
}) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<WikiEditSession | null>(null);
  const [activeSessions, setActiveSessions] = useState<WikiEditSession[]>([]);
  const [conflicts, setConflicts] = useState<EditConflict[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conflictCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startEditSession = async () => {
    if (!user) return;

    try {
      const session = await wikiCollaborationService.startEditSession(pageId);
      setCurrentSession(session);
      
      // Set up activity tracking
      activityIntervalRef.current = setInterval(async () => {
        if (session) {
          await wikiCollaborationService.updateEditSession(session.id);
        }
      }, 30000); // Update every 30 seconds

      // Set up conflict checking
      conflictCheckIntervalRef.current = setInterval(async () => {
        await checkForConflicts();
      }, 10000); // Check every 10 seconds

      // Initial conflict check
      await checkForConflicts();
    } catch (error) {
      console.error('Failed to start edit session:', error);
      toast.error('Failed to start edit session');
    }
  };

  const endEditSession = async () => {
    if (currentSession) {
      try {
        await wikiCollaborationService.endEditSession(currentSession.id);
        setCurrentSession(null);
      } catch (error) {
        console.error('Failed to end edit session:', error);
      }
    }

    // Clear intervals
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    if (conflictCheckIntervalRef.current) {
      clearInterval(conflictCheckIntervalRef.current);
      conflictCheckIntervalRef.current = null;
    }
  };

  const checkForConflicts = async () => {
    if (!user || !currentSession) return;

    try {
      setIsChecking(true);
      const detectedConflicts = await wikiCollaborationService.checkEditConflicts(pageId, user.id);
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        onConflictDetected(detectedConflicts);
        setShowConflictDialog(true);
      } else {
        setConflicts([]);
        onConflictResolved();
      }
    } catch (error) {
      console.error('Failed to check for conflicts:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const loadActiveSessions = async () => {
    try {
      // This would need to be implemented in the service
      // For now, we'll simulate it with the conflicts data
      const mockSessions: WikiEditSession[] = conflicts.map(conflict => ({
        id: `session-${conflict.conflictUserId}`,
        pageId,
        userId: conflict.conflictUserId,
        userName: conflict.conflictUserName,
        sessionToken: 'mock-token',
        lastActivity: conflict.lastActivity,
        isActive: true,
        createdAt: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      }));
      
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  };

  useEffect(() => {
    if (conflicts.length > 0) {
      loadActiveSessions();
    }
  }, [conflicts]);

  useEffect(() => {
    // Start session when component mounts
    startEditSession();

    // Cleanup on unmount
    return () => {
      endEditSession();
    };
  }, []);

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile or show user info
    console.log('View profile for user:', userId);
  };

  const handleResolveConflict = () => {
    setShowConflictDialog(false);
    setConflicts([]);
    onConflictResolved();
    toast.success('Conflict resolved');
  };

  const handleContinueEditing = () => {
    setShowConflictDialog(false);
    toast.info('Continuing to edit - be aware of potential conflicts');
  };

  if (!currentSession) {
    return null;
  }

  return (
    <>
      {/* Conflict Alert */}
      {conflicts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Edit Conflict Detected</h4>
                  <p className="text-sm text-yellow-700">
                    {conflicts.length} other user{conflicts.length > 1 ? 's are' : ' is'} currently editing this page
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConflictDialog(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkForConflicts}
                  disabled={isChecking}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isChecking && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Editors Indicator */}
      {activeSessions.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4" />
              <span>Active Editors ({activeSessions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeSessions.map((session) => (
              <ActiveEditorItem
                key={session.id}
                session={session}
                onViewProfile={handleViewProfile}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Edit Conflict Detected</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">What's happening?</h4>
              <p className="text-sm text-yellow-700">
                Other users are currently editing this page. This could lead to conflicts when saving changes.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Active Editors:</h4>
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div key={conflict.conflictUserId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conflict.conflictUserName}`} />
                        <AvatarFallback>{conflict.conflictUserName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{conflict.conflictUserName}</div>
                        <div className="text-xs text-muted-foreground">
                          Last active {formatDistanceToNow(new Date(conflict.lastActivity), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
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

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleResolveConflict}
              >
                <X className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
              <Button
                onClick={handleContinueEditing}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Continue Editing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditConflictDetection; 