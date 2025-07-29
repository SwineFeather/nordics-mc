
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';

interface PlayerContactProps {
  profile: PlayerProfile;
  isAuthenticated: boolean;
  onContactClick: () => void;
}

const PlayerContact = ({ profile, isAuthenticated, onContactClick }: PlayerContactProps) => {
  const canBeContacted = profile.discord || (profile.isWebsiteUser && profile.websiteUserId);

  if (!canBeContacted) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.discord && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discord:</span>
            <span className="font-medium">{profile.discord}</span>
          </div>
        )}
        {profile.isWebsiteUser && profile.websiteUserId && isAuthenticated && (
          <Button variant="outline" className="w-full" onClick={onContactClick}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        )}
        {profile.isWebsiteUser && profile.websiteUserId && !isAuthenticated && (
          <Button variant="outline" className="w-full" onClick={onContactClick} title="Log in to send messages">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message (Log in required)
          </Button>
        )}
        {!profile.isWebsiteUser && (
          <p className="text-sm text-muted-foreground">This player cannot be contacted via the website.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerContact;
