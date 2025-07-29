import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Palette, 
  FileText, 
  FolderOpen, 
  Trash2, 
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Zap,
  Flame,
  Leaf,
  Trees,
  Mountain,
  Droplets,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Code,
  Database,
  Server,
  Network,
  Camera,
  Video,
  Music,
  Headphones,
  Gamepad2,
  Dice1,
  CreditCard,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  Timer,
  BarChart3,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Compass,
  Navigation,
  Route,
  Map,
  Pin,
  Lightbulb,
  Brain,
  HelpCircle,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Bug,
  Bot,
  Cpu,
  Binary,
  Brush,
  ShoppingCart,
  Store,
  ShoppingBag,
  Wallet,
  DollarSign,
  Coins,
  Utensils,
  Coffee,
  Cake,
  Candy,
  Wine,
  Beer,
  Car,
  Bike,
  Plane,
  Train,
  Ship,
  Rocket,
  Satellite,
  GraduationCap,
  Building,
  Library,
  BookOpen,
  PenTool,
  Pencil,
  Edit,
  Copy,
  Link,
  ExternalLink,
  Ruler,
  Calculator,
  Stethoscope,
  UserCheck,
  Pill,
  Syringe,
  Factory,
  Warehouse,
  Sprout,
  Wheat,
  Flower,
  Wrench,
  Hammer,
  Drill,
  Sunrise,
  Sunset,
  Search,
  Globe,
  MapPin,
  Crown,
  Building2,
  Shield,
  Sword,
  Users,
  Home
} from 'lucide-react';
import { WikiCategory, WikiPage, UserRole, getRolePermissions } from '@/types/wiki';
import { toast } from 'sonner';

