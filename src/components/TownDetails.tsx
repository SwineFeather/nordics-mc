import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MapPin, 
  Crown, 
  Calendar, 
  Building, 
  Plus,
  MessageCircle,
  Star,
  Home,
  Landmark,
  Store,
  Edit,
  Image,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TownDetailsProps {
  town: {
    name: string;
    mayor: string;
    population: number;
    type: string;
    status: string;
    founded?: string;
    nation: string;
    nationColor: string;
  };
  onClose: () => void;
}

const TownDetails = ({ town, onClose }: TownDetailsProps) => {
  const { user, profile } = useAuth();
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [newBuilding, setNewBuilding] = useState('');
  const [newNews, setNewNews] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Get town profile picture URL
  const getTownProfilePicture = () => {
    // If town has a custom image URL, use it
    if ((town as any).image_url) {
      return (town as any).image_url;
    }
    
    // Otherwise, generate the default URL using normalized filename
    const baseUrl = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/towns/';
    const cleanName = town.name.toLowerCase().replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '_');
    return `${baseUrl}${cleanName}.png`;
  };

  // Mock data for town details
  const townData = {
    description: `${town.name} is a ${town.type.toLowerCase()} known for its ${town.name === 'Normannburg' ? 'communist ideals and collective prosperity' : town.name === 'Garvia' ? 'beautiful architecture and skilled builders' : 'unique character and community spirit'}.`,
    coordinates: '(150, 64, 200)',
    landmarks: [
      'Town Hall',
      'Market Square',
      'Community Center',
      ...(town.name === 'Garvia' ? ['Fishing Hut', 'Church of Garvia', 'Cometfall Crossroads'] : []),
      ...(town.name === 'Normannburg' ? ['Presidential Palace', 'Red Square', 'Workers\' Memorial'] : [])
    ],
    buildings: [
      { name: 'Town Hall', owner: town.mayor, type: 'Government' },
      { name: 'Market District', owner: 'Public', type: 'Commerce' },
      { name: 'Residential Quarter', owner: 'Various', type: 'Housing' }
    ],
    news: [
      { date: '2025-06-10', author: town.mayor, content: `Welcome to ${town.name}! We're always looking for new residents.` },
      { date: '2025-06-08', author: 'Town Council', content: 'New infrastructure project approved for the town center.' }
    ],
    residents: [
      { name: town.mayor, role: 'Mayor', joinDate: '2024-01-01' },
      { name: 'Resident1', role: 'Citizen', joinDate: '2024-02-15' },
      { name: 'Resident2', role: 'Citizen', joinDate: '2024-03-10' }
    ]
  };

  const isResident = user && townData.residents.some(r => r.name === user.email?.split('@')[0]);

  const handleAddBuilding = () => {
    if (newBuilding.trim()) {
      // In real app, this would save to database
      console.log('Adding building:', newBuilding);
      setNewBuilding('');
      setShowAddBuilding(false);
    }
  };

  const handleAddNews = () => {
    if (newNews.trim()) {
      // In real app, this would save to database
      console.log('Adding news:', newNews);
      setNewNews('');
      setShowAddNews(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-background border rounded-3xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pr-12">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={getTownProfilePicture()} 
                  alt={town.name}
                  onError={(e) => {
                    // Fallback to town name initials if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                  {town.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold gradient-text">{town.name}</h1>
                <p className="text-muted-foreground">
                  {town.type} • {town.nation} • Population: {town.population}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          {/* Town Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-medium">Leadership</span>
                </div>
                <p>Mayor: {town.mayor}</p>
                <p className="text-sm text-muted-foreground">Since {town.founded || 'Unknown'}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span className="font-medium">Location</span>
                </div>
                <p>{townData.coordinates}</p>
                <p className="text-sm text-muted-foreground">Status: {town.status}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="font-medium">Community</span>
                </div>
                <p>{town.population} residents</p>
                <Badge className={`${town.nationColor} bg-current/20 mt-1`}>
                  {town.nation}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                About {town.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{townData.description}</p>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Landmarks */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Landmark className="w-5 h-5 mr-2" />
                    Notable Landmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {townData.landmarks.map((landmark, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span>{landmark}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Buildings */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Buildings
                    </CardTitle>
                    {isResident && (
                      <Dialog open={showAddBuilding} onOpenChange={setShowAddBuilding}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Building</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Building Name</Label>
                              <Input 
                                value={newBuilding}
                                onChange={(e) => setNewBuilding(e.target.value)}
                                placeholder="e.g., Blacksmith Shop"
                              />
                            </div>
                            <Button onClick={handleAddBuilding} className="w-full">
                              Add Building
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {townData.buildings.map((building, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                        <div>
                          <span className="font-medium">{building.name}</span>
                          <p className="text-sm text-muted-foreground">Owner: {building.owner}</p>
                        </div>
                        <Badge variant="secondary">{building.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Residents */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Residents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {townData.residents.map((resident, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {resident.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{resident.name}</p>
                          <p className="text-sm text-muted-foreground">{resident.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Town News */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Town News
                    </CardTitle>
                    {isResident && (
                      <Dialog open={showAddNews} onOpenChange={setShowAddNews}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Post Town News</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>News Content</Label>
                              <Textarea 
                                value={newNews}
                                onChange={(e) => setNewNews(e.target.value)}
                                placeholder="Share news with your town..."
                                rows={3}
                              />
                            </div>
                            <Button onClick={handleAddNews} className="w-full">
                              Post News
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {townData.news.map((news, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{news.author}</span>
                          <span className="text-xs text-muted-foreground">{news.date}</span>
                        </div>
                        <p className="text-sm">{news.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownDetails;
