import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Award, Sparkles, Users, Crown, Star, CheckCircle, Lock, 
  Clock, Globe, Home, Castle, Building, MapPin, Flag, Target,
  Zap, Mountain, Ship, TreePine, Hammer, Pickaxe, Swords, Coins,
  Footprints, TreeDeciduous, Gem, Shield, Sword
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementClaiming, type ClaimableAchievement } from '@/hooks/useAchievementClaiming';
import { ClaimButton } from '@/components/achievements/ClaimButton';
import { cn } from '@/lib/utils';
import { calculateLevelInfo, type LevelInfo } from '@/lib/leveling';
import { supabase } from '@/integrations/supabase/client';
import { fetchPlayersFromNewStructure, flattenNestedStats } from '@/services/newStatsService';

interface CommunityAchievementsProps {
  className?: string;
}

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  color: string;
  icon: any;
  tiers: AchievementTier[];
}

interface AchievementTier {
  tier: number;
  name: string;
  description: string;
  threshold: number;
  points: number;
  icon: any;
}

interface PlayerStats {
  [key: string]: number;
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'playtime',
    name: 'Time Lord',
    description: 'Accumulate playtime on the server',
    stat: 'play_time',
    color: 'from-blue-500 to-purple-600',
    icon: Clock,
    tiers: [
      { tier: 1, name: 'Newcomer', description: 'Play for 1 hour', threshold: 72000, points: 50, icon: Clock },
      { tier: 2, name: 'Regular', description: 'Play for 10 hours', threshold: 720000, points: 100, icon: Clock },
      { tier: 3, name: 'Dedicated', description: 'Play for 50 hours', threshold: 3600000, points: 150, icon: Clock },
      { tier: 4, name: 'Veteran', description: 'Play for 100 hours', threshold: 7200000, points: 200, icon: Clock },
      { tier: 5, name: 'Time Lord', description: 'Play for 500 hours', threshold: 36000000, points: 250, icon: Clock },
    ],
  },
  {
    id: 'blocks_placed',
    name: 'Master Builder',
    description: 'Place blocks to build amazing structures',
    stat: 'blocksPlaced',
    color: 'from-green-500 to-emerald-600',
    icon: Hammer,
    tiers: [
      { tier: 1, name: 'Builder', description: 'Place 1,000 blocks', threshold: 1000, points: 50, icon: Hammer },
      { tier: 2, name: 'Constructor', description: 'Place 5,000 blocks', threshold: 5000, points: 100, icon: Hammer },
      { tier: 3, name: 'Engineer', description: 'Place 25,000 blocks', threshold: 25000, points: 150, icon: Hammer },
      { tier: 4, name: 'Master Builder', description: 'Place 100,000 blocks', threshold: 100000, points: 200, icon: Hammer },
      { tier: 5, name: 'Architect', description: 'Place 500,000 blocks', threshold: 500000, points: 250, icon: Hammer },
    ],
  },
  {
    id: 'blocks_broken',
    name: 'Mining Master',
    description: 'Break blocks to gather resources',
    stat: 'blocksBroken',
    color: 'from-orange-500 to-red-600',
    icon: Pickaxe,
    tiers: [
      { tier: 1, name: 'Miner', description: 'Break 1,000 blocks', threshold: 1000, points: 50, icon: Pickaxe },
      { tier: 2, name: 'Excavator', description: 'Break 5,000 blocks', threshold: 5000, points: 100, icon: Pickaxe },
      { tier: 3, name: 'Tunneler', description: 'Break 25,000 blocks', threshold: 25000, points: 150, icon: Pickaxe },
      { tier: 4, name: 'Mining Master', description: 'Break 100,000 blocks', threshold: 100000, points: 200, icon: Pickaxe },
      { tier: 5, name: 'Terraformer', description: 'Break 500,000 blocks', threshold: 500000, points: 250, icon: Pickaxe },
    ],
  },
  {
    id: 'mob_kills',
    name: 'Combat Expert',
    description: 'Defeat hostile mobs',
    stat: 'mobKills',
    color: 'from-red-500 to-pink-600',
    icon: Swords,
    tiers: [
      { tier: 1, name: 'Fighter', description: 'Kill 100 mobs', threshold: 100, points: 50, icon: Swords },
      { tier: 2, name: 'Warrior', description: 'Kill 500 mobs', threshold: 500, points: 100, icon: Swords },
      { tier: 3, name: 'Slayer', description: 'Kill 2,500 mobs', threshold: 2500, points: 150, icon: Swords },
      { tier: 4, name: 'Combat Expert', description: 'Kill 10,000 mobs', threshold: 10000, points: 200, icon: Swords },
      { tier: 5, name: 'Legendary Hunter', description: 'Kill 50,000 mobs', threshold: 50000, points: 250, icon: Swords },
    ],
  },
  {
    id: 'diamond_mining',
    name: 'Diamond Hunter',
    description: 'Mine diamond ores',
    stat: 'diamond_ore_mined',
    color: 'from-cyan-500 to-blue-600',
    icon: Gem,
    tiers: [
      { tier: 1, name: 'Prospector', description: 'Mine 10 diamond ores', threshold: 10, points: 100, icon: Gem },
      { tier: 2, name: 'Diamond Hunter', description: 'Mine 50 diamond ores', threshold: 50, points: 200, icon: Gem },
      { tier: 3, name: 'Diamond Master', description: 'Mine 200 diamond ores', threshold: 200, points: 300, icon: Gem },
      { tier: 4, name: 'Diamond Baron', description: 'Mine 1,000 diamond ores', threshold: 1000, points: 400, icon: Gem },
      { tier: 5, name: 'Diamond King', description: 'Mine 5,000 diamond ores', threshold: 5000, points: 500, icon: Gem },
    ],
  },
  {
    id: 'fishing',
    name: 'Master Angler',
    description: 'Catch fish and treasures',
    stat: 'fishing_rod_used',
    color: 'from-blue-400 to-cyan-500',
    icon: Ship,
    tiers: [
      { tier: 1, name: 'Fisher', description: 'Use fishing rod 100 times', threshold: 100, points: 50, icon: Ship },
      { tier: 2, name: 'Angler', description: 'Use fishing rod 500 times', threshold: 500, points: 100, icon: Ship },
      { tier: 3, name: 'Master Angler', description: 'Use fishing rod 2,500 times', threshold: 2500, points: 150, icon: Ship },
      { tier: 4, name: 'Fishing Legend', description: 'Use fishing rod 10,000 times', threshold: 10000, points: 200, icon: Ship },
      { tier: 5, name: 'Sea Lord', description: 'Use fishing rod 50,000 times', threshold: 50000, points: 250, icon: Ship },
    ],
  },
  {
    id: 'woodcutting',
    name: 'Lumberjack',
    description: 'Cut down trees and gather wood',
    stat: 'oak_log_mined',
    color: 'from-green-600 to-emerald-700',
    icon: TreeDeciduous,
    tiers: [
      { tier: 1, name: 'Woodcutter', description: 'Mine 100 oak logs', threshold: 100, points: 50, icon: TreeDeciduous },
      { tier: 2, name: 'Lumberjack', description: 'Mine 500 oak logs', threshold: 500, points: 100, icon: TreeDeciduous },
      { tier: 3, name: 'Forest Master', description: 'Mine 2,500 oak logs', threshold: 2500, points: 150, icon: TreeDeciduous },
      { tier: 4, name: 'Timber Baron', description: 'Mine 10,000 oak logs', threshold: 10000, points: 200, icon: TreeDeciduous },
      { tier: 5, name: 'Nature Guardian', description: 'Mine 50,000 oak logs', threshold: 50000, points: 250, icon: TreeDeciduous },
    ],
  },
  {
    id: 'travel',
    name: 'Explorer',
    description: 'Travel across the world',
    stat: 'walk_one_cm',
    color: 'from-purple-500 to-indigo-600',
    icon: Footprints,
    tiers: [
      { tier: 1, name: 'Wanderer', description: 'Walk 10,000 blocks', threshold: 1000000, points: 50, icon: Footprints },
      { tier: 2, name: 'Explorer', description: 'Walk 50,000 blocks', threshold: 5000000, points: 100, icon: Footprints },
      { tier: 3, name: 'Adventurer', description: 'Walk 250,000 blocks', threshold: 25000000, points: 150, icon: Footprints },
      { tier: 4, name: 'Voyager', description: 'Walk 1,000,000 blocks', threshold: 100000000, points: 200, icon: Footprints },
      { tier: 5, name: 'World Walker', description: 'Walk 5,000,000 blocks', threshold: 500000000, points: 250, icon: Footprints },
    ],
  },
  {
    id: 'combat_weapons',
    name: 'Weapon Master',
    description: 'Master different combat weapons',
    stat: 'netherite_sword_used',
    color: 'from-gray-600 to-slate-700',
    icon: Sword,
    tiers: [
      { tier: 1, name: 'Swordsman', description: 'Use netherite sword 100 times', threshold: 100, points: 100, icon: Sword },
      { tier: 2, name: 'Blade Master', description: 'Use netherite sword 500 times', threshold: 500, points: 200, icon: Sword },
      { tier: 3, name: 'Weapon Master', description: 'Use netherite sword 2,500 times', threshold: 2500, points: 300, icon: Sword },
      { tier: 4, name: 'Combat Legend', description: 'Use netherite sword 10,000 times', threshold: 10000, points: 400, icon: Sword },
      { tier: 5, name: 'War God', description: 'Use netherite sword 50,000 times', threshold: 50000, points: 500, icon: Sword },
    ],
  },
  {
    id: 'ranged_combat',
    name: 'Archer',
    description: 'Master ranged combat',
    stat: 'bow_used',
    color: 'from-yellow-500 to-orange-600',
    icon: Target,
    tiers: [
      { tier: 1, name: 'Archer', description: 'Use bow 100 times', threshold: 100, points: 50, icon: Target },
      { tier: 2, name: 'Marksman', description: 'Use bow 500 times', threshold: 500, points: 100, icon: Target },
      { tier: 3, name: 'Sharpshooter', description: 'Use bow 2,500 times', threshold: 2500, points: 150, icon: Target },
      { tier: 4, name: 'Ranged Master', description: 'Use bow 10,000 times', threshold: 10000, points: 200, icon: Target },
      { tier: 5, name: 'Eagle Eye', description: 'Use bow 50,000 times', threshold: 50000, points: 250, icon: Target },
    ],
  },
];

