
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Database, Settings, Trophy, RefreshCw, BookOpen } from 'lucide-react';
import AchievementSyncButton from '@/components/admin/AchievementSyncButton';
import ComprehensiveStatsUpdate from '@/components/admin/ComprehensiveStatsUpdate';
import ComprehensiveStatsSync from '@/components/admin/ComprehensiveStatsSync';
import CacheManagement from '@/components/admin/CacheManagement';
import AchievementDebugPanel from '@/components/admin/AchievementDebugPanel';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { populateTownAchievements, syncAllTownAchievements } from '@/lib/townLeveling';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIKnowledgeService } from '@/services/aiKnowledgeService';
import ThorMinecraftPanel from '@/components/admin/ThorMinecraftPanel';
import AutoWikiManager from '@/components/admin/AutoWikiManager';

const Admin = () => {
  const { profile, loading, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [populatingTownAchievements, setPopulatingTownAchievements] = useState(false);
  const [syncingTownAchievements, setSyncingTownAchievements] = useState(false);

  // AI Knowledgebase state
  const [aiKnowledge, setAiKnowledge] = useState(() => localStorage.getItem('aiKnowledge') || '');
  const [savingAIKnowledge, setSavingAIKnowledge] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState<any[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    section: 'Supabase Table',
    content: '',
    tags: [] as string[]
  });

  // Load knowledgebase entries
  const loadKnowledgeEntries = async () => {
    setLoadingKnowledge(true);
    try {
      const { data, error } = await supabase
        .from('ai_knowledgebase')
        .select('*')
        .order('section, title');
      
      if (error) throw error;
      setKnowledgeEntries(data || []);
    } catch (error) {
      console.error('Error loading knowledgebase:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledgebase entries",
        variant: "destructive"
      });
    } finally {
      setLoadingKnowledge(false);
    }
  };

  // Save new knowledgebase entry
  const saveKnowledgeEntry = async () => {
    if (!newEntry.title || !newEntry.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_knowledgebase')
        .insert([{
          title: newEntry.title,
          section: newEntry.section,
          content: newEntry.content,
          tags: newEntry.tags
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Knowledgebase entry added successfully",
      });

      setNewEntry({
        title: '',
        section: 'Supabase Table',
        content: '',
        tags: []
      });

      loadKnowledgeEntries();
    } catch (error) {
      console.error('Error saving knowledgebase entry:', error);
      toast({
        title: "Error",
        description: "Failed to save knowledgebase entry",
        variant: "destructive"
      });
    }
  };

  // Load entries on component mount
  useEffect(() => {
    loadKnowledgeEntries();
  }, []);

  const handleSaveAIKnowledge = () => {
    setSavingAIKnowledge(true);
    localStorage.setItem('aiKnowledge', aiKnowledge);
    setTimeout(() => setSavingAIKnowledge(false), 500);
    toast({
      title: 'Saved!',
      description: 'AI Knowledgebase updated. Thor the Bot will use this information.',
    });
  };

  // Debug logging to see what's happening
  useEffect(() => {
    console.log('Admin component render - Debug info:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, role: profile.role, email: profile.email } : null,
      loading,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }, [user, profile, loading, isAuthenticated]);

  // Show loading state while authentication is being determined
  if (loading) {
    console.log('Admin: Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated first
  if (!isAuthenticated || !user) {
    console.log('Admin: User not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but profile hasn't loaded yet, show loading
  if (!profile) {
    console.log('Admin: User authenticated but profile not loaded, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Now check if user has admin role
  if (profile.role !== 'admin') {
    console.log('Admin: User does not have admin role:', profile.role, 'redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Admin: All checks passed, rendering admin panel');

  const handlePopulateTownAchievements = async () => {
    try {
      setPopulatingTownAchievements(true);
      const result = await populateTownAchievements();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Town achievements have been populated in the database.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to populate town achievements",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error populating town achievements:', error);
      toast({
        title: "Error",
        description: "Failed to populate town achievements",
        variant: "destructive"
      });
    } finally {
      setPopulatingTownAchievements(false);
    }
  };

  const handleSyncTownAchievements = async () => {
    try {
      setSyncingTownAchievements(true);
      const result = await syncAllTownAchievements();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Town achievements have been synced for all towns.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to sync town achievements",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error syncing town achievements:', error);
      toast({
        title: "Error",
        description: "Failed to sync town achievements",
        variant: "destructive"
      });
    } finally {
      setSyncingTownAchievements(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage server settings, players, and system functions.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Logged in as: {profile.email} (Role: {profile.role})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Achievement Sync */}
        <div className="md:col-span-2 lg:col-span-1">
          <AchievementSyncButton />
        </div>

        {/* Comprehensive Stats Update */}
        <div className="md:col-span-2 lg:col-span-2">
          <ComprehensiveStatsUpdate />
        </div>

        {/* Comprehensive Stats Sync */}
        <div className="md:col-span-2 lg:col-span-3">
          <ComprehensiveStatsSync />
        </div>

        {/* Cache Management */}
        <div className="md:col-span-2 lg:col-span-3">
          <CacheManagement />
        </div>

        {/* Achievement Debug Panel */}
        <div className="md:col-span-2 lg:col-span-3">
          <AchievementDebugPanel />
        </div>

        {/* Town Achievement Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Town Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Set up town achievement definitions and tiers in the database.
              </p>
              <Button 
                onClick={handlePopulateTownAchievements}
                disabled={populatingTownAchievements}
                className="w-full"
              >
                {populatingTownAchievements ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Populating...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Populate Town Achievements
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSyncTownAchievements}
                disabled={syncingTownAchievements}
                variant="outline"
                className="w-full"
              >
                {syncingTownAchievements ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Town Achievements
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Player Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Players:</span>
                <span className="font-medium">322+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Online Now:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Achievements:</span>
                <span className="font-medium">Synced</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database:</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sync Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-medium">Recently</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Player Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage player profiles, stats, and achievements
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Server Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure server parameters and maintenance
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Synchronize data between systems and databases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Knowledgebase Panel */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              AI Knowledgebase Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Legacy Text Area */}
              <div>
                <Label htmlFor="legacy-knowledge">Legacy Knowledge (Local Storage)</Label>
                <Textarea
                  id="legacy-knowledge"
                  value={aiKnowledge}
                  onChange={e => setAiKnowledge(e.target.value)}
                  placeholder="Type knowledge, rules, or FAQs here..."
                  disabled={savingAIKnowledge}
                  className="min-h-[120px] font-mono"
                />
                <Button onClick={handleSaveAIKnowledge} disabled={savingAIKnowledge} className="mt-2">
                  {savingAIKnowledge ? 'Saving...' : 'Save Legacy Knowledge'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the old localStorage method. Use the database entries below for better management.
                </p>
              </div>

              {/* Database Knowledgebase Entries */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Database Knowledgebase Entries</h3>
                  <Button onClick={loadKnowledgeEntries} disabled={loadingKnowledge} size="sm">
                    {loadingKnowledge ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {/* Add New Entry */}
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">Add New Entry</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry-title">Title</Label>
                      <Input
                        id="entry-title"
                        value={newEntry.title}
                        onChange={e => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., towns, nations, achievements"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entry-section">Section</Label>
                      <Select value={newEntry.section} onValueChange={value => setNewEntry(prev => ({ ...prev, section: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Supabase Table">Supabase Table</SelectItem>
                          <SelectItem value="Storage">Storage</SelectItem>
                          <SelectItem value="Instructions">Instructions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="entry-content">Content</Label>
                    <Textarea
                      id="entry-content"
                      value={newEntry.content}
                      onChange={e => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Describe what this table/section is for and how to use it..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="entry-tags">Tags (comma-separated)</Label>
                    <Input
                      id="entry-tags"
                      value={newEntry.tags.join(', ')}
                      onChange={e => setNewEntry(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) }))}
                      placeholder="e.g., towns, balance, mayor"
                    />
                  </div>
                  <Button onClick={saveKnowledgeEntry} className="mt-4">
                    Add Entry
                  </Button>
                </div>

                {/* Existing Entries */}
                <div className="space-y-2">
                  {knowledgeEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.title}</span>
                            <Badge variant="outline" className="text-xs">{entry.section}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{entry.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thor Minecraft Integration Panel */}
        <Card className="md:col-span-2 lg:col-span-3">
          <ThorMinecraftPanel />
        </Card>

        {/* Auto Wiki Manager Panel */}
        <Card className="md:col-span-2 lg:col-span-3">
          <AutoWikiManager />
        </Card>
      </div>
    </div>
  );
};

export default Admin;
