import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Star, 
  Coins, 
  MapPin, 
  BookOpen, 
  Settings,
  Home,
  Image as ImageIcon,
  Edit3,
  X,
  Crown,
  Globe,
  MessageCircle,
  UserPlus,
  Camera,
  Building2
} from 'lucide-react';
import TownImageUploadDialog from '@/components/towns/TownImageUploadDialog';
import DynmapEmbed from '@/components/towns/DynmapEmbed';
import TownPhotoGallery from '@/components/towns/TownPhotoGallery';
import { TownProfilePicture } from '@/components/towns/TownProfilePicture';
import { SupabaseTownService, SupabaseTownData, TownResident } from '@/services/supabaseTownService';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PlayerStatsDetail from '@/components/community/PlayerStatsDetail';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { TownDescriptionService } from '@/services/townDescriptionService';
import EnhancedWikiEditor from '@/components/wiki/EnhancedWikiEditor';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import TownCompaniesSection from '@/components/towns/TownCompaniesSection';
import TownCompaniesCount from '@/components/towns/TownCompaniesCount';

const TownPage = () => {
  const { townName } = useParams<{ townName: string }>();
  const navigate = useNavigate();
  const [townData, setTownData] = useState<SupabaseTownData | null>(null);
  const [residents, setResidents] = useState<TownResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMap, setShowMap] = useState(true);

  const [showGallery, setShowGallery] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('supabase');

  const [selectedPlayerUsername, setSelectedPlayerUsername] = useState<string | null>(null);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  
  // Use the same profiles hook as the community page
  const { profiles, getProfileByUsername } = useProfiles({ fetchAll: true });
  const { user, userRole, profile } = useAuth();

  useEffect(() => {
    const fetchTownData = async () => {
      if (!townName) {
        setError('Town name is required');
        setLoading(false);
        return;
      }

      console.log('Fetching town data:', decodeURIComponent(townName));

      try {
        setLoading(true);
        setError(null);

        // Fetch town data from Supabase
        const townResult = await SupabaseTownService.getTown(decodeURIComponent(townName));

        if (!townResult) {
          setError('Town not found');
          setLoading(false);
          return;
        }

        setTownData(townResult);
        setResidents(townResult.residents || []);
        setDescriptionDraft(townResult.description || '');
        setDataSource('supabase');


      } catch (err) {
        console.error('Error fetching town data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch town data');
      } finally {
        setLoading(false);
      }
    };

    fetchTownData();
  }, [townName]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown';
    }
  };







  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading town data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !townData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">🏘️</div>
            <h1 className="text-2xl font-bold mb-2">Town Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || 'The requested town could not be found.'}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Requested: {townName ? decodeURIComponent(townName) : 'No town name'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/towns')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Towns
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/towns')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Towns
            </Button>
          </div>



          {/* Town Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <TownProfilePicture 
                townName={townData.name}
                className="h-64 w-64 object-cover"
                imageUrl={(townData as any).image_url}
              />
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{townData.name}</h1>
                  <Badge className={townData.capital ? 'bg-yellow-600' : 'bg-blue-600'}>
                    {townData.capital ? 'Capital' : 'Town'}
                  </Badge>
                  <Badge className={townData.public ? 'bg-green-600' : 'bg-gray-600'}>
                    {townData.public ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Mayor: 
                    <button
                      className="font-medium hover:underline text-left ml-1"
                      onClick={() => {
                        // Navigate to community page with mayor parameter
                        navigate(`/community?player=${encodeURIComponent(townData.mayor)}`);
                      }}
                    >
                      {townData.mayor}
                    </button>
                  </Badge>
                  {townData.nation && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {townData.nation.name}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {townData.capital ? 'Capital city' : 'Town'} in {townData.nation?.name || 'Unknown Nation'} with {townData.resident_count} residents.
                </p>
              </div>
            </div>


          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Request to Join
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                // Attempt to open chat with the mayor's linked website account
                // Strategy:
                // 1) Use residents list (has mayor name/uuid) to resolve website user via profiles table by minecraft_username
                // 2) If not found, navigate to community profile as fallback
                const mayorName = townData.mayor;
                if (!mayorName) return;
                (async () => {
                  try {
                    const { data, error } = await (await import('@/integrations/supabase/client')).supabase
                      .from('profiles')
                      .select('id')
                      .eq('minecraft_username', mayorName)
                      .single();
                    if (!error && data?.id) {
                      navigate(`/messages?with=${encodeURIComponent(data.id)}`);
                    } else {
                      navigate(`/community?player=${encodeURIComponent(mayorName)}`);
                    }
                  } catch {
                    navigate(`/community?player=${encodeURIComponent(mayorName)}`);
                  }
                })();
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Message Mayor
            </Button>
            {/* Only show Update Image button if user is the mayor or has admin privileges */}
            {(townData?.mayor === profile?.minecraft_username || userRole === 'admin' || userRole === 'moderator') && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowImageUploadDialog(true)}
              >
                <ImageIcon className="w-4 h-4" />
                Update Image
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm font-medium">
              <Home className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 text-sm font-medium">
              <Camera className="w-4 h-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Companies
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Town Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Population</p>
                      <p className="text-lg font-bold truncate">{townData.resident_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Founded</p>
                      <p className="text-lg font-bold truncate">{new Date(townData.created).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Plots</p>
                      <p className="text-lg font-bold truncate">{townData.plots?.[0]?.count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-lg font-bold truncate">${(townData.balance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Companies</p>
                      <p className="text-lg font-bold truncate">
                        <TownCompaniesCount townId={parseInt(townData.id)} />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Town Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Town Description
                  {(townData?.mayor === profile?.minecraft_username || userRole === 'admin' || userRole === 'moderator') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingDescription) {
                          setEditingDescription(false);
                        } else {
                          setDescriptionDraft(townData.description || '');
                          setEditingDescription(true);
                        }
                      }}
                      className="ml-auto"
                    >
                      {editingDescription ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingDescription ? (
                  <div className="max-w-4xl mx-auto">
                    <EnhancedWikiEditor
                      page={{ 
                        content: descriptionDraft, 
                        title: townData.name, 
                        status: 'published', 
                        updatedAt: '', 
                        authorName: '', 
                        id: townData.id,
                        slug: townData.name.toLowerCase().replace(/\s+/g, '-'),
                        authorId: profile?.id || '',
                        createdAt: townData.created_at,
                        category: null,
                        order: 0
                      }}
                      userRole={userRole === 'admin' || userRole === 'moderator' ? 'admin' : 'member'}
                      isEditing={true}
                      onSave={async (updates) => {
                        setSavingDescription(true);
                        const success = await TownDescriptionService.updateTownDescription(parseInt(townData.id), updates.content || '');
                        setSavingDescription(false);
                        if (success) {
                          setEditingDescription(false);
                          setDescriptionDraft(updates.content || '');
                          // Refresh town data to get updated description
                          const updatedTown = await SupabaseTownService.getTown(decodeURIComponent(townName || ''));
                          if (updatedTown) {
                            setTownData(updatedTown);
                          }
                        }
                      }}
                      onToggleEdit={() => setEditingDescription(false)}
                      autoSaveEnabled={false}
                      onAutoSaveToggle={() => {}}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-4xl mx-auto px-4">
                    {townData.description ? (
                      <SimpleMarkdownRenderer content={townData.description} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium mb-2">No description yet</p>
                        <p className="text-sm">
                          {profile?.minecraft_username === townData.mayor || userRole === 'admin' || userRole === 'moderator'
                            ? 'Add a description to tell visitors about your town!'
                            : 'This town hasn\'t added a description yet.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Residents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Residents ({residents.length})
                  {dataSource === 'mock' && (
                    <Badge variant="secondary" className="text-xs">
                      Mock Data
                    </Badge>
                  )}

                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {residents.map((resident) => (
                    <div key={resident.uuid} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://mc-heads.net/avatar/${resident.name}/100`} alt={resident.name} />
                        <AvatarFallback>{resident.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            className="font-medium truncate hover:underline text-left"
                            onClick={() => {
                              // Navigate to community page with player parameter
                              navigate(`/community?player=${encodeURIComponent(resident.name)}`);
                            }}
                          >
                            {resident.name}
                          </button>
                          {resident.is_mayor && (
                            <Badge variant="default" className="bg-yellow-600 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Mayor
                            </Badge>
                          )}
                          {resident.is_king && (
                            <Badge variant="default" className="bg-purple-600 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              King
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined: {new Date(resident.joined).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last online: {new Date(resident.last_online).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedPlayerUsername && (() => {
                  const selectedProfile = getProfileByUsername(selectedPlayerUsername);
                  return selectedProfile ? (
                    <PlayerStatsDetail
                      profile={selectedProfile}
                      onClose={() => setSelectedPlayerUsername(null)}
                    />
                  ) : (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                      <div className="bg-white dark:bg-card p-8 rounded-lg shadow-lg flex flex-col items-center">
                        <div className="text-muted-foreground mb-4">Player profile not found.</div>
                        <button className="text-sm underline" onClick={() => setSelectedPlayerUsername(null)}>Close</button>
                      </div>
                    </div>
                  );
                })()}
                {dataSource === 'mock' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-800">
                      <span className="font-medium">Note:</span>
                      <span>Showing mock data. The real API may be unavailable or experiencing CORS issues.</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Map View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Live Map View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynmapEmbed 
                  townName={townData.name}
                  coordinates={{ x: townData.spawn.x, z: townData.spawn.z }}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Town Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Town Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{townData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{townData.capital ? 'Capital' : 'Town'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{townData.public ? 'Public' : 'Private'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mayor:</span>
                        <button
                          className="font-medium hover:underline text-left"
                          onClick={() => {
                            // Navigate to community page with mayor parameter
                            navigate(`/community?player=${encodeURIComponent(townData.mayor)}`);
                          }}
                        >
                          {townData.mayor}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span className="font-medium">{new Date(townData.created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open:</span>
                        <span className="font-medium">{townData.open ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {townData.nation && (
                    <div>
                      <h4 className="font-semibold mb-2">Nation Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nation:</span>
                          <span className="font-medium">{townData.nation.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capital:</span>
                          <span className="font-medium">{townData.nation.capital}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="font-medium">${(townData.nation.balance || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Population:</span>
                        <span className="font-medium">{townData.resident_count} residents</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Plots:</span>
                        <span className="font-medium">{townData.plots?.[0]?.count || 0}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-medium">${(townData.balance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">World:</span>
                        <span className="font-medium">{townData.spawn.world}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-medium">{townData.spawn.x.toFixed(1)}, {townData.spawn.z.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>



          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photo Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TownPhotoGallery townName={townData.name} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Town Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TownCompaniesSection townId={parseInt(townData.id)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Town Image Upload Dialog */}
      <TownImageUploadDialog
        isOpen={showImageUploadDialog}
        onClose={() => setShowImageUploadDialog(false)}
        townId={townData.id}
        townName={townData.name}
        currentImageUrl={(townData as any).image_url}
        onImageUpdated={(imageUrl) => {
          // Update the town data with the new image URL
          setTownData(prev => prev ? { ...prev, image_url: imageUrl } : null);
        }}
      />
    </div>
  );
};

export default TownPage; 