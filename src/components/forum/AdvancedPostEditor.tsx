import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft, Save, FileEdit, X, History, Users, BarChart3, 
  Eye, Edit, Crown, Clock, AlertCircle, CheckCircle, 
  TrendingUp, MessageSquare, Share2, Settings, Sparkles,
  UserPlus, UserCheck, UserX, GitBranch, GitCommit,
  BookOpen, Target, Zap, Lightbulb, Loader2
} from 'lucide-react';
import { PostTypeSelector } from './PostTypeSelector';
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor';
import { PostTemplates, PostTemplate } from './PostTemplates';
import { forumPostService, PostVersion, PostCollaboration, PostCollaborationWithUser } from '@/services/forumPostService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedPostEditorProps {
  onSubmit: (title: string, content: string, tags: string[], postType: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialPostType?: string;
  isEditing?: boolean;
  postId?: string;
  categoryName?: string;
  categoryId?: string;
  onBack?: () => void;
}

export const AdvancedPostEditor: React.FC<AdvancedPostEditorProps> = ({
  onSubmit,
  onCancel,
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialPostType = 'discussion',
  isEditing = false,
  postId,
  categoryName,
  categoryId,
  onBack
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [postType, setPostType] = useState(initialPostType);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showQualityAnalysis, setShowQualityAnalysis] = useState(false);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [collaborations, setCollaborations] = useState<PostCollaborationWithUser[]>([]);
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [collaborationInvite, setCollaborationInvite] = useState({
    userId: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin'
  });
  const [customTag, setCustomTag] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update state when initial values change (for editing)
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setSelectedTags(initialTags);
    setPostType(initialPostType);
  }, [initialTitle, initialContent, initialTags, initialPostType]);

  // Load version history and collaborations for editing
  useEffect(() => {
    if (isEditing && postId) {
      loadVersionHistory();
      loadCollaborations();
    }
  }, [isEditing, postId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && user && (title.trim() || content.trim())) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (isEditing && postId) {
          try {
            await forumPostService.autoSavePost(postId, {
              title,
              content,
              tags: selectedTags,
              post_type: postType
            }, user.id);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            toast({
              title: "Auto-saved",
              description: "Your changes have been automatically saved.",
            });
          } catch (error) {
            console.error('Auto-save error:', error);
            toast({
              title: "Auto-save failed",
              description: "Please save manually to avoid losing changes.",
              variant: "destructive"
            });
          }
        }
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, selectedTags, postType, hasUnsavedChanges, autoSaveEnabled, user, isEditing, postId]);

  // Track changes
  useEffect(() => {
    const hasChanges = title !== initialTitle || 
                      content !== initialContent || 
                      JSON.stringify(selectedTags) !== JSON.stringify(initialTags) ||
                      postType !== initialPostType;
    setHasUnsavedChanges(hasChanges);
  }, [title, content, selectedTags, postType, initialTitle, initialContent, initialTags, initialPostType]);

  const loadVersionHistory = async () => {
    if (!postId) return;
    try {
      const versions = await forumPostService.getPostVersions(postId);
      setVersions(versions);
    } catch (error) {
      console.error('Error loading version history:', error);
    }
  };

  const loadCollaborations = async () => {
    if (!postId) return;
    try {
      const collaborations = await forumPostService.getPostCollaborations(postId);
      setCollaborations(collaborations);
    } catch (error) {
      console.error('Error loading collaborations:', error);
    }
  };

  const handleTemplateSelect = (template: PostTemplate) => {
    const lines = template.content.split('\n');
    let extractedTitle = template.name;
    
    if (lines[0] && lines[0].startsWith('##')) {
      extractedTitle = lines[0].replace('##', '').trim();
    }
    
    setTitle(extractedTitle);
    setContent(template.content);
    setSelectedTags(template.tags);
    setPostType(template.category);
    setActiveTab('editor');
    
    toast({
      title: "Template applied",
      description: `${template.name} template has been loaded.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim(), selectedTags, postType);
    }
  };

  const analyzeContentQuality = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await forumPostService.analyzePostQuality(content);
      setQualityAnalysis(analysis);
      setShowQualityAnalysis(true);
    } catch (error) {
      console.error('Error analyzing content quality:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze content quality.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const inviteCollaborator = async () => {
    if (!postId || !user || !collaborationInvite.userId) return;
    
    try {
      await forumPostService.inviteCollaborator(
        postId,
        collaborationInvite.userId,
        collaborationInvite.role,
        user.id
      );
      setCollaborationInvite({ userId: '', role: 'viewer' });
      loadCollaborations();
      toast({
        title: "Invitation sent",
        description: "Collaboration invitation has been sent.",
      });
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: "Invitation failed",
        description: "Could not send collaboration invitation.",
        variant: "destructive"
      });
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {(categoryName || onBack) && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {onBack && (
            <>
              <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="text-muted-foreground">•</span>
            </>
          )}
          {categoryName && (
            <span className="font-medium text-foreground">Posting in: {categoryName}</span>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileEdit className="w-5 h-5" />
              <span>{isEditing ? 'Edit Post' : 'Create New Post'}</span>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Unsaved
                </Badge>
              )}
            </CardTitle>
            
            {isEditing && postId && (
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVersionHistory(true)}
                      >
                        <History className="w-4 h-4 mr-1" />
                        History
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View version history</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCollaboration(true)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Collaborate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Manage collaborators</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnalytics(true)}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View post analytics</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {!isEditing && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <FileEdit className="w-4 h-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Templates</span>
                </TabsTrigger>
                <TabsTrigger value="quality" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Quality</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Post Type</label>
                    <PostTypeSelector
                      value={postType}
                      onChange={setPostType}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Content</label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={analyzeContentQuality}
                          disabled={isAnalyzing || !content.trim()}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Target className="w-4 h-4 mr-1" />
                          )}
                          Analyze
                        </Button>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="autoSave"
                            checked={autoSaveEnabled}
                            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor="autoSave" className="text-xs text-muted-foreground">
                            Auto-save
                          </label>
                        </div>
                      </div>
                    </div>
                    <EnhancedRichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Write your post content..."
                      rows={12}
                      showEmojiPicker={true}
                      showImageUpload={true}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Add custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={addCustomTag}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['general', 'help', 'announcement', 'discussion', 'question', 'guide', 'bug-report', 'feature-request'].map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="text-xs cursor-pointer"
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                removeTag(tag);
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map((tag) => (
                            <Badge key={tag} variant="default" className="text-xs">
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={!title.trim() || !content.trim()}>
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                  </div>
                  
                  {/* Status indicators */}
                  {hasUnsavedChanges && (
                    <div className="text-sm text-amber-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      You have unsaved changes
                    </div>
                  )}
                  {lastSaved && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Last saved: {formatDistanceToNow(lastSaved, { addSuffix: true })}
                    </div>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent value="templates" className="space-y-4">
                <PostTemplates onSelectTemplate={handleTemplateSelect} />
              </TabsContent>
              
              <TabsContent value="quality" className="space-y-4">
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Content Quality Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze your content for readability, engagement, and improvement suggestions.
                  </p>
                  <Button
                    onClick={analyzeContentQuality}
                    disabled={isAnalyzing || !content.trim()}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Analyze Content Quality
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Post Type</label>
                <PostTypeSelector
                  value={postType}
                  onChange={setPostType}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Content</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={analyzeContentQuality}
                    disabled={isAnalyzing || !content.trim()}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-1" />
                    )}
                    Analyze
                  </Button>
                </div>
                <EnhancedRichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post content..."
                  rows={12}
                  showEmojiPicker={true}
                  showImageUpload={true}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add custom tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addCustomTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['general', 'help', 'announcement', 'discussion', 'question', 'guide', 'bug-report', 'feature-request'].map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            removeTag(tag);
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="default" className="text-xs">
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={!title.trim() || !content.trim()}>
                  Update Post
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Version History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">v{version.version_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTitle(version.title);
                      setContent(version.content);
                      setSelectedTags(version.tags);
                      setPostType(version.post_type);
                      setShowVersionHistory(false);
                    }}
                  >
                    Restore
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{version.title}</h4>
                  {version.change_summary && (
                    <p className="text-sm text-muted-foreground">{version.change_summary}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {version.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaboration Dialog */}
      <Dialog open={showCollaboration} onOpenChange={setShowCollaboration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Collaboration Management</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Invite Collaborator</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="User ID or username"
                  value={collaborationInvite.userId}
                  onChange={(e) => setCollaborationInvite({ ...collaborationInvite, userId: e.target.value })}
                />
                <Select
                  value={collaborationInvite.role}
                  onValueChange={(value: 'viewer' | 'editor' | 'admin') => 
                    setCollaborationInvite({ ...collaborationInvite, role: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteCollaborator} disabled={!collaborationInvite.userId}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Current Collaborators</h4>
              <div className="space-y-2">
                {collaborations.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={collab.user?.avatar_url} />
                        <AvatarFallback>{collab.user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{collab.user?.username}</span>
                      <Badge variant="outline" className="text-xs">
                        {collab.role}
                      </Badge>
                      {collab.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {collaborations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No collaborators yet</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quality Analysis Dialog */}
      <Dialog open={showQualityAnalysis} onOpenChange={setShowQualityAnalysis}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Content Quality Analysis</span>
            </DialogTitle>
          </DialogHeader>
          {qualityAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Readability</span>
                  </div>
                  <div className="text-2xl font-bold">{qualityAnalysis.readability_score}/100</div>
                  <div className="text-sm text-muted-foreground">
                    {qualityAnalysis.readability_score >= 80 ? 'Excellent' :
                     qualityAnalysis.readability_score >= 60 ? 'Good' :
                     qualityAnalysis.readability_score >= 40 ? 'Fair' : 'Needs improvement'}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Read Time</span>
                  </div>
                  <div className="text-2xl font-bold">{qualityAnalysis.estimated_read_time} min</div>
                  <div className="text-sm text-muted-foreground">
                    {qualityAnalysis.word_count} words
                  </div>
                </Card>
              </div>
              
              {qualityAnalysis.suggestions.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Suggestions</span>
                  </div>
                  <ul className="space-y-1">
                    {qualityAnalysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <Zap className="w-3 h-3 mt-0.5 text-amber-500" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 