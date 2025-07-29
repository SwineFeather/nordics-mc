
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Trophy, Activity } from 'lucide-react';
import { PlayerProfile } from '@/types/playerProfile';
import { FeaturedSection } from './FeaturedSection';
import { toast } from 'sonner';

interface CommunityDashboardProps {
  onSelectProfile: (profile: PlayerProfile) => void;
}

export const CommunityDashboard = ({ onSelectProfile }: CommunityDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    activeToday: 0,
    totalAchievements: 0
  });

  const searchProfiles = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`minecraft_username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast.error('Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      setStats(prev => ({ ...prev, totalProfiles: count || 0 }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Community Hub</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover players, achievements, and build connections in our community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfiles.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAchievements.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Players</CardTitle>
          <CardDescription>Find community members by username or name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProfiles()}
            />
            <Button onClick={searchProfiles} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {profiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {profiles.map((profile) => (
                <Card key={profile.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectProfile(profile)}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{profile.minecraft_username || profile.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeaturedSection />
    </div>
  );
};
