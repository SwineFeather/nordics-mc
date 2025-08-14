
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  MapPin, 
  Calendar, 
  Crown, 
  Trophy, 
  MessageSquare,
  Shield,
  Star,
  Clock,
  Pickaxe,
  Sword,
  Skull,
  Building,
  Coins,
  X,
  AlertTriangle,
  Footprints,
  Swords,
  ChevronDown,
} from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import ContactModal from './ContactModal';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';
import ProfileSettings from './ProfileSettings';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile?: PlayerProfile;
}

const ProfileModal = ({ open, onClose, profile }: ProfileModalProps) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const { isAuthenticated, profile: currentUserProfile } = useAuth();
  const { onlinePlayers } = useOnlinePlayers();
  
  // Check if this player is online
  const isPlayerOnline = onlinePlayers.some(player => 
    player.name && typeof player.name === 'string' && 
    player.name.toLowerCase() === profile?.username.toLowerCase()
  );

  if (!profile) return null;

  const isAdmin = currentUserProfile?.role === 'admin';
  const canEditProfile = isAdmin && profile.websiteUserId;

  const getRoleIcon = (serverRole?: string) => {
    switch (serverRole) {
      case 'Owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'Moderator': return <Star className="w-4 h-4 text-blue-500" />;
      case 'Helper': return <User className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (serverRole?: string) => {
    switch (serverRole) {
      case 'Owner': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Admin': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'Moderator': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'Helper': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getProfileAvatar = () => {
    if (profile.avatar) return profile.avatar;
    return `https://minotar.net/helm/${profile.minecraft_username || profile.username}/100.png`;
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to send messages.");
      return;
    }
    if (profile.isWebsiteUser && profile.websiteUserId) {
      console.log('Contact button clicked for:', profile.username, 'Receiver ID:', profile.websiteUserId);
      setShowContactModal(true);
    } else {
      toast.info("This player cannot be contacted through the website.");
    }
  };

  // Helper function to safely get numeric values
  const getNumericStat = (value: number | { [key: string]: number } | undefined): number => {
    if (typeof value === 'number') return value;
    return 0;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getProfileAvatar()} />
                  <AvatarFallback>
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{profile.displayName || profile.username}</h2>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(profile.serverRole)}
                    <Badge className={`text-xs ${getRoleBadgeColor(profile.serverRole)}`}>
                      {profile.serverRole || 'Member'}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${isPlayerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-sm text-muted-foreground">
                      {isPlayerOnline ? 'Online' : `Last seen ${new Date(profile.lastSeen).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEditProfile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProfileSettings(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Joined: {new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    {profile.nation && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Nation: {profile.nation}</span>
                      </div>
                    )}
                    {profile.town && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Town: {profile.town}</span>
                      </div>
                    )}
                    {profile.role && (
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Role: {profile.role}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {profile.bio || 'No bio available.'}
                    </p>
                    {profile.discord && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Discord: {profile.discord}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
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

            <TabsContent value="achievements" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {profile.achievements.map((achievement) => (
                  <Dialog key={`${achievement.achievementId}-${achievement.tier}`}>
                    <DialogTrigger asChild>
                      <div className="flex flex-col items-center text-center w-20 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                        <achievement.icon className="w-8 h-8 mb-1 text-primary" />
                        <span className="text-xs font-semibold leading-tight">{achievement.name}</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <achievement.icon className="w-6 h-6 mr-3 text-primary" />
                          {achievement.achievementName} - Tier {achievement.tier}
                        </DialogTitle>
                        <DialogDescription>
                          {achievement.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm font-medium">
                              <span>Progress</span>
                              <span>
                                  {achievement.currentValue.toLocaleString()} / {achievement.threshold.toLocaleString()}
                              </span>
                          </div>
                          <Progress value={Math.min(100, (achievement.currentValue / achievement.threshold) * 100)} />
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                {profile.achievements.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">No achievements yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Send Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Send a direct message to {profile.displayName || profile.username}
                    </p>
                    {isAuthenticated && profile.isWebsiteUser && profile.websiteUserId ? (
                      <Button 
                        onClick={handleContactClick}
                        className="rounded-xl"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    ) : !isAuthenticated ? (
                       <Button 
                        onClick={handleContactClick}
                        className="rounded-xl"
                        title="Log in to send messages"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Log In to Send Message
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">This player cannot be contacted via the website.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showContactModal && profile.websiteUserId && (
        <ContactModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          receiverId={profile.websiteUserId}
          playerName={profile.displayName || profile.username}
          context={`Player Profile: ${profile.displayName || profile.username}`}
        />
      )}

      {showProfileSettings && profile.websiteUserId && (
        <ProfileSettings
          open={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          editUserId={profile.websiteUserId}
        />
      )}
    </>
  );
};

export default ProfileModal;
