
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Calendar, Building, Newspaper, HelpCircle, Lightbulb, Wrench, Users, TrendingUp, Clock, Info, Crown, Anchor, Droplets, Star, Shield } from 'lucide-react';
import { useForumCategories } from '@/hooks/useForumCategories';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionButton } from './SubscriptionButton';
import { supabase } from '@/integrations/supabase/client';
import { useNationForumAccess } from '@/hooks/useNationForumAccess';
import { PlayerTownService } from '@/services/playerTownService';

import { TownProfilePicture } from '@/components/towns/TownProfilePicture';

interface ForumCategoriesProps {
  onCategorySelect: (categoryId: string) => void;
  onCreatePost: () => void;
}

const iconMap = {
  'message-square': MessageSquare,
  'calendar': Calendar,
  'building': Building,
  'newspaper': Newspaper,
  'help-circle': HelpCircle,
  'lightbulb': Lightbulb,
  'wrench': Wrench,
  'users': Users,
  'trending-up': TrendingUp,
  'clock': Clock,
  'crown': Crown,
  'anchor': Anchor,
  'droplets': Droplets,
  'star': Star,
};

const ForumCategories = ({ onCategorySelect, onCreatePost }: ForumCategoriesProps) => {
  const { user, profile } = useAuth();
  const { categories, loading } = useForumCategories();
  const { userNation, userNationForums, isAdmin, isModerator, hasAccessToForum, loading: nationLoading } = useNationForumAccess();
  

  const [unreadByCategory, setUnreadByCategory] = useState<Record<string, boolean>>({});
  const [playerRole, setPlayerRole] = useState<{ isMayor: boolean; isKing: boolean } | null>(null);

  // Helper function to format nation names
  const formatNationName = (nationName: string): string => {
    return nationName.replace(/_/g, ' ');
  };

  // Check if user can access all forums (admin/moderator)
  const canAccessAllForums = isAdmin || isModerator;

  const fetchUnread = async () => {
    if (!user) return;
    // Fetch unread reply notifications for the user
    const { data, error } = await supabase
      .from('forum_notifications' as any)
      .select('id, post_id, read_at, notification_type, post:forum_posts(category_id)')
      .eq('user_id', user.id)
      .is('read_at', null)
      .eq('notification_type', 'reply');
    if (error) return;
    // Group by category_id
    const byCategory: { [categoryId: string]: boolean } = {};
    (data || []).forEach((notif: any) => {
      const catId = notif.post?.category_id;
      if (catId) byCategory[catId] = true;
    });
    setUnreadByCategory(byCategory);
  };

  const fetchPlayerRole = async () => {
    if (!profile?.minecraft_username) return;
    
    try {
      const playerData = await PlayerTownService.getPlayerTownData(profile.minecraft_username);
      if (playerData) {
        setPlayerRole({
          isMayor: playerData.isMayor,
          isKing: playerData.isKing
        });
      }
    } catch (error) {
      console.error('Error fetching player role:', error);
    }
  };

  useEffect(() => {
    fetchUnread();
    fetchPlayerRole();
  }, [user, profile]);

  // Separate categories by type
  const generalCategories = categories.filter(cat => 
    cat.role_required === 'member' && 
    !cat.nation_name &&
    !cat.town_name &&
    !cat.is_archived
  );
  
  // Nation forums - show user's nation or all if admin/moderator
  const nationCategories = categories.filter(cat => 
    cat.nation_name && 
    !cat.town_name &&
    !cat.is_archived &&
    (canAccessAllForums || (userNation && cat.nation_name === userNation))
  ).filter((cat, index, self) => 
    index === self.findIndex(c => c.id === cat.id)
  );
  
  // Town forums - show user's nation towns or all if admin/moderator
  const townForums = categories.filter(cat => 
    cat.nation_name && 
    cat.town_name &&
    !cat.is_archived &&
    (canAccessAllForums || (userNation && cat.nation_name === userNation))
  ).filter((cat, index, self) => 
    index === self.findIndex(c => c.id === cat.id)
  );
  
  const moderatorCategories = categories.filter(cat => cat.role_required === 'moderator' && !cat.is_archived);
  


  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || MessageSquare;
  };

  const renderTownIcon = (townName: string, nationColor: string) => {
    return (
      <div 
        className="p-2 rounded-lg flex items-center justify-center w-9 h-9"
        style={{ backgroundColor: nationColor + '20' }}
      >
        <TownProfilePicture 
          townName={townName}
          className="w-10 h-10 object-contain"
        />
      </div>
    );
  };

  const renderNationIcon = (nationName: string, nationColor: string) => {
    // Use a simple approach with the DynamicImageService directly
    const imageUrl = `https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/nations/${nationName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    
    return (
      <div 
        className="p-2 rounded-lg flex items-center justify-center w-9 h-9"
        style={{ backgroundColor: nationColor + '20' }}
      >
        <img
          src={imageUrl}
          alt={`${nationName} flag`}
          className="w-10 h-10 object-contain rounded"
          onError={(e) => {
            // Fallback to crown icon if nation image doesn't exist
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        {/* Fallback Crown Icon */}
        <Crown className="w-10 h-10 hidden" style={{ color: nationColor }} />
      </div>
    );
  };

  const getNationIcon = (nationName: string) => {
    const nationIcons: { [key: string]: any } = {
      'Skyward Sanctum': Crown,
      'North_Sea_League': Anchor,
      'Kesko Corporation': Building,
      'Aqua Union': Droplets,
      'Constellation': Star,
    };
    return nationIcons[nationName] || Crown;
  };

  const getNationColor = (nationName: string) => {
    const nationColors: { [key: string]: string } = {
      'Skyward Sanctum': '#3b82f6',
      'North_Sea_League': '#059669',
      'Kesko Corporation': '#f59e0b',
      'Aqua Union': '#0ea5e9',
      'Constellation': '#8b5cf6',
    };
    return nationColors[nationName] || '#3b82f6';
  };

  if (loading || nationLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Main Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Discussion Categories</h2>
          {/* Creating a post requires a category; button removed from categories view */}
        </div>
        
        <div className="grid gap-4">
          {generalCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            
            return (
              <Card 
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => onCategorySelect(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadByCategory[category.id] && (
                        <Badge variant="destructive" className="text-xs">
                          New
                        </Badge>
                      )}
                      <SubscriptionButton 
                        subscriptionType="category"
                        targetId={category.id}
                        targetName={category.name}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    {category.post_count || 0} posts
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Nation Forums Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-semibold">Nation Forums</h2>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Crown className="w-4 h-4" />
            <span>Private forums for nation members</span>
          </div>
        </div>

        {/* Show user's nation forum if they have one, or all nations if admin/moderator */}
        {nationCategories.length > 0 && (
          <div className="grid gap-4">
            {nationCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const isUserNation = userNation === category.nation_name;
              
              return (
                <Card 
                  key={category.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:border-blue-900 dark:from-blue-950 dark:to-indigo-950 dark:hover:from-blue-900 dark:hover:to-indigo-900"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderNationIcon(category.nation_name, getNationColor(category.nation_name))}
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {formatNationName(category.nation_name)} Forum
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isAdmin && (
                          <Badge variant="default" className="bg-red-600 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {isModerator && !isAdmin && (
                          <Badge variant="default" className="bg-orange-600 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Moderator
                          </Badge>
                        )}
                        {isUserNation && !isAdmin && !isModerator && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Your Nation
                          </Badge>
                        )}
                        {playerRole?.isKing && (
                          <Badge variant="default" className="bg-purple-600 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            King
                          </Badge>
                        )}
                        {playerRole?.isMayor && !playerRole?.isKing && (
                          <Badge variant="default" className="bg-yellow-600 text-xs">
                            <Building className="w-3 h-3 mr-1" />
                            Mayor
                          </Badge>
                        )}
                        {unreadByCategory[category.id] && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                        <SubscriptionButton 
                          subscriptionType="category"
                          targetId={category.id}
                          targetName={category.name}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      {category.post_count || 0} posts
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Show town forums within user's nation */}
        {townForums.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {canAccessAllForums ? 'All Town Forums' : 'Town Forums'}
            </h3>
            <div className="grid gap-4">
              {townForums.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                const isUserMayor = userNationForums?.towns.find(town => town.name === category.town_name)?.isUserMayor;
                const isUserNation = userNation === category.nation_name;
                
                return (
                  <Card 
                    key={category.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:border-green-900 dark:from-green-950 dark:to-emerald-950 dark:hover:from-green-900 dark:hover:to-emerald-900"
                    onClick={() => onCategorySelect(category.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {renderTownIcon(category.town_name, getNationColor(category.nation_name))}
                          <div>
                            <CardTitle className="text-lg font-semibold text-foreground">
                              {category.name}
                            </CardTitle>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAdmin && (
                            <Badge variant="default" className="bg-red-600 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {isModerator && !isAdmin && (
                            <Badge variant="default" className="bg-orange-600 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Moderator
                            </Badge>
                          )}
                          {isUserMayor && !isAdmin && !isModerator && (
                            <Badge variant="outline" className="text-xs">
                              <Building className="w-3 h-3 mr-1" />
                              Your Town
                            </Badge>
                          )}
                          {isUserNation && !isAdmin && !isModerator && !isUserMayor && (
                            <Badge variant="secondary" className="text-xs dark:bg-blue-900 dark:text-blue-100">
                              Your Nation
                            </Badge>
                          )}
                          {unreadByCategory[category.id] && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                          <SubscriptionButton 
                            subscriptionType="category"
                            targetId={category.id}
                            targetName={category.name}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground">
                        {category.post_count || 0} posts
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Show message for users without a nation (but not for admins/moderators) */}
        {!userNation && user && !isAdmin && !isModerator && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-900">Join a Nation to Access Private Forums</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You need to be a member of a nation to access private nation and town forums. 
                    Contact a nation leader or mayor to join their nation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Staff Categories */}
      {moderatorCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold text-foreground">Official Updates</h2>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Staff members only</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            {moderatorCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              
              return (
                <Card 
                  key={category.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950 dark:to-amber-950"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg font-semibold text-foreground">
                              {category.name}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Staff Only
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadByCategory[category.id] && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                        <SubscriptionButton 
                          subscriptionType="category"
                          targetId={category.id}
                          targetName={category.name}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{category.post_count || 0} posts</span>
                        {category.last_activity && (
                          <span>Last activity: {new Date(category.last_activity).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumCategories;




