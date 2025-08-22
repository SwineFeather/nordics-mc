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
  Building2,
  Flag,
  Plus
} from 'lucide-react';
import { SupabaseTownService, SupabaseNationData, SupabaseTownData } from '@/services/supabaseTownService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

import EnhancedWikiEditor from '@/components/wiki/EnhancedWikiEditor';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import { useNationImage } from '@/hooks/useDynamicImage';
import NationImageUploadDialog from '@/components/towns/NationImageUploadDialog';
import EditNationModal from '@/components/towns/EditNationModal';
import NationPhotoGallery from '@/components/towns/NationPhotoGallery';
import NationCollaborationManager from '@/components/towns/NationCollaborationManager';
import { usePageTitle } from '@/hooks/usePageTitle';

const NationPage = () => {
  const { nationName } = useParams<{ nationName: string }>();
  const navigate = useNavigate();
  
  // Use the page title hook to set dynamic titles
  usePageTitle();
  
  const [nationData, setNationData] = useState<SupabaseNationData | null>(null);
  const [towns, setTowns] = useState<SupabaseTownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const [editingLore, setEditingLore] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [mottoDraft, setMottoDraft] = useState('');
  const [loreDraft, setLoreDraft] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingMotto, setSavingMotto] = useState(false);
  const [savingLore, setSavingLore] = useState(false);
  
  const { user, userRole, profile } = useAuth();

  // Use dynamic image service for nation images
  const { imageUrl, isLoading: imageLoading, error: imageError } = useNationImage(
    nationData?.name || '', 
    nationData?.image_url
  );

  // Function to refresh nation data
  const refreshNationData = async () => {
    if (nationName) {
      try {
        const updatedNation = await SupabaseTownService.getNationByName(decodeURIComponent(nationName));
        if (updatedNation) {
          setNationData(updatedNation);
          setDescriptionDraft(updatedNation.description || '');
          setMottoDraft(updatedNation.motto || '');
          setLoreDraft(updatedNation.lore || '');
        }
      } catch (error) {
        console.error('Error refreshing nation data:', error);
      }
    }
  };

  useEffect(() => {
    const fetchNationData = async () => {
      if (!nationName) {
        setError('Nation name is required');
        setLoading(false);
        return;
      }

      console.log('Fetching nation data:', decodeURIComponent(nationName));

      try {
        setLoading(true);
        setError(null);

        // Fetch nation data from Supabase
        const nationResult = await SupabaseTownService.getNationByName(decodeURIComponent(nationName));

        if (!nationResult) {
          setError('Nation not found');
          setLoading(false);
          return;
        }

        setNationData(nationResult);
        setDescriptionDraft(nationResult.description || '');
        setMottoDraft(nationResult.motto || '');
        setLoreDraft(nationResult.lore || '');

        // Fetch towns in this nation
        const townsResult = await SupabaseTownService.getTownsByNation(nationResult.id);
        setTowns(townsResult || []);

      } catch (err) {
        console.error('Error fetching nation data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch nation data');
      } finally {
        setLoading(false);
      }
    };

    fetchNationData();
  }, [nationName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nationData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error || 'Nation not found'}</p>
            <Button onClick={() => navigate('/towns/nations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Nations
            </Button>
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
            <Button variant="outline" onClick={() => navigate('/towns/nations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Nations
            </Button>
          </div>

          {/* Nation Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                {imageLoading ? (
                  <div className="h-64 w-64 bg-muted animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <img
                    src={imageUrl || '/placeholder.svg'}
                    alt={`${nationData.name} flag`}
                    className="h-64 w-64 object-contain rounded-2xl border-4 border-border shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                )}
                
                {/* Image Upload Button - Only show for nation leaders */}
                {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nationData.leader_name) && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-2 right-2 bg-background/90 hover:bg-background"
                    onClick={() => setShowImageUploadDialog(true)}
                    title="Upload nation image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Crown 
                      className="w-8 h-8" 
                      style={{ 
                        color: nationData.theme_color || '#eab308',
                        fill: nationData.theme_color || '#eab308'
                      }}
                    />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground">{nationData.name.replace(/_/g, ' ')}</h1>
                </div>
                
                <p className="text-lg text-muted-foreground mb-4">
                  {nationData.description || nationData.board || ''}
                </p>
                
                {/* Board Text (from ingame - read only) */}
                {nationData.board && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Nation Board (from ingame)</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{nationData.board}"</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {nationData.population} citizens
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nationData.towns_count || towns.length} towns
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Founded: {nationData.founded}
                  </div>
                  
                  {/* Edit Nation Button - Only show for nation leaders and staff */}
                  {(profile?.full_name === nationData.king_name || userRole === 'admin' || userRole === 'moderator') && (
                    <div className="ml-auto">
                      <EditNationModal 
                        nation={nationData}
                        onNationUpdated={refreshNationData}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
            <TabsTrigger value="towns" className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Towns
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Nation Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Population</p>
                      <p className="text-lg font-bold truncate">{nationData.population}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Towns</p>
                      <p className="text-lg font-bold truncate">{nationData.towns_count || towns.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-auto min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Treasury</p>
                      <p className="text-lg font-bold truncate">${nationData.bank}</p>
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
                      <p className="text-lg font-bold truncate">{nationData.founded}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nation Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Description
                  {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nationData.leader_name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDescription(!editingDescription)}
                      className="ml-auto"
                    >
                      {editingDescription ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
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
                        title: nationData.name, 
                        status: 'published', 
                        updatedAt: '', 
                        authorName: '', 
                        id: nationData.id,
                        slug: nationData.name.toLowerCase().replace(/\s+/g, '-'),
                        authorId: profile?.id || '',
                        createdAt: nationData.created_at,
                        category: null,
                        order: 0
                      }}
                      userRole={userRole === 'admin' || userRole === 'moderator' ? 'admin' : 'member'}
                      isEditing={true}
                      onSave={async (updates) => {
                        setSavingDescription(true);
                        const success = await NationDescriptionService.updateNationDescription(nationData.id, updates.content || '');
                        setSavingDescription(false);
                        if (success) {
                          setEditingDescription(false);
                          setDescriptionDraft(updates.content || '');
                          // Refresh nation data to get updated description
                          refreshNationData();
                        }
                      }}
                      onToggleEdit={() => setEditingDescription(false)}
                      autoSaveEnabled={false}
                      onAutoSaveToggle={() => {}}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-4xl mx-auto px-4">
                    {nationData.description ? (
                      <SimpleMarkdownRenderer content={nationData.description} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium mb-2">No description yet</p>
                        <p className="text-sm">
                          {profile?.full_name === nationData.leader_name || userRole === 'admin' || userRole === 'moderator'
                            ? 'Add a description to tell visitors about your nation!'
                            : 'This nation hasn\'t added a description yet.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nation Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Political Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Leadership</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leader:</span>
                        <button
                          className="font-medium hover:underline text-left"
                          onClick={() => {
                            navigate(`/community?player=${encodeURIComponent(nationData.leader)}`);
                          }}
                        >
                          {nationData.leader}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capital:</span>
                        <span className="font-medium">{nationData.capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Government:</span>
                        <span className="font-medium">{nationData.government_system || 'Monarchy'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ruling Entity:</span>
                        <span className="font-medium">{nationData.ruling_entity || 'Monarch'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Economic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Economy</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Treasury:</span>
                        <span className="font-medium">${nationData.bank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Upkeep:</span>
                        <span className="font-medium">${nationData.daily_upkeep}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Economic System:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{nationData.economic_system || 'Capitalist'}</span>
                          {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nationData.leader_name) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const newValue = prompt('Enter new economic system:', nationData.economic_system || 'Capitalist');
                                if (newValue !== null) {
                                  const success = await NationDescriptionService.updateNationProperty(nationData.id, 'economic_system', newValue);
                                  if (success) {
                                    refreshNationData();
                                  }
                                }
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Allies:</span>
                        <span className="font-medium">{nationData.ally_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lore Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Nation Lore
                  {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nationData.leader_name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLore(!editingLore)}
                      className="ml-auto"
                    >
                      {editingLore ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingLore ? (
                  <div className="max-w-4xl mx-auto">
                    <EnhancedWikiEditor
                      page={{ 
                        content: loreDraft, 
                        title: nationData.name, 
                        status: 'published', 
                        updatedAt: '', 
                        authorName: '', 
                        id: nationData.id,
                        slug: nationData.name.toLowerCase().replace(/\s+/g, '-'),
                        authorId: profile?.id || '',
                        createdAt: nationData.created_at,
                        category: null,
                        order: 0
                      }}
                      userRole={userRole === 'admin' || userRole === 'moderator' ? 'admin' : 'member'}
                      isEditing={true}
                      onSave={async (updates) => {
                        setSavingLore(true);
                        const success = await NationDescriptionService.updateNationLore(nationData.id, updates.content || '');
                        setSavingLore(false);
                        if (success) {
                          setEditingLore(false);
                          setLoreDraft(updates.content || '');
                                                      // Refresh nation data
                            refreshNationData();
                        }
                      }}
                      onToggleEdit={() => setEditingLore(false)}
                      autoSaveEnabled={false}
                      onAutoSaveToggle={() => {}}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-4xl mx-auto">
                    {nationData.lore ? (
                      <SimpleMarkdownRenderer content={nationData.lore} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium mb-2">No lore yet</p>
                        <p className="text-sm">
                          {profile?.full_name === nationData.leader_name || userRole === 'admin' || userRole === 'moderator'
                            ? 'Add lore to tell the story of your nation!'
                            : 'This nation hasn\'t added lore yet.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Nation Specialties
                  </CardTitle>
              </CardHeader>
              <CardContent>
                {nationData.specialties && nationData.specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nationData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No specialties defined yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collaboration Management - Only show for nation leaders and staff */}
            {(profile?.full_name === nationData.king_name || userRole === 'admin' || userRole === 'moderator') && (
              <NationCollaborationManager nationName={nationData.name} />
            )}


          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photo Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NationPhotoGallery nationName={nationData.name} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Towns Tab */}
          <TabsContent value="towns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Towns in {nationData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {towns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium mb-2">No towns found</p>
                    <p className="text-sm">This nation doesn't have any towns yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {towns.map((town) => (
                      <Card key={town.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {town.name}
                            {town.capital && (
                              <Badge variant="default" className="bg-yellow-600 text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Capital
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold">Population:</span>
                              <span>{town.population}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Crown className="w-4 h-4" />
                              <span className="font-semibold">Mayor:</span>
                              <button
                                className="font-medium hover:underline"
                                onClick={() => {
                                  navigate(`/community?player=${encodeURIComponent(town.mayor)}`);
                                }}
                              >
                                {town.mayor}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">Founded:</span>
                              <span>{town.founded}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate(`/town/${encodeURIComponent(town.name)}`)}
                            >
                              View Town
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Nation Image Upload Dialog */}
      <NationImageUploadDialog
        isOpen={showImageUploadDialog}
        onClose={() => setShowImageUploadDialog(false)}
        nationId={nationData.id}
        nationName={nationData.name}
        currentImageUrl={nationData.image_url}
        onImageUpdated={(imageUrl) => {
          setShowImageUploadDialog(false);
          setNationData(prev => prev ? { ...prev, image_url: imageUrl } : null);
        }}
      />
    </div>
  );
};

export default NationPage;
