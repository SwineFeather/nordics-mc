import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { usePlayerProfileByUsername } from '@/hooks/usePlayerProfileByUsername';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';
import PlayerProfile from '@/components/PlayerProfile';
import type { PlayerProfile as PlayerProfileType } from '@/types/player';

const PlayerProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PlayerProfileType | null>(null);
  
  // Fetch player profile by username
  const { profile: fetchedProfile, loading, error } = usePlayerProfileByUsername(username || '');
  const { data: residentData } = usePlayerResidentData(username || '');

  useEffect(() => {
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    }
  }, [fetchedProfile]);

  const handleClose = () => {
    navigate('/community');
  };

  const handleProfileUpdate = () => {
    // Refresh the profile data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/community')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
            
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Player Not Found</h1>
                <p className="text-muted-foreground mb-4">
                  The player "{username}" could not be found or doesn't exist.
                </p>
                <Button onClick={() => navigate('/community')}>
                  Return to Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={handleClose}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
          
          <PlayerProfile
            profile={profile}
            onClose={handleClose}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfilePage;
