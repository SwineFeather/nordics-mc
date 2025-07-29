
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';

interface PlayerStatusCardsProps {
  profile: PlayerProfile;
}

const PlayerStatusCards = ({ profile }: PlayerStatusCardsProps) => {
  const { data: residentData } = usePlayerResidentData(profile.username);
  const joinedDate = residentData?.registered || profile.joinDate;
  const location = residentData?.town_name || profile.town || 'Wanderer';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-sm text-muted-foreground">Joined</div>
          <div className="font-medium">{new Date(joinedDate).toLocaleDateString()}</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
          <div className="text-sm text-muted-foreground">Last Active</div>
          <div className="font-medium">{new Date(profile.lastSeen).toLocaleDateString()}</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-accent" />
          <div className="text-sm text-muted-foreground">Location</div>
          <div className="font-medium">{location}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStatusCards;
