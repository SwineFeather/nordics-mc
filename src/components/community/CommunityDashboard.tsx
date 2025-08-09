
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import PlayerDirectory from './PlayerDirectory';
import LeaderboardView from './LeaderboardView';
import StatisticsLeaderboard from './StatisticsLeaderboard';
import { useProfiles } from '@/hooks/useProfiles';
import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';

interface CommunityDashboardProps {
  selectedPlayer?: string | null;
}

const CommunityDashboard = ({ selectedPlayer: initialSelectedPlayer }: CommunityDashboardProps) => {
  const { profile } = useAuth();
  const { profiles, loading } = useProfiles({ fetchAll: true });
  const [selectedStat, setSelectedStat] = useState<{ key: string; label: string } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

  // Handle initial selected player from URL
  useEffect(() => {
    if (initialSelectedPlayer && profiles.length > 0) {
      const foundPlayer = profiles.find(p => 
        p.username?.toLowerCase() === initialSelectedPlayer.toLowerCase() ||
        p.displayName?.toLowerCase() === initialSelectedPlayer.toLowerCase() ||
        p.minecraft_username?.toLowerCase() === initialSelectedPlayer.toLowerCase()
      );
      if (foundPlayer) {
        setSelectedPlayer(foundPlayer);
      }
    }
  }, [initialSelectedPlayer, profiles]);

  const handleSelectStat = (stat: { key: string; label: string }) => {
    setSelectedStat(stat);
  };

  const handleBackToOverview = () => {
    setSelectedStat(null);
  };

  const handleSelectProfile = (profile: PlayerProfile) => {
    setSelectedPlayer(profile);
  };

  if (selectedStat) {
    return (
      <LeaderboardView 
        stat={selectedStat} 
        profiles={profiles}
        loading={loading}
        onBack={handleBackToOverview}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background dark:bg-background">
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted dark:bg-muted">
          <TabsTrigger value="directory" className="dark:text-muted-foreground dark:data-[state=active]:text-foreground">Players</TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2 dark:text-muted-foreground dark:data-[state=active]:text-foreground">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <PlayerDirectory />
        </TabsContent>

        <TabsContent value="statistics">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Statistics (Work in progress)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We’re rebuilding the statistics experience. Current data is unreliable and this section is temporarily disabled.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityDashboard;
