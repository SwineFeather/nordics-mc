import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings } from 'lucide-react';
import PlayerProfileHeader from './player-profile/PlayerProfileHeader';
import PlayerStatusCards from './player-profile/PlayerStatusCards';
import PlayerBio from './player-profile/PlayerBio';
import PlayerContact from './player-profile/PlayerContact';
import PlayerPoliticalInfo from './player-profile/PlayerPoliticalInfo';
import PlayerStats from './player-profile/PlayerStats';
import PlayerAchievements from './player-profile/PlayerAchievements';
import AllStatsModal from '@/components/community/AllStatsModal';
import AllAchievementsModal from './player-profile/AllAchievementsModal';
import AdminBadgeManager from './AdminBadgeManager';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges, usePlayerVerificationStatus } from '@/hooks/usePlayerBadges';
import { usePlayerAllStats } from '@/hooks/usePlayerAllStats';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import type { PlayerProfile } from '@/types/player';

interface PlayerProfileProps {
  profile: PlayerProfile;
  onClose: () => void;
  onProfileUpdate?: () => void;
}

const PlayerProfile = ({ profile, onClose, onProfileUpdate }: PlayerProfileProps) => {
  const { userRole } = useAuth();
  const [showAllStats, setShowAllStats] = useState(false);
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  
  const { data: badges } = usePlayerBadges(profile.id);
  const { data: verificationStatus } = usePlayerVerificationStatus(profile.id);
  
  const { flatStats, statsWithMeta, loading: statsLoading } = usePlayerAllStats(profile.id);
  
  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  
  // Get the primary badge (highest priority)
  const primaryBadge = badges?.find(b => b.is_verified) || badges?.[0];
  
  // Safely parse verification status
  const parsedVerificationStatus = verificationStatus as {
    badge_type?: string;
    badge_color?: string;
    is_verified?: boolean;
  } | null;
  
  const badgeType = primaryBadge?.badge_type || parsedVerificationStatus?.badge_type || 'Player';
  const badgeColor = primaryBadge?.badge_color || parsedVerificationStatus?.badge_color || '#6b7280';
  const isVerified = primaryBadge?.is_verified || parsedVerificationStatus?.is_verified || false;

  // Fallback for legacy keys if missing
  const legacyStats = {
    blocksPlaced: flatStats.blocksPlaced ?? flatStats['blocksPlaced'] ?? 0,
    blocksBroken: flatStats.blocksBroken ?? flatStats['blocksBroken'] ?? 0,
    mobKills: flatStats.mobKills ?? flatStats['mobKills'] ?? 0,
    balance: flatStats.balance ?? flatStats['balance'] ?? 0,
    itemsCrafted: flatStats.itemsCrafted ?? flatStats['itemsCrafted'] ?? 0,
    itemsDropped: flatStats.itemsDropped ?? flatStats['itemsDropped'] ?? 0,
    itemsPickedUp: flatStats.itemsPickedUp ?? flatStats['itemsPickedUp'] ?? 0,
    medalPoints: flatStats.medalPoints ?? flatStats['medalPoints'] ?? 0,
    goldMedals: flatStats.goldMedals ?? flatStats['goldMedals'] ?? 0,
    silverMedals: flatStats.silverMedals ?? flatStats['silverMedals'] ?? 0,
    bronzeMedals: flatStats.bronzeMedals ?? flatStats['bronzeMedals'] ?? 0,
  };

  const handleContactClick = () => {
    // Handle contact functionality - could open a modal or redirect
    console.log('Contact clicked for:', profile.username);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle>Player Profile</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    style={{ backgroundColor: badgeColor, color: 'white' }}
                    className="text-xs"
                  >
                    {badgeType}
                  </Badge>
                  {isVerified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBadgeManager(true)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Badges
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="info">Player Info</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <TabsContent value="overview" className="space-y-6 mt-6">
                <PlayerProfileHeader profile={profile} />
                <PlayerStatusCards profile={profile} />
                <PlayerBio bio={profile.bio} />
                <PlayerContact 
                  profile={profile} 
                  isAuthenticated={true} 
                  onContactClick={handleContactClick} 
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <PlayerStats 
                  stats={{ ...legacyStats, ...flatStats }}
                  onViewAllStats={() => setShowAllStats(true)}
                  loading={statsLoading}
                />
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <PlayerAchievements 
                  achievements={profile.achievements || []}
                  playerStats={profile.stats}
                  playerUuid={profile.id}
                  playerUsername={profile.username}
                  onProfileUpdate={onProfileUpdate}
                />
              </TabsContent>

              <TabsContent value="info" className="mt-6">
                <PlayerPoliticalInfo profile={profile} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {showAllStats && (
          <AllStatsModal
            statsWithMeta={statsWithMeta}
            loading={statsLoading}
            onClose={() => setShowAllStats(false)}
          />
        )}

        {showBadgeManager && (
          <AdminBadgeManager
            playerUuid={profile.id}
            playerName={profile.username}
            isOpen={showBadgeManager}
            onClose={() => setShowBadgeManager(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerProfile;
