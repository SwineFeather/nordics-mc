import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatStatValue } from '@/utils/statsValidation';
import { AllAchievementsModal } from '@/components/player-profile/AllAchievementsModal';
import { PlayerProfile } from '@/types/playerProfile';

interface StatItemProps {
  label: string;
  value: string | number;
  format?: 'number' | 'time' | 'percentage';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, format = 'number' }) => {
  const formattedValue = formatStatValue(Number(value), format);

  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{formattedValue}</span>
    </div>
  );
};

interface PlayerStats {
  playtimeHours: number;
  blocksPlaced: number;
  blocksBroken: number;
  deaths: number;
  mobKills: number;
  jumps: number;
  damageDealt: number;
  balance: number;
  medalPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  survivalStreak: number;
}

interface PlayerStatsDetailProps {
  player: PlayerProfile;
  onClose: () => void;
}

export const PlayerStatsDetail = ({ player, onClose }: PlayerStatsDetailProps) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);

  const loadPlayerStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_uuid', player.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPlayerStats(data as PlayerStats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load player stats');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('unlocked_achievements')
        .select('*')
        .eq('player_uuid', player.id);

      if (error) {
        console.error('Error loading achievements:', error);
      } else {
        setUnlockedAchievements(data || []);
      }
    } catch (err: any) {
      console.error('Error loading achievements:', err);
    }
  };

  useEffect(() => {
    loadPlayerStats();
    loadPlayerAchievements();
  }, [player.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {player.minecraft_username || player.full_name || 'Unknown Player'}
          </CardTitle>
          <CardDescription>
            Detailed statistics and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://mc-heads.net/avatar/${player.minecraft_username}/64.png`} alt={player.minecraft_username || 'Avatar'} />
              <AvatarFallback>{player.minecraft_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{player.minecraft_username}</h3>
              <p className="text-sm text-muted-foreground">
                {player.role || 'Member'}
              </p>
            </div>
          </div>

          {loading && <p>Loading player stats...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {playerStats && (
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="p-4">
                <StatItem label="Playtime" value={playerStats.playtimeHours} format="time" />
                <StatItem label="Blocks Placed" value={playerStats.blocksPlaced} />
                <StatItem label="Blocks Broken" value={playerStats.blocksBroken} />
                <StatItem label="Deaths" value={playerStats.deaths} />
                <StatItem label="Mob Kills" value={playerStats.mobKills} />
                <StatItem label="Jumps" value={playerStats.jumps} />
                <StatItem label="Damage Dealt" value={playerStats.damageDealt} />
                <StatItem label="Balance" value={playerStats.balance} />
                <StatItem label="Medal Points" value={playerStats.medalPoints} />
                <StatItem label="Gold Medals" value={playerStats.goldMedals} />
                <StatItem label="Silver Medals" value={playerStats.silverMedals} />
                <StatItem label="Bronze Medals" value={playerStats.bronzeMedals} />
                <StatItem label="Survival Streak" value={playerStats.survivalStreak} />
              </div>
            </ScrollArea>
          )}

          <Button onClick={() => setShowAllAchievements(true)}>
            View All Achievements
          </Button>
        </CardContent>
      </Card>
      
      <AllAchievementsModal
        isOpen={showAllAchievements}
        onClose={() => setShowAllAchievements(false)}
        playerUuid={player.id}
        playerName={player.minecraft_username || player.full_name || 'Unknown Player'}
        playerStats={playerStats}
        unlockedAchievements={unlockedAchievements}
        onAchievementClaimed={loadPlayerAchievements}
      />
    </div>
  );
};