// Icon options organized by category
const ICON_OPTIONS = {
  general: [
    { name: 'file-text', icon: FileText, label: 'Document' },
    { name: 'folder-open', icon: FolderOpen, label: 'Folder' },
    { name: 'settings', icon: Settings, label: 'Settings' },
    { name: 'search', icon: Search, label: 'Search' },
    { name: 'eye', icon: Eye, label: 'View' },
    { name: 'eye-off', icon: EyeOff, label: 'Hidden' },
    { name: 'lock', icon: Lock, label: 'Locked' },
    { name: 'unlock', icon: Unlock, label: 'Unlocked' },
  ],
  navigation: [
    { name: 'map-pin', icon: MapPin, label: 'Location' },
    { name: 'globe', icon: Globe, label: 'World' },
    { name: 'compass', icon: Compass, label: 'Compass' },
    { name: 'map', icon: Map, label: 'Map' },
    { name: 'navigation', icon: Navigation, label: 'Navigation' },
    { name: 'route', icon: Route, label: 'Route' },
  ],
  content: [
    { name: 'file-text', icon: FileText, label: 'Document' },
    { name: 'book-open', icon: BookOpen, label: 'Book' },
    { name: 'edit', icon: Edit, label: 'Edit' },
    { name: 'copy', icon: Copy, label: 'Copy' },
    { name: 'link', icon: Link, label: 'Link' },
    { name: 'external-link', icon: ExternalLink, label: 'External' },
  ],
  media: [
    { name: 'camera', icon: Camera, label: 'Camera' },
    { name: 'video', icon: Video, label: 'Video' },
    { name: 'music', icon: Music, label: 'Music' },
    { name: 'headphones', icon: Headphones, label: 'Audio' },
    { name: 'gamepad', icon: Gamepad2, label: 'Gaming' },
  ],
  communication: [
    { name: 'message', icon: MessageSquare, label: 'Message' },
    { name: 'mail', icon: Mail, label: 'Mail' },
    { name: 'phone', icon: Phone, label: 'Phone' },
    { name: 'calendar', icon: Calendar, label: 'Calendar' },
    { name: 'clock', icon: Clock, label: 'Clock' },
  ],
  analytics: [
    { name: 'chart', icon: BarChart3, label: 'Chart' },
    { name: 'bar-chart', icon: BarChart, label: 'Bar Chart' },
    { name: 'pie-chart', icon: PieChart, label: 'Pie Chart' },
    { name: 'trending-up', icon: TrendingUp, label: 'Trending Up' },
    { name: 'trending-down', icon: TrendingDown, label: 'Trending Down' },
    { name: 'activity', icon: Activity, label: 'Activity' },
  ],
  ideas: [
    { name: 'lightbulb', icon: Lightbulb, label: 'Idea' },
    { name: 'brain', icon: Brain, label: 'Brain' },
    { name: 'help', icon: HelpCircle, label: 'Help' },
    { name: 'star', icon: Star, label: 'Star' },
    { name: 'heart', icon: Heart, label: 'Heart' },
  ],
  status: [
    { name: 'check', icon: Check, label: 'Check' },
    { name: 'x', icon: X, label: 'Close' },
    { name: 'alert', icon: AlertTriangle, label: 'Alert' },
    { name: 'info', icon: Info, label: 'Info' },
    { name: 'success', icon: CheckCircle, label: 'Success' },
    { name: 'error', icon: XCircle, label: 'Error' },
    { name: 'bug', icon: Bug, label: 'Bug' },
  ],
  technology: [
    { name: 'code', icon: Code, label: 'Code' },
    { name: 'database', icon: Database, label: 'Database' },
    { name: 'server', icon: Server, label: 'Server' },
    { name: 'network', icon: Network, label: 'Network' },
    { name: 'robot', icon: Bot, label: 'Robot' },
    { name: 'ai', icon: Cpu, label: 'AI' },
    { name: 'binary', icon: Binary, label: 'Binary' },
  ],
  creative: [
    { name: 'palette', icon: Palette, label: 'Palette' },
    { name: 'brush', icon: Brush, label: 'Brush' },
    { name: 'star', icon: Star, label: 'Star' },
    { name: 'heart', icon: Heart, label: 'Heart' },
    { name: 'zap', icon: Zap, label: 'Zap' },
    { name: 'flame', icon: Flame, label: 'Flame' },
  ],
  commerce: [
    { name: 'shopping', icon: ShoppingCart, label: 'Shopping' },
    { name: 'store', icon: Store, label: 'Store' },
    { name: 'wallet', icon: Wallet, label: 'Wallet' },
    { name: 'money', icon: DollarSign, label: 'Money' },
    { name: 'coin', icon: Coins, label: 'Coin' },
  ],
  food: [
    { name: 'food', icon: Utensils, label: 'Food' },
    { name: 'coffee', icon: Coffee, label: 'Coffee' },
    { name: 'cake', icon: Cake, label: 'Cake' },
    { name: 'candy', icon: Candy, label: 'Candy' },
    { name: 'wine', icon: Wine, label: 'Wine' },
    { name: 'beer', icon: Beer, label: 'Beer' },
  ],
  transportation: [
    { name: 'car', icon: Car, label: 'Car' },
    { name: 'bike', icon: Bike, label: 'Bike' },
    { name: 'plane', icon: Plane, label: 'Plane' },
    { name: 'train', icon: Train, label: 'Train' },
    { name: 'ship', icon: Ship, label: 'Ship' },
    { name: 'rocket', icon: Rocket, label: 'Rocket' },
    { name: 'satellite', icon: Satellite, label: 'Satellite' },
  ],
  education: [
    { name: 'school', icon: GraduationCap, label: 'School' },
    { name: 'university', icon: Building, label: 'University' },
    { name: 'library', icon: Library, label: 'Library' },
    { name: 'book', icon: BookOpen, label: 'Book' },
    { name: 'pen', icon: PenTool, label: 'Pen' },
    { name: 'pencil', icon: Pencil, label: 'Pencil' },
    { name: 'ruler', icon: Ruler, label: 'Ruler' },
    { name: 'calculator', icon: Calculator, label: 'Calculator' },
  ],
  health: [
    { name: 'hospital', icon: Building2, label: 'Hospital' },
    { name: 'doctor', icon: Stethoscope, label: 'Doctor' },
    { name: 'nurse', icon: UserCheck, label: 'Nurse' },
    { name: 'medicine', icon: Pill, label: 'Medicine' },
    { name: 'syringe', icon: Syringe, label: 'Syringe' },
  ],
  buildings: [
    { name: 'house', icon: Home, label: 'House' },
    { name: 'building', icon: Building2, label: 'Building' },
    { name: 'office', icon: Building2, label: 'Office' },
    { name: 'factory', icon: Factory, label: 'Factory' },
    { name: 'warehouse', icon: Warehouse, label: 'Warehouse' },
    { name: 'shop', icon: Store, label: 'Shop' },
    { name: 'restaurant', icon: Utensils, label: 'Restaurant' },
  ],
  nature: [
    { name: 'leaf', icon: Leaf, label: 'Leaf' },
    { name: 'trees', icon: Trees, label: 'Trees' },
    { name: 'mountain', icon: Mountain, label: 'Mountain' },
    { name: 'sun', icon: Sun, label: 'Sun' },
    { name: 'moon', icon: Moon, label: 'Moon' },
    { name: 'cloud', icon: Cloud, label: 'Cloud' },
    { name: 'garden', icon: Sprout, label: 'Garden' },
    { name: 'farm', icon: Wheat, label: 'Farm' },
    { name: 'plant', icon: Flower, label: 'Plant' },
  ],
  tools: [
    { name: 'tool', icon: Wrench, label: 'Tool' },
    { name: 'hammer', icon: Hammer, label: 'Hammer' },
    { name: 'drill', icon: Drill, label: 'Drill' },
    { name: 'wrench', icon: Wrench, label: 'Wrench' },
  ],
  time: [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'sunrise', icon: Sunrise, label: 'Sunrise' },
    { name: 'sunset', icon: Sunset, label: 'Sunset' },
  ],
};

