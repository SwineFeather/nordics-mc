
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Book, Info, Users, ShoppingBag, Building, Building2, Store, Crown, MapPin, Menu, X, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NordicsLogo from './NordicsLogo';
import { ThemeToggle } from './ThemeToggle';
import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';
import PlayerStatsDetail from './community/PlayerStatsDetail';
import SettingsModal from './SettingsModal';
import { SearchDialog } from './search/SearchDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();
  
  // Fetch player profile if user has minecraft_username
  const { profile: playerProfile, loading: playerProfileLoading } = usePlayerProfile(
    profile?.minecraft_username ? profile.minecraft_username : ''
  );

  // --- New Navigation Structure ---
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(href);
  };

  // --- Desktop Navigation ---
  const navItems = [
    { href: '/nyrvalos', label: 'Nyrvalos' },
    { href: '/community', label: 'Community' },
    { href: '/forum', label: 'Forum' },
    { href: '/map', label: 'Map' },
    { href: '/wiki', label: 'Wiki' },
    { href: '/store', label: 'Store' },
  ];

  const isMarketsActive = () => {
    return location.pathname.startsWith('/towns/groups') || 
           location.pathname.startsWith('/towns/businesses') || 
           location.pathname.startsWith('/towns/shops');
  };


  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email;
    return 'User';
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <NordicsLogo className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-foreground">Nordics</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Logo is already on the left */}
            <Link
              to="/nyrvalos"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/nyrvalos') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              Nyrvalos
            </Link>
            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['/community','/towns/towns','/towns/nations'].some(isActive) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Community <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-44 z-[60] bg-popover border shadow-lg">
                <DropdownMenuLabel>Community</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/community">Players</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/towns/towns">Towns</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/towns/nations">Nations</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Markets Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['/towns/shops','/towns/businesses','/towns/groups'].some(isActive) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Markets <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-44 z-[60] bg-popover border shadow-lg">
                <DropdownMenuLabel>Markets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/towns/shops"><Store className="inline h-4 w-4 mr-2 align-text-bottom" />Shops</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/towns/businesses">Business Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/towns/groups">Enterprises</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['/forum','/map','/store','/rules','/wiki'].some(isActive) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <Book className="h-4 w-4 mr-1" />
                  Resources <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 z-[60] bg-popover border shadow-lg">
                <DropdownMenuLabel>Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/wiki"><Info className="inline h-4 w-4 mr-2 align-text-bottom" />Wiki</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/forum"><Book className="inline h-4 w-4 mr-2 align-text-bottom" />Forum</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/map">Map</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/store">Store</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/rules">Rules</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex"
            >
              <Search className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            {user && <NotificationBell />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[60] bg-popover border shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthOpen(true)} variant="default" size="sm">
                Sign In
              </Button>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setSearchOpen(true);
                  setIsOpen(false);
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Link
                to="/nyrvalos"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/nyrvalos') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                onClick={() => setIsOpen(false)}
              >
                Nyrvalos
              </Link>
              {/* Community Dropdown (as section) */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Community
                </div>
                <Link
                  to="/community"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/community') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Players
                </Link>
                <Link
                  to="/towns/towns"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/towns/towns') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Towns
                </Link>
                <Link
                  to="/towns/nations"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/towns/nations') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Nations
                </Link>
              </div>
              {/* Markets Dropdown (as section) */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Markets
                </div>
                <Link
                  to="/towns/shops"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/towns/shops') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Store className="inline h-4 w-4 mr-2 align-text-bottom" />Shops
                </Link>
                <Link
                  to="/towns/businesses"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/towns/businesses') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Business Listings
                </Link>
                <Link
                  to="/towns/groups"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/towns/groups') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Enterprises
                </Link>
              </div>
              {/* Resources Dropdown (as section) */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Resources
                </div>
                <Link
                  to="/wiki"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/wiki') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Info className="inline h-4 w-4 mr-2 align-text-bottom" />Wiki
                </Link>
                <Link
                  to="/forum"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/forum') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Book className="inline h-4 w-4 mr-2 align-text-bottom" />Forum
                </Link>
                <Link
                  to="/map"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/map') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Map
                </Link>
                <Link
                  to="/store"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/store') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Store
                </Link>
                <div className="my-2" />
                <Link
                  to="/rules"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/rules') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  Rules
                </Link>
              </div>
              {/* Mobile Auth */}
              {!user && (
                <Button 
                  onClick={() => {
                    setAuthOpen(true);
                    setIsOpen(false);
                  }} 
                  className="w-full mt-2"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      {/* Auth Modal */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {/* Player Profile Modal */}
      {user && profileOpen && (
        <PlayerStatsDetail 
          profile={playerProfile || {
            id: profile?.id || 'unknown',
            username: profile?.minecraft_username || profile?.full_name || 'Unknown Player',
            displayName: profile?.full_name || 'Unknown Player',
            avatar: `https://mc-heads.net/avatar/${profile?.minecraft_username || profile?.id}/100`,
            joinDate: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isOnline: false,
            isWebsiteUser: true,
            bio: profile?.bio || '',
            stats: {
              playtimeHours: 0,
              blocksPlaced: 0,
              blocksBroken: 0,
              deaths: 0,
              mobKills: 0,
              jumps: 0,
              damageDealt: 0
            },
            achievements: [],
            levelInfo: { level: 1, totalXp: 0, xpInCurrentLevel: 0, xpForNextLevel: 100, progress: 0 },
            serverRole: 'Member'
          }}
          onClose={() => setProfileOpen(false)} 
        />
      )}

      {/* Settings Modal */}
      {user && (
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </nav>
  );
};

export default Navigation;

