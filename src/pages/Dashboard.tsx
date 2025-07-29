
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Calendar, 
  Clock, 
  Mail, 
  LogOut, 
  Trophy,
  Settings,
  AlertCircle,
  ExternalLink,
  Shield,
  ArrowUp,
  Key,
  UserCog
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SettingsModal from "@/components/SettingsModal";
import ProfileUrlShare from "@/components/ProfileUrlShare";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  minecraft_username?: string;
  bio?: string;
  avatar_url?: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [needsEmailSetup, setNeedsEmailSetup] = useState(false);
  const navigate = useNavigate();
  const { signOut, isAuthenticated, user, profile: authProfile, isTokenLinkUser } = useAuth();

  useEffect(() => {
    const tokenLinkProfileId = localStorage.getItem("tokenlink_profile_id");
    const playerUuid = localStorage.getItem("player_uuid");
    const playerName = localStorage.getItem("player_name");
    const profileData = localStorage.getItem("profile");

    console.log('Dashboard loading with TokenLink data:', {
      hasProfileId: !!tokenLinkProfileId,
      hasUuid: !!playerUuid,
      hasName: !!playerName,
      hasProfile: !!profileData,
      isAuthenticated,
      hasAuthProfile: !!authProfile
    });

    // Check if user is authenticated (either through TokenLink or regular auth)
    if (!isAuthenticated && (!playerUuid || !playerName)) {
      console.log('No authentication found, redirecting to login');
      navigate("/");
      return;
    }

    // Use auth profile if available, otherwise fall back to TokenLink data
    if (authProfile) {
      console.log('Using auth profile:', authProfile);
      setProfile(authProfile);
      
      // Check if user needs to set up email/password (TokenLink users with @tokenlink.local email)
      const isTokenLinkEmail = authProfile.email?.includes('@tokenlink.local');
      setNeedsEmailSetup(isTokenLinkEmail);
    } else if (profileData) {
      try {
        const parsedProfile = JSON.parse(profileData);
        console.log('Loaded TokenLink profile:', parsedProfile);
        setProfile(parsedProfile);
        
        // Check if user needs to set up email/password
        const isTokenLinkEmail = parsedProfile.email?.includes('@tokenlink.local');
        setNeedsEmailSetup(isTokenLinkEmail);
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    } else if (playerUuid && playerName) {
      // Create basic profile from stored data
      const basicProfile = {
        id: tokenLinkProfileId || playerUuid,
        email: playerName + '@tokenlink.local',
        full_name: playerName,
        role: 'member',
        minecraft_username: playerName
      };
      setProfile(basicProfile);
      setNeedsEmailSetup(true);
    }

    setLoading(false);
  }, [navigate, isAuthenticated, authProfile]);

  const handleLogout = async () => {
    console.log('Logging out user');
    
    // Clear TokenLink data
    localStorage.removeItem("tokenlink_profile_id");
    localStorage.removeItem("player_uuid");
    localStorage.removeItem("player_name");
    localStorage.removeItem("profile");
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    navigate("/");
  };

  const handleViewProfile = () => {
    const playerName = profile?.minecraft_username || localStorage.getItem("player_name");
    if (playerName) {
      navigate(`/community?player=${encodeURIComponent(playerName)}`);
    }
  };

  const handleOpenSettings = (tab: string = 'profile') => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const playerName = profile?.minecraft_username || localStorage.getItem("player_name") || "Unknown Player";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {playerName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your account and explore the community
          </p>
        </div>

        {/* Account Upgrade Alert for TokenLink users */}
        {isTokenLinkUser && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <ArrowUp className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">Upgrade Your Account</p>
                  <p className="text-blue-700">
                    Add email and password authentication for enhanced security and full website access.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenSettings('upgrade')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Account Setup Alert */}
        {needsEmailSetup && !isTokenLinkUser && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Complete your account setup by adding an email and password for enhanced security.</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenSettings('security')}
                >
                  Setup Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Minecraft Username</label>
                      <p className="text-lg font-semibold mt-1">{profile.minecraft_username || profile.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1 font-mono">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                      <div className="flex items-center mt-1">
                        <Shield className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">
                          {isTokenLinkUser ? 'TokenLink' : 'Standard'}
                        </span>
                        {isTokenLinkUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Can be upgraded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile URL Share Component */}
            <ProfileUrlShare playerName={playerName} />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={handleViewProfile}
                >
                  <User className="w-4 h-4 mr-2" />
                  View My Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/community")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Community
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/forum")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Forum
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleOpenSettings('profile')}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleOpenSettings('notifications')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </Button>
                {isTokenLinkUser && (
                  <Button 
                    variant="default" 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleOpenSettings('upgrade')}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade Account
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    {isTokenLinkUser ? 'Strengthen your TokenLink account:' : 'Manage your account security:'}
                  </p>
                  <ul className="space-y-1 text-xs">
                    {isTokenLinkUser ? (
                      <>
                        <li>• Add a secure email address</li>
                        <li>• Set a strong password</li>
                        <li>• Enable full website features</li>
                      </>
                    ) : (
                      <>
                        <li>• Change your password</li>
                        <li>• Update your email address</li>
                        <li>• Manage account security</li>
                      </>
                    )}
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleOpenSettings('security')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        open={showSettings} 
        onClose={() => setShowSettings(false)}
        defaultTab={settingsTab}
      />
    </div>
  );
};

export default Dashboard;