// Color options organized by category
const COLOR_OPTIONS = {
  primary: [
    { name: 'blue', value: '#3b82f6', label: 'Blue' },
    { name: 'indigo', value: '#6366f1', label: 'Indigo' },
    { name: 'purple', value: '#8b5cf6', label: 'Purple' },
    { name: 'pink', value: '#ec4899', label: 'Pink' },
    { name: 'red', value: '#ef4444', label: 'Red' },
    { name: 'orange', value: '#f97316', label: 'Orange' },
    { name: 'yellow', value: '#eab308', label: 'Yellow' },
    { name: 'lime', value: '#84cc16', label: 'Lime' },
    { name: 'green', value: '#22c55e', label: 'Green' },
    { name: 'emerald', value: '#10b981', label: 'Emerald' },
    { name: 'teal', value: '#14b8a6', label: 'Teal' },
    { name: 'cyan', value: '#06b6d4', label: 'Cyan' },
  ],
  secondary: [
    { name: 'slate', value: '#64748b', label: 'Slate' },
    { name: 'gray', value: '#6b7280', label: 'Gray' },
    { name: 'zinc', value: '#71717a', label: 'Zinc' },
    { name: 'neutral', value: '#737373', label: 'Neutral' },
    { name: 'stone', value: '#78716c', label: 'Stone' },
  ],
  accent: [
    { name: 'rose', value: '#f43f5e', label: 'Rose' },
    { name: 'amber', value: '#f59e0b', label: 'Amber' },
    { name: 'violet', value: '#7c3aed', label: 'Violet' },
    { name: 'fuchsia', value: '#d946ef', label: 'Fuchsia' },
    { name: 'sky', value: '#0ea5e9', label: 'Sky' },
  ],
  neutral: [
    { name: 'white', value: '#ffffff', label: 'White' },
    { name: 'black', value: '#000000', label: 'Black' },
    { name: 'transparent', value: 'transparent', label: 'Transparent' },
  ],
  semantic: [
    { name: 'success', value: '#10b981', label: 'Success' },
    { name: 'warning', value: '#f59e0b', label: 'Warning' },
    { name: 'error', value: '#ef4444', label: 'Error' },
    { name: 'info', value: '#3b82f6', label: 'Info' },
  ],
};

interface WikiItemSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WikiCategory | WikiPage | null;
  itemType: 'category' | 'page';
  userRole?: UserRole;
  onUpdate: (updates: any) => Promise<void>;
  onDelete: () => Promise<void>;
  parentOptions?: Array<{ id: string; title: string; depth: number }>;
}

