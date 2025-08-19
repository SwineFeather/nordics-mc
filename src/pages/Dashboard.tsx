
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

        {/* Account Setup Section for TokenLink Users */}
        {needsEmailSetup && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Shield className="w-5 h-5" />
                  Complete Your Account Setup
                </CardTitle>
                <CardDescription className="text-orange-700">
                  You're currently logged in via TokenLink authentication from Minecraft
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-800">Limited access from other devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-800">Can't reset password if lost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-800">No email notifications</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleOpenSettings('upgrade')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Setup Email & Password
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/home')}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Continue to Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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

        {/* Continue to Website Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Ready to explore?
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Continue to the main website to access all features
              </p>
              <Button 
                onClick={() => navigate('/home')}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue to Website
              </Button>
            </CardContent>
          </Card>
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