const CommunityAchievements: React.FC<CommunityAchievementsProps> = ({ className = "" }) => {
  const { user, profile } = useAuth();
  const { 
    claimableAchievements, 
    fetchClaimableAchievements, 
    claimAchievement, 
    isLoading 
  } = useAchievementClaiming();
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({});
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = !!profile?.minecraft_username;
  const canClaim = isOwnProfile;

  useEffect(() => {
    const loadPlayerData = async () => {
      console.log('=== COMMUNITY ACHIEVEMENTS COMPONENT LOADED ===');
      
      // Get the user's UUID - try different sources
      const userUuid = user?.id || localStorage.getItem("player_uuid");
      
      console.log('User object:', user);
      console.log('Profile object:', profile);
      console.log('LocalStorage player_uuid:', localStorage.getItem("player_uuid"));
      console.log('LocalStorage player_name:', localStorage.getItem("player_name"));
      console.log('Selected userUuid:', userUuid);
      
      if (!userUuid) {
        console.log('No user UUID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Starting to load player data for UUID:', userUuid);
        
        // Simple test query first
        console.log('Testing simple query to players table...');
        const { data: testPlayers, error: testError } = await supabase
          .from('players')
          .select('uuid, name')
          .limit(5);
        
        console.log('Test players query result:', { testPlayers, testError });
        
        if (testError) {
          console.error('Test query failed:', testError);
          setLoading(false);
          return;
        }
        
        console.log('Test query successful, found players:', testPlayers);
        
        // Now try to find our specific player
        const ourPlayer = testPlayers?.find(p => p.uuid === userUuid);
        console.log('Our player in test results:', ourPlayer);
        
        if (!ourPlayer) {
          console.log('Our UUID not found in first 5 players, trying broader search...');
          
          // Try to find our player specifically
          const { data: ourPlayerData, error: ourPlayerError } = await supabase
            .from('players')
            .select('uuid, name')
            .eq('uuid', userUuid)
            .single();
          
          console.log('Specific player query result:', { ourPlayerData, ourPlayerError });
          
          if (ourPlayerError) {
            console.error('Could not find our player:', ourPlayerError);
            setPlayerStats({});
            setLevelInfo(null);
            setLoading(false);
            return;
          }
          
          console.log('Found our player:', ourPlayerData);
        }
        
        // Now try to get stats
        console.log('Trying to get player stats...');
        const { data: statsData, error: statsError } = await supabase
          .from('player_stats')
          .select('stats')
          .eq('player_uuid', userUuid)
          .single();
        
        console.log('Stats query result:', { statsData, statsError });
        
        if (statsError) {
          console.error('Stats query failed:', statsError);
          setPlayerStats({});
          setLevelInfo(null);
          setLoading(false);
          return;
        }
        
        if (!statsData || !statsData.stats) {
          console.log('No stats found for player');
          setPlayerStats({});
          setLevelInfo(null);
          setLoading(false);
          return;
        }
        
        console.log('Found stats, processing...');
        console.log('Raw stats:', statsData.stats);
        console.log('Raw stats type:', typeof statsData.stats);
        console.log('Raw stats keys:', Object.keys(statsData.stats || {}));
        
        // Check if stats might be a string that needs parsing
        let statsToProcess = statsData.stats;
        if (typeof statsData.stats === 'string') {
          console.log('Stats is a string, attempting to parse...');
          try {
            statsToProcess = JSON.parse(statsData.stats);
            console.log('Parsed stats:', statsToProcess);
          } catch (parseError) {
            console.error('Failed to parse stats string:', parseError);
            statsToProcess = {};
          }
        }
        
        // Show the structure of the first few keys
        if (statsToProcess && typeof statsToProcess === 'object') {
          const firstKeys = Object.keys(statsToProcess).slice(0, 5);
          firstKeys.forEach(key => {
            console.log(`Key "${key}":`, statsToProcess[key], 'Type:', typeof statsToProcess[key]);
          });
        }
        
        // Process the stats
        const flattenedStats = flattenNestedStats(statsToProcess);
        console.log('Flattened stats:', flattenedStats);
        console.log('Flattened stats count:', Object.keys(flattenedStats).length);
        
        const playerStatsData: PlayerStats = {};
        Object.entries(flattenedStats).forEach(([key, value]) => {
          if (typeof value === 'number') {
            playerStatsData[key] = value;
          }
        });
        
        console.log('Final processed stats:', playerStatsData);
        setPlayerStats(playerStatsData);
        
        // Calculate level info
        const playtimeTicks = playerStatsData.play_time || 0;
        const playtimeHours = Math.floor(playtimeTicks / 72000);
        const totalXp = playtimeHours * 100 || 0;
        const levelData = await calculateLevelInfo(totalXp);
        setLevelInfo(levelData);
        
        console.log('Level data calculated:', levelData);
        
      } catch (error) {
        console.error('Error in loadPlayerData:', error);
        setPlayerStats({});
        setLevelInfo(null);
      } finally {
        setLoading(false);
        console.log('=== LOADING COMPLETE ===');
      }
    };

    loadPlayerData();
  }, [user?.id]);

  const convertStatValue = (statName: string, rawValue: number): number => {
    switch (statName) {
      case 'play_time':
        // Convert ticks to hours (20 ticks per second, 3600 seconds per hour)
        return Math.floor(rawValue / 72000);
      case 'walk_one_cm':
      case 'sprint_one_cm':
      case 'ride_boat_one_cm':
        // Convert centimeters to blocks (100 cm = 1 block)
        return Math.floor(rawValue / 100);
      case 'blocksPlaced':
      case 'blocksBroken':
      case 'mobKills':
      case 'diamond_ore_mined':
      case 'fishing_rod_used':
      case 'oak_log_mined':
      case 'netherite_sword_used':
      case 'bow_used':
        // These are already in the correct units
        return rawValue;
      default:
        return rawValue;
    }
  };

  const getAchievementState = (achievementId: string, tier: number) => {
    const achievement = achievementDefinitions.find(a => a.id === achievementId);
    if (!achievement) return { state: 'locked', data: null };

    const tierData = achievement.tiers.find(t => t.tier === tier);
    if (!tierData) return { state: 'locked', data: null };

    const rawValue = typeof playerStats[achievement.stat] === 'number' ? playerStats[achievement.stat] as number : 0;
    const displayValue = convertStatValue(achievement.stat, rawValue);
    
    // Debug logging for achievement calculations
    console.log(`Achievement ${achievementId} tier ${tier}:`, {
      stat: achievement.stat,
      rawValue,
      displayValue,
      threshold: tierData.threshold,
      qualifies: displayValue >= tierData.threshold
    });
    
    // Check if player qualifies for this tier
    const qualifies = displayValue >= tierData.threshold;
    
    if (!qualifies) {
      return { state: 'locked', data: null };
    }

    // Check if this tier is claimable
    const claimableAchievement = claimableAchievements.find(
      ca => ca.achievement_id === achievementId && ca.tier_number === tier
    );

    if (claimableAchievement && claimableAchievement.is_claimable) {
      return { state: 'claimable', data: claimableAchievement };
    }

    return { state: 'unlocked', data: null };
  };

  const handleClaimAchievement = async (tierId: string) => {
    if (!profile?.minecraft_username) return;
    
    // Find the player profile to get the correct ID
    const { players } = await fetchPlayersFromNewStructure({ limit: 1000, offset: 0 });
    const playerProfile = players.find(p => 
      p.username.toLowerCase() === profile.minecraft_username?.toLowerCase()
    );
    
    if (!playerProfile) {
      console.error('Player not found for claiming achievement');
      return;
    }
    
    const result = await claimAchievement(playerProfile.id, tierId);
    if (result.success) {
      // Refresh data
      window.location.reload();
    }
  };

  const claimableCount = claimableAchievements.filter(ca => ca.is_claimable).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements & Leveling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug section - show if no stats are found
  if (Object.keys(playerStats).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements & Leveling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No player stats found</p>
            <div className="text-left text-sm bg-muted p-4 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {user?.id || 'None'}</p>
              <p>Player UUID: {localStorage.getItem("player_uuid") || 'None'}</p>
              <p>Player Name: {localStorage.getItem("player_name") || 'None'}</p>
              <p>Stats Count: {Object.keys(playerStats).length}</p>
              <p>Level Info: {levelInfo ? 'Available' : 'None'}</p>
              <p>Can Claim: {canClaim ? 'Yes' : 'No'}</p>
              <p>Note: Check console for detailed debugging</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Achievements & Leveling
          {canClaim && claimableCount > 0 && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              {claimableCount} to claim!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leveling">Leveling</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Level Display */}
            {levelInfo && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{levelInfo.title}</h3>
                    <p className="text-gray-600">{levelInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: levelInfo.color }}>
                      {levelInfo.level}
                    </div>
                    <div className="text-sm text-gray-500">Level</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next level</span>
                    <span>{Math.round(levelInfo.progress)}%</span>
                  </div>
                  <Progress value={levelInfo.progress} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{levelInfo.xpInCurrentLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP</span>
                    <span>Total: {levelInfo.totalXp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {achievementDefinitions.length}
                </div>
                <div className="text-sm text-muted-foreground">Achievement Types</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {claimableCount}
                </div>
                <div className="text-sm text-muted-foreground">Ready to Claim</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {levelInfo?.totalXp.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {levelInfo?.level || 1}
                </div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {achievementDefinitions.map((achievement) => (
              <div key={achievement.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center`}>
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>

                <div className="grid gap-3 pl-4">
                  {achievement.tiers.map((tier) => {
                    const { state, data } = getAchievementState(achievement.id, tier.tier);
                    const IconComponent = tier.icon;
                    
                    const rawValue = typeof playerStats[achievement.stat] === 'number' ? playerStats[achievement.stat] as number : 0;
                    const displayValue = convertStatValue(achievement.stat, rawValue);
                    const progress = Math.min((displayValue / tier.threshold) * 100, 100);

                    return (
                      <div
                        key={tier.tier}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all duration-300",
                          state === 'claimable' && "border-yellow-400 bg-yellow-50 shadow-lg ring-2 ring-yellow-200",
                          state === 'unlocked' && "border-green-200 bg-green-50",
                          state === 'locked' && "border-gray-200 bg-gray-50 opacity-75"
                        )}
                      >
                        {/* Pulsing effect for claimable achievements */}
                        {state === 'claimable' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-lg animate-pulse" />
                        )}

                        <div className="relative flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            state === 'claimable' && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
                            state === 'unlocked' && "bg-green-500 text-white",
                            state === 'locked' && "bg-gray-300 text-gray-600"
                          )}>
                            {state === 'claimable' && <Sparkles className="w-5 h-5" />}
                            {state === 'unlocked' && <CheckCircle className="w-5 h-5" />}
                            {state === 'locked' && <Lock className="w-5 h-5" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{tier.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {tier.points} XP
                              </Badge>
                              {state === 'claimable' && (
                                <Badge className="bg-yellow-500 text-white animate-bounce text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Ready!
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tier.description}</p>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress: {displayValue.toLocaleString()} / {tier.threshold.toLocaleString()} ({Math.round(progress)}%)</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>

                          {/* Claim button for claimable achievements */}
                          {state === 'claimable' && canClaim && data && (
                            <ClaimButton
                              onClaim={() => handleClaimAchievement(data.tier_id)}
                              isLoading={isLoading}
                              className="shrink-0"
                            >
                              Hold to Claim
                            </ClaimButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="leveling" className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Level Progression</h3>
              
              {levelInfo && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2" style={{ color: levelInfo.color }}>
                      {levelInfo.title}
                    </div>
                    <p className="text-gray-600 mb-4">{levelInfo.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{levelInfo.level}</div>
                        <div className="text-sm text-muted-foreground">Current Level</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{levelInfo.xpInCurrentLevel.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">XP in Level</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{levelInfo.totalXp.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total XP</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress to Level {levelInfo.level + 1}</span>
                      <span>{Math.round(levelInfo.progress)}%</span>
                    </div>
                    <Progress value={levelInfo.progress} className="h-4" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{levelInfo.xpInCurrentLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP</span>
                      <span>{levelInfo.xpForNextLevel - levelInfo.xpInCurrentLevel} XP needed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to Level Up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Complete Achievements</div>
                      <div className="text-sm text-muted-foreground">Earn XP by claiming achievements</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Set Goals</div>
                      <div className="text-sm text-muted-foreground">Focus on specific achievement types</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Stay Active</div>
                      <div className="text-sm text-muted-foreground">Regular playtime increases your level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Level Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Prestige</div>
                      <div className="text-sm text-muted-foreground">Show off your experience level</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Recognition</div>
                      <div className="text-sm text-muted-foreground">Get recognized by the community</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Status</div>
                      <div className="text-sm text-muted-foreground">Higher levels unlock special features</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommunityAchievements; 