const WikiItemSettingsModal: React.FC<WikiItemSettingsModalProps> = ({
  open,
  onOpenChange,
  item,
  itemType,
  userRole = 'member',
  onUpdate,
  onDelete,
  parentOptions = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: '',
    color: '',
    parentId: '',
    tags: [] as string[],
    status: 'published' as 'published' | 'draft' | 'review',
    isExpanded: false,
    isPublic: true,
    allowComments: true,
    allowEditing: false,
    requireApproval: false,
    customCss: '',
    metaDescription: '',
    keywords: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const permissions = getRolePermissions(userRole);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        slug: item.slug || '',
        description: item.description || '',
        icon: item.icon || '',
        color: item.color || '',
        parentId: (item as any).parentId || (item as any).parentPageId || '',
        tags: (item as any).tags || [],
        status: (item as any).status || 'published',
        isExpanded: item.isExpanded || false,
        isPublic: (item as any).isPublic !== false,
        allowComments: (item as any).allowComments !== false,
        allowEditing: (item as any).allowEditing || false,
        requireApproval: (item as any).requireApproval || false,
        customCss: (item as any).customCss || '',
        metaDescription: (item as any).metaDescription || '',
        keywords: (item as any).keywords || [],
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      await onUpdate(formData);
      toast.success(`${itemType === 'category' ? 'Category' : 'Page'} updated successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error(`Failed to update ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete();
      toast.success(`${itemType === 'category' ? 'Category' : 'Page'} deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(`Failed to delete ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{itemType === 'category' ? 'Category' : 'Page'} Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure the settings for this {itemType === 'category' ? 'category' : 'page'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs defaultValue="general" className="flex-1">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={`Enter ${itemType} title...`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={`Enter ${itemType} description...`}
                    rows={3}
                  />
                </div>

                {itemType === 'page' && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Tags</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <ScrollArea className="h-64 border rounded-md p-2">
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(ICON_OPTIONS).map(([category, icons]) => (
                          <div key={category} className="col-span-6">
                            <h4 className="font-medium text-sm mb-2 capitalize">{category}</h4>
                            <div className="grid grid-cols-6 gap-1 mb-4">
                              {icons.map((iconOption) => {
                                const IconComponent = iconOption.icon;
                                return (
                                  <Button
                                    key={iconOption.name}
                                    variant={formData.icon === iconOption.name ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.name }))}
                                    title={iconOption.label}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <Label>Color</Label>
                    <ScrollArea className="h-64 border rounded-md p-2">
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(COLOR_OPTIONS).map(([category, colors]) => (
                          <div key={category} className="col-span-6">
                            <h4 className="font-medium text-sm mb-2 capitalize">{category}</h4>
                            <div className="grid grid-cols-6 gap-1 mb-4">
                              {colors.map((colorOption) => (
                                <Button
                                  key={colorOption.name}
                                  variant={formData.color === colorOption.name ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setFormData(prev => ({ ...prev, color: colorOption.name }))}
                                  title={colorOption.label}
                                  style={{
                                    backgroundColor: colorOption.value,
                                    borderColor: formData.color === colorOption.name ? 'var(--border)' : colorOption.value
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isExpanded"
                    checked={formData.isExpanded}
                    onChange={(e) => setFormData(prev => ({ ...prev, isExpanded: e.target.checked }))}
                  />
                  <Label htmlFor="isExpanded">Expanded by default</Label>
                </div>
              </TabsContent>

              <TabsContent value="organization" className="space-y-4">
                <div className="mb-2 text-xs text-muted-foreground">
                  Organization allows you to set the parent (category or page) and the order of this item in the sidebar.
                </div>
                <div>
                  <Label htmlFor="parent">Parent {itemType === 'category' ? 'Category' : 'Page'}</Label>
                  <Select value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent (root level)</SelectItem>
                      {parentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {'—'.repeat(option.depth)} {option.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-32"
                  />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <Label htmlFor="isPublic">Public (visible to all users)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowComments"
                      checked={formData.allowComments}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                    />
                    <Label htmlFor="allowComments">Allow comments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowEditing"
                      checked={formData.allowEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowEditing: e.target.checked }))}
                    />
                    <Label htmlFor="allowEditing">Allow editing by users</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireApproval"
                      checked={formData.requireApproval}
                      onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
                    />
                    <Label htmlFor="requireApproval">Require approval for changes</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Enter meta description for SEO..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Keywords</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add a keyword..."
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <Button type="button" onClick={addKeyword} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                        {keyword} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created</Label>
                    <Input value={itemType === 'page' ? (item as WikiPage)?.createdAt || 'Unknown' : 'N/A'} disabled />
                  </div>
                  <div>
                    <Label>Last Modified</Label>
                    <Input value={itemType === 'page' ? (item as WikiPage)?.updatedAt || 'Unknown' : 'N/A'} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Author</Label>
                    <Input value={(item as any).authorName || 'Unknown'} disabled />
                  </div>
                  <div>
                    <Label>ID</Label>
                    <Input value={item.id} disabled />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              {permissions.canDelete && (
                <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              {permissions.canEdit && (
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WikiItemSettingsModal; 