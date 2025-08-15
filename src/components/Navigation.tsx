
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, Info, Users, ShoppingBag, Building, Building2, Store, Crown, MapPin, Menu, X, Search, Settings, LogOut, User, ChevronDown, TrendingUp, Clock, Star } from 'lucide-react';
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
import { AuthModal } from './AuthModal';
import NotificationBell from './NotificationBell';
import PlayerStatsDetail from './community/PlayerStatsDetail';
import SettingsModal from './SettingsModal';
import { SearchDialog } from './search/SearchDialog';
import { SearchSuggestionsService } from '@/services/searchSuggestionsService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerProfileByUsername } from '@/hooks/usePlayerProfileByUsername';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
  const location = useLocation();
  const { user, profile } = useAuth();
  
  // Fetch player profile if user has minecraft_username
  const { profile: playerProfile, loading: playerProfileLoading } = usePlayerProfileByUsername(
    profile?.minecraft_username ? profile.minecraft_username : ''
  );

  // Fetch trending searches for quick search preview
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const trending = await SearchSuggestionsService.getTrendingSearches();
        setTrendingSearches(trending.slice(0, 3));
      } catch (error) {
        console.error('Error fetching trending searches:', error);
      }
    };

    if (showQuickSearch) {
      fetchTrendingSearches();
    }
  }, [showQuickSearch]);

  // --- New Navigation Structure ---
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    if (href === '/guide') {
      return location.pathname.startsWith('/guide');
    }
    return location.pathname.startsWith(href);
  };

  // --- Desktop Navigation ---
  const navItems = [
    { href: '/community', label: 'Community' },
    { href: '/forum', label: 'Forum' },
    { href: '/map', label: 'Map' },
    { href: '/wiki', label: 'Wiki' },
    { href: '/store', label: 'Store' },
  ];

  const isMarketsActive = () => {
    return location.pathname.startsWith('/markets');
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
            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['/community','/community/players','/community/towns','/community/nations'].some(isActive) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Community <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-44 z-[60] bg-popover border shadow-lg">
                <DropdownMenuLabel>Community</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/community/players">Players</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/community/towns">Towns</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/community/nations">Nations</Link>
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
                  <Link to="/markets/shops"><Store className="inline h-4 w-4 mr-2 align-text-bottom" />Shops</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/markets/businesses">Business Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/markets/groups">Enterprises</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['/guide','/forum','/map','/store','/rules','/wiki'].some(isActive) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <Book className="h-4 w-4 mr-1" />
                  Resources <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 z-[60] bg-popover border shadow-lg">
                <DropdownMenuLabel>Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/guide"><BookOpen className="inline h-4 w-4 mr-2 align-text-bottom" />Guide</Link>
                </DropdownMenuItem>
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
            {/* Search Button with Quick Search Preview */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                onMouseEnter={() => setShowQuickSearch(true)}
                onMouseLeave={() => setShowQuickSearch(false)}
                className="hidden md:flex"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Quick Search Preview */}
              {showQuickSearch && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Quick Search</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchOpen(true)}
                      className="h-6 px-2 text-xs"
                    >
                      Open Full Search
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {trendingSearches.map((trending, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchOpen(true);
                          // The search dialog will handle the search term
                        }}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-3"
                      >
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{trending.term}</div>
                          <div className="text-xs text-muted-foreground">
                            {trending.count} searches • {trending.category}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {trending.trend === 'up' ? '↗' : trending.trend === 'down' ? '↘' : '→'}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">Popular Searches</div>
                    <div className="flex flex-wrap gap-1">
                      {['nations', 'towns', 'companies', 'wiki'].map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchOpen(true);
                            // The search dialog will handle the search term
                          }}
                          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors capitalize"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  to="/guide"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/guide') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="inline h-4 w-4 mr-2 align-text-bottom" />Guide
                </Link>
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
              <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

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

