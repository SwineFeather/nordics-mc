
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import WelcomeHero from './WelcomeHero';
import FeaturedSection from './FeaturedSection';
import PlayerDirectory from './PlayerDirectory';
import LeaderboardView from './LeaderboardView';
import EconomyOverview from './EconomyOverview';
import StaffDirectory from './StaffDirectory';
import CommunityAchievements from './CommunityAchievements';
import StatisticsLeaderboard from './StatisticsLeaderboard';
import { useProfiles } from '@/hooks/useProfiles';
import { useState } from 'react';
import { DollarSign, Shield, Trophy, BarChart3 } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';

const CommunityDashboard = () => {
  const { profile } = useAuth();
  const { profiles, loading } = useProfiles({ fetchAll: true });
  const [selectedStat, setSelectedStat] = useState<{ key: string; label: string } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

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
      <WelcomeHero />
      <FeaturedSection 
        profiles={profiles} 
        loading={loading}
        onSelectProfile={handleSelectProfile}
      />
      
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 bg-muted dark:bg-muted">
          <TabsTrigger value="directory" className="dark:text-muted-foreground dark:data-[state=active]:text-foreground">Players</TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2 dark:text-muted-foreground dark:data-[state=active]:text-foreground">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="economy" className="flex items-center gap-2 dark:text-muted-foreground dark:data-[state=active]:text-foreground">
            <DollarSign className="w-4 h-4" />
            Economy
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 dark:text-muted-foreground dark:data-[state=active]:text-foreground">
            <Shield className="w-4 h-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2 dark:text-muted-foreground dark:data-[state=active]:text-foreground">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <PlayerDirectory />
        </TabsContent>

        <TabsContent value="achievements">
          <CommunityAchievements />
        </TabsContent>

        <TabsContent value="economy">
          <EconomyOverview 
            profiles={profiles} 
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="staff">
          <StaffDirectory />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsLeaderboard 
            profiles={profiles}
            loading={loading}
            onPlayerClick={handleSelectProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityDashboard;
