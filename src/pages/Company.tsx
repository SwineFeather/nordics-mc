import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Star, 
  MapPin, 
  Globe, 
  Mail, 
  MessageCircle,
  TrendingUp,
  Award,
  Calendar,
  ExternalLink,
  Eye,
  Edit,
  Plus,
  Trash2,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  Settings,
  BarChart3,
  ShoppingBag,
  FileText,
  Image
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import { toast } from 'sonner';
import { CompanyImageService } from '@/services/companyImageService';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateCompanyModal from '@/components/towns/CreateCompanyModal';
import { usePlayerSearch } from '@/hooks/usePlayerSearch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectContent as SelectContentSelect } from '@/components/ui/select';
import { useShopsData } from '@/hooks/useShopsData';
import { Textarea } from '@/components/ui/textarea';
import ShopMapEmbed from '@/components/towns/ShopMapEmbed';
import EnhancedWikiEditor from '@/components/wiki/EnhancedWikiEditor';
import { PlayerTownService } from '@/services/playerTownService';

interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  email: string | null;
  discord_invite: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  business_type: string | null;
  industry: string | null;
  founded_date: string | null;
  headquarters_world: string | null;
  headquarters_coords: string | null;
  parent_company_id: string | null;
  town_id: string | null;
  company_type: 'parent' | 'subsidiary' | 'independent';
  member_count: number;
  max_members: number | null;
  is_public: boolean;
  is_featured: boolean;
  is_open: boolean;
  total_revenue: number;
  total_transactions: number;
  average_rating: number;
  review_count: number;
  owner_uuid: string;
  ceo_uuid: string | null;
  status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  shops?: Shop[];
  staff?: CompanyStaff[];
  parent_company?: Company;
  subsidiaries?: Company[];
  owner_minecraft_username?: string;
  inventory?: any[]; // Added for inventory
}

interface Shop {
  id: string;
  item_type: string;
  item_display_name: string | null;
  price: number;
  type: 'buy' | 'sell';
  stock: number;
  unlimited: boolean;
  world: string;
  x: number;
  y: number;
  z: number;
  last_updated: number;
}

interface CompanyStaff {
  id: string;
  company_id: string;
  user_uuid: string;
  role: string;
  joined_at: string;
  user_name?: string;
  user_avatar?: string;
  minecraft_username?: string;
}

const Company: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const { shops: allShops } = useShopsData();
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [ownerMinecraftName, setOwnerMinecraftName] = useState<string | null>(null);
  const [playerTownData, setPlayerTownData] = useState(null);
  const [joiningCompany, setJoiningCompany] = useState(false);

  // Add useEffect to set isAdmin based on profile
  useEffect(() => {
    if (profile?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [profile]);

  // Fetch inventory for the company with usernames
  useEffect(() => {
    if (company?.id) {
      fetchInventory();
    }
  }, [company?.id]);

  // Fetch inventory when inventory tab is accessed
  useEffect(() => {
    if (activeTab === 'inventory' && company?.id) {
      fetchInventory();
    }
  }, [activeTab, company?.id]);

  // Fetch transactions when transactions tab is accessed
  useEffect(() => {
    if (activeTab === 'transactions' && company?.id) {
      fetchTransactions();
    }
  }, [activeTab, company?.id]);

  // Fetch transactions when analytics tab is accessed
  useEffect(() => {
    if (activeTab === 'analytics' && company?.id) {
      fetchTransactions();
    }
  }, [activeTab, company?.id]);

  const fetchInventory = async () => {
    if (company?.id) {
      console.log('Fetching inventory for company:', company.id);
      const { data } = await (supabase as any)
        .from('companies')
        .select('inventory')
        .eq('id', company.id)
        .single();
      
      if (data?.inventory) {
        console.log('Raw inventory data:', data.inventory);
        // Get unique user UUIDs from inventory items
        const userIds = [...new Set(data.inventory.map((item: any) => item.added_by))];
        console.log('User IDs found:', userIds);
        
        // Fetch usernames for all unique users
        const { data: profiles } = await (supabase as any)
          .from('profiles')
          .select('id, minecraft_username, full_name')
          .in('id', userIds);
        
        console.log('Profiles found:', profiles);
        
        // Create a map of UUID to username
        const usernameMap = new Map();
        profiles?.forEach((profile: any) => {
          const username = profile.minecraft_username || profile.full_name || 'Unknown User';
          usernameMap.set(profile.id, username);
        });
        
        console.log('Username map:', Object.fromEntries(usernameMap));
        
        // Update inventory items with usernames
        const inventoryWithUsernames = data.inventory.map((item: any) => ({
          ...item,
          added_by_username: usernameMap.get(item.added_by) || 'Unknown User'
        }));
        
        console.log('Inventory with usernames:', inventoryWithUsernames);
        setInventory(inventoryWithUsernames);
      } else {
        console.log('No inventory data found');
        setInventory([]);
      }
    }
  };

  const fetchTransactions = async () => {
    if (company?.id) {
      console.log('Fetching transactions for company:', company.id);
      const { data, error } = await (supabase as any)
        .from('company_transactions')
        .select(`
          *,
          profiles!user_id(
            minecraft_username,
            full_name
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      console.log('Transactions found:', data);
      setTransactions(data || []);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCompany();
    }
  }, [slug]);

  // Update descriptionDraft when company data changes
  useEffect(() => {
    if (company?.description !== undefined) {
      setDescriptionDraft(company.description || '');
    }
  }, [company?.description]);

  useEffect(() => {
    if (profile?.minecraft_username) {
      PlayerTownService.getPlayerTownData(profile.minecraft_username).then(setPlayerTownData);
    }
  }, [profile?.minecraft_username]);

  // Debug logging
  useEffect(() => {
    console.log('Auth user:', user);
    console.log('Auth profile:', profile);
    if (company) {
      console.log('Company owner_uuid:', company.owner_uuid);
      console.log('Company owner_minecraft_username:', company.owner_minecraft_username);
      console.log('Company staff:', company.staff);
    }
  }, [user, profile, company]);

  // Helper: check if user is owner (by UUID only, robust string comparison)
  const isOwner = company && user && String(company.owner_uuid).trim() === String(user.id).trim();

  // Helper: check if user is staff (by UUID only, robust string comparison)
  const isStaff = (company?.staff ?? []).some(staff => String(staff.user_uuid).trim() === String(user?.id).trim());

  // Find the current user's staff record (if any)
  const myStaffRecord = (company?.staff ?? []).find(staff => String(staff.user_uuid).trim() === String(user?.id).trim());
  const myCompanyStaffRole = myStaffRecord?.role || null;

  // Executive detection (customize as needed)
  const isExecutive = myCompanyStaffRole?.toLowerCase() === 'executive';

  // Manager detection (case-insensitive)
  const isManager = myCompanyStaffRole?.toLowerCase() === 'manager';
  // Full permissions if owner, admin, executive, or manager
  const hasFullCompanyPermission = isOwner || isAdmin || isExecutive || isManager;

  // Use isOwner/isStaff for all permission checks and UI controls
  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the main company
      const { data: companyData, error: companyError } = await (supabase as any)
        .from('companies')
        .select(`
          *,
          inventory,
          shops:shops(
            id,
            item_type,
            item_display_name,
            price,
            type,
            stock,
            unlimited,
            world,
            x,
            y,
            z,
            last_updated
          ),
          staff:company_staff(
            id,
            company_id,
            user_uuid,
            role,
            joined_at,
            profiles!user_uuid(
              minecraft_username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          setError('Company not found');
        } else {
          throw companyError;
        }
        return;
      }

      // Get parent company if this is a subsidiary
      let parentCompany = null;
      if (companyData.parent_company_id) {
        const { data: parentData } = await (supabase as any)
          .from('companies')
          .select('id, name, slug, business_type, industry')
          .eq('id', companyData.parent_company_id)
          .single();
        parentCompany = parentData;
      }

      // Get subsidiaries if this is a parent company
      let subsidiaries = [];
      if (companyData.company_type === 'parent') {
        const { data: subsidiariesData } = await (supabase as any)
          .from('companies')
          .select('id, name, slug, business_type, industry, tagline')
          .eq('parent_company_id', companyData.id)
          .order('name');
        subsidiaries = subsidiariesData || [];
      }

      // Get staff with user profiles
      const staffWithProfiles = (companyData.staff || []).map(staffMember => ({
        ...staffMember,
        user_name: staffMember.profiles?.full_name || 'Unknown User',
        user_avatar: staffMember.profiles?.avatar_url,
        minecraft_username: staffMember.profiles?.minecraft_username
      }));

      let ownerMinecraftName = null;
      if (companyData.owner_uuid) {
        const { data: ownerProfile } = await (supabase as any)
          .from('profiles')
          .select('minecraft_username')
          .eq('id', companyData.owner_uuid)
          .single();
        ownerMinecraftName = ownerProfile?.minecraft_username || null;
      }

      setCompany({
        ...companyData,
        parent_company: parentCompany,
        subsidiaries: subsidiaries,
        staff: staffWithProfiles,
        inventory: companyData.inventory || []
      });
      setOwnerMinecraftName(ownerMinecraftName);
    } catch (err) {
      console.error('Error fetching company:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!company) return;

    try {
      const success = await CompanyImageService.uploadCompanyLogoFile(company.id, file);
      if (success) {
        fetchCompany(); // Refresh company data
        setShowImageUpload(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const addStaffMember = async (userUuid: string, role: string) => {
    if (!company) return;

    try {
      const { error } = await (supabase as any)
        .from('company_staff')
        .insert({
          company_id: company.id,
          user_uuid: userUuid,
          role: role
        });

      if (error) {
        toast.error('Failed to add staff member: ' + (error.message || error.details || error.code || 'Unknown error'));
        throw error;
      }

      toast.success('Staff member added successfully');
      fetchCompany();
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast.error('Failed to add staff member: ' + (error?.message || error?.details || error?.code || 'Unknown error'));
    }
  };

  const removeStaffMember = async (staffId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('company_staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast.success('Staff member removed successfully');
      fetchCompany();
    } catch (error) {
      console.error('Error removing staff member:', error);
      toast.error('Failed to remove staff member');
    }
  };

  const joinCompany = async () => {
    if (!company || !user) return;
    
    setJoiningCompany(true);
    try {
      const { data, error } = await (supabase as any).rpc('join_company', {
        p_company_id: company.id,
        p_user_uuid: user.id
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success(data.message || 'Successfully joined company!');
        fetchCompany(); // Refresh company data
      } else {
        toast.error(data.error || 'Failed to join company');
      }
    } catch (error) {
      console.error('Error joining company:', error);
      toast.error('Failed to join company');
    } finally {
      setJoiningCompany(false);
    }
  };

  const removeInventoryItem = async (itemId: string) => {
    if (!company) return;
    
    try {
      const currentInventory = company.inventory || [];
      const updatedInventory = currentInventory.filter(item => item.id !== itemId);
      
      const { error } = await (supabase as any)
        .from('companies')
        .update({ inventory: updatedInventory })
        .eq('id', company.id);
        
      if (error) throw error;
      
      toast.success('Inventory item removed!');
      fetchCompany(); // Refresh company data
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast.error('Failed to remove inventory item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏢</div>
        <h3 className="text-xl font-bold mb-2">Company Not Found</h3>
        <p className="text-muted-foreground mb-4">
          {error || 'The company you are looking for does not exist or is not active.'}
        </p>
        <Button onClick={() => navigate('/marketplace')} variant="outline">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  // Fallback UI for debugging owner/staff detection
  if (!loading && company && !isOwner && !isStaff && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">You do not have permission to edit this company</h3>
          <p className="text-muted-foreground mb-4">
            <strong>Your user ID:</strong> {user?.id}<br />
            <strong>Your Minecraft username:</strong> {profile?.minecraft_username}<br />
            <strong>Company owner_uuid:</strong> {company.owner_uuid}<br />
            <strong>Company owner_minecraft_username:</strong> {company.owner_minecraft_username}<br />
            <strong>Company staff user_uuids:</strong> {(company.staff || []).map(s => s.user_uuid).join(', ')}<br />
            <strong>Company staff Minecraft usernames:</strong> {(company.staff || []).map(s => s.minecraft_username).join(', ')}
          </p>
          <Button onClick={() => navigate('/marketplace')} variant="outline">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // Debug UI for staff detection
  const debugStaffSection = (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-4 my-4 text-xs text-yellow-900">
      <div><strong>Debug Info:</strong></div>
      <div><strong>Your user.id:</strong> {user?.id}</div>
      <div><strong>isOwner:</strong> {String(isOwner)}</div>
      <div><strong>isStaff:</strong> {String(isStaff)}</div>
      <div><strong>Company staff:</strong></div>
      <ul className="ml-4">
        {(company?.staff || []).map(staff => (
          <li key={staff.id}>
            user_uuid: {staff.user_uuid}, role: {staff.role}, user_name: {staff.user_name}, minecraft_username: {staff.minecraft_username}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-48 w-full rounded-lg flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${company.primary_color || '#1E40AF'}20, ${company.secondary_color || '#F59E0B'}20)`
          }}
        >
          {company.banner_url ? (
            <img 
              src={company.banner_url} 
              alt={`${company.name} banner`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No banner image</p>
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="absolute left-8 -bottom-16">
          {company.logo_url ? (
            <div className="relative">
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`}
                className="w-32 h-32 rounded-lg object-cover border-4 border-background shadow-lg bg-background"
              />
              {(isOwner || isAdmin) && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-background/90 hover:bg-background"
                  onClick={() => setShowImageUpload(true)}
                  title="Upload company logo"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div 
              className="w-32 h-32 rounded-lg border-4 border-background shadow-lg flex items-center justify-center relative"
              style={{ backgroundColor: company.primary_color || '#6B7280' }}
            >
              <Building2 className="w-16 h-16 text-white" />
              {(isOwner || isAdmin) && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-background/90 hover:bg-background"
                  onClick={() => setShowImageUpload(true)}
                  title="Upload company logo"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="ml-48 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
              {company.tagline && (
                <p className="text-lg text-muted-foreground mb-4">{company.tagline}</p>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                {company.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {company.verification_status === 'verified' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline">
                  {company.industry}
                </Badge>
                {company.business_type && (
                  <Badge variant="outline">
                    {company.business_type}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {company.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {company.discord_invite && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.discord_invite} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discord
                  </a>
                </Button>
              )}
              {hasFullCompanyPermission && (
                <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              )}
              {!isOwner && !isStaff && !isAdmin && company.is_open && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={joinCompany}
                  disabled={joiningCompany}
                >
                  {joiningCompany ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Company
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{company.member_count}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{company.shops?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Shops</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{formatCurrency(company.total_revenue)}</p>
            <p className="text-sm text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{company.average_rating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="max-w-4xl mx-auto flex gap-2 px-2 py-1 rounded-lg bg-muted/40 border mb-4">
          <TabsTrigger value="overview" className="px-3 py-1 text-sm min-w-[80px]">Overview</TabsTrigger>
          <TabsTrigger value="shops" className="px-3 py-1 text-sm min-w-[80px]">Shops</TabsTrigger>
          <TabsTrigger value="inventory" className="px-3 py-1 text-sm min-w-[80px]">Inventory</TabsTrigger>
          <TabsTrigger value="transactions" className="px-3 py-1 text-sm min-w-[80px]">Transactions</TabsTrigger>
          <TabsTrigger value="analytics" className="px-3 py-1 text-sm min-w-[80px]">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          {editingDescription ? (
            <div className="max-w-4xl mx-auto">
              <EnhancedWikiEditor
                page={{ 
                  content: descriptionDraft, 
                  title: company.name, 
                  status: 'published', 
                  updatedAt: '', 
                  authorName: '', 
                  id: company.id,
                  slug: company.slug,
                  authorId: company.owner_uuid,
                  createdAt: company.created_at,
                  category: null,
                  order: 0
                }}
                userRole={hasFullCompanyPermission ? 'admin' : 'member'}
                isEditing={true}
                onSave={async (updates) => {
                  setSavingDescription(true);
                  const { error } = await (supabase as any)
                    .from('companies')
                    .update({ description: updates.content })
                    .eq('id', company.id);
                  setSavingDescription(false);
                  if (!error) {
                    setEditingDescription(false);
                    setDescriptionDraft(updates.content || '');
                    fetchCompany();
                    toast.success('Description updated!');
                  } else {
                    toast.error('Failed to update description');
                  }
                }}
                onToggleEdit={() => setEditingDescription(false)}
                autoSaveEnabled={false}
                onAutoSaveToggle={() => {}}
              />
            </div>
          ) : (
            <div className="prose max-w-4xl mx-auto px-4">
              <SimpleMarkdownRenderer content={descriptionDraft || company.description || '*No description provided.*'} />
              {hasFullCompanyPermission && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setEditingDescription(true)}>
                  Edit Description
                </Button>
              )}
            </div>
          )
          }

          {/* Headquarters Map View */}
          <Card>
            <CardHeader>
              <CardTitle>Headquarters Location</CardTitle>
            </CardHeader>
            <CardContent>
              {company.headquarters_world && company.headquarters_coords ? (
                (() : React.ReactNode => {
                  const [x, y, z] = (company.headquarters_coords || '').split(',').map(Number);
                  if ([x, y, z].some(v => isNaN(v))) {
                    return <div className="text-center py-8 text-muted-foreground">Invalid coordinates specified</div>;
                  }
                  return (
                    <>
                      <ShopMapEmbed
                        shopName={company.name}
                        coordinates={{ x, y, z }}
                        world={company.headquarters_world}
                      />
                      <div className="mt-4 text-center">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-2"
                        >
                          <a
                            href={`https://map.nordics.world/#world:${x}:${y}:${z}:444:0:0:0:1:flat`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            Live Map View
                          </a>
                        </Button>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No headquarters location specified</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Section */}
          <Card>
            <CardHeader>
              <CardTitle>Company Staff</CardTitle>
            </CardHeader>
            <CardContent>
              {company.staff && company.staff.length > 0 ? (
                <div className="space-y-4">
                  {company.staff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.user_name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground capitalize">{staff.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Joined {formatDate(staff.joined_at)}
                        </Badge>
                        {hasFullCompanyPermission && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStaffMember(staff.id)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Company Inventory</CardTitle>
              {hasFullCompanyPermission && (
                <Button size="sm" onClick={() => setShowAddInventoryModal(true)}>
                  Add Item
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {inventory.length > 0 ? (
                <div className="space-y-2">
                  {inventory.map(item => (
                    <div key={item.id} className="flex items-center gap-4 border rounded p-2">
                      <span className="font-medium">{item.item_name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Added by {item.added_by_username || item.added_by}
                        {item.added_at && ` on ${new Date(item.added_at).toLocaleDateString()}`}
                      </span>
                      {hasFullCompanyPermission && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeInventoryItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No inventory items found.</div>
              )}
            </CardContent>
          </Card>
          {showAddInventoryModal && (
            <Dialog open={showAddInventoryModal} onOpenChange={setShowAddInventoryModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                </DialogHeader>
                <AddInventoryForm companyId={company.id} userId={user.id} onClose={() => { setShowAddInventoryModal(false); fetchInventory(); }} />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Shops and Analytics tabs remain unchanged */}
        <TabsContent value="shops" className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Shops</CardTitle>
                {hasFullCompanyPermission && (
                  <Button size="sm" className="mb-4" onClick={() => setShowAddShopModal(true)}>
                    Add Shop
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {company.shops && company.shops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.shops.map((shop) => (
                    <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{shop.item_display_name || shop.item_type}</h4>
                          <Badge variant={shop.type === 'buy' ? 'default' : 'secondary'}>
                            {shop.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-primary mb-2">
                          {formatCurrency(shop.price)}
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Stock: {shop.unlimited ? '∞' : shop.stock}</p>
                          <p>World: {shop.world}</p>
                          <p>Location: {shop.x}, {shop.y}, {shop.z}</p>
                        </div>
                        {hasFullCompanyPermission && (
                          <Button size="sm" variant="destructive" onClick={async () => {
                            await (supabase as any).from('shops').update({ company_id: null }).eq('id', shop.id);
                            fetchCompany();
                          }}>
                            Remove
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No shops found for this company</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Company Transactions</CardTitle>
              {hasFullCompanyPermission && (
                <Button size="sm" onClick={() => setShowTransactionModal(true)}>
                  Create Transaction
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            transaction.transaction_type === 'service' ? 'default' :
                            transaction.transaction_type === 'product' ? 'secondary' :
                            transaction.transaction_type === 'consultation' ? 'outline' : 'destructive'
                          }>
                            {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                          </Badge>
                          {transaction.service_category && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.service_category}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {transaction.service_name && (
                            <p className="font-medium">{transaction.service_name}</p>
                          )}
                          {transaction.client_name && (
                            <p className="text-sm text-muted-foreground">Client: {transaction.client_name}</p>
                          )}
                          {transaction.description && (
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created by {transaction.profiles?.minecraft_username || transaction.profiles?.full_name || 'Unknown User'} on {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.proof_image_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(transaction.proof_image_url, '_blank')}
                          >
                            View Proof
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No transactions found for this company</p>
                  {hasFullCompanyPermission && (
                    <Button 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => setShowTransactionModal(true)}
                    >
                      Create First Transaction
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Company Analytics</CardTitle>
              <Button size="sm" onClick={() => setShowTransactionModal(true)}>
                Create Transaction
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Financial Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold">{formatCurrency(company.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Transactions:</span>
                      <span className="font-semibold">{company.total_transactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Transaction:</span>
                      <span className="font-semibold">
                        {company.total_transactions > 0 
                          ? formatCurrency(company.total_revenue / company.total_transactions)
                          : '$0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Transactions:</span>
                      <span className="font-semibold">{transactions.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Member Count:</span>
                      <span className="font-semibold">{company.member_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shop Count:</span>
                      <span className="font-semibold">{company.shops?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="font-semibold">{company.average_rating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inventory Items:</span>
                      <span className="font-semibold">{inventory.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Breakdown */}
              {transactions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Recent Transaction Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">By Type</h5>
                      <div className="space-y-1">
                        {Object.entries(
                          transactions.reduce((acc: any, t) => {
                            acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">By Service Category</h5>
                      <div className="space-y-1">
                        {Object.entries(
                          transactions
                            .filter(t => t.service_category)
                            .reduce((acc: any, t) => {
                              acc[t.service_category] = (acc[t.service_category] || 0) + 1;
                              return acc;
                            }, {})
                        ).map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span>{category}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Revenue by Type</h5>
                      <div className="space-y-1">
                        {Object.entries(
                          transactions.reduce((acc: any, t) => {
                            acc[t.transaction_type] = (acc[t.transaction_type] || 0) + t.amount;
                            return acc;
                          }, {})
                        ).map(([type, amount]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type}:</span>
                            <span className="font-medium">{formatCurrency(amount as number)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Placeholder for charts */}
              <div className="mt-8 h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Analytics charts coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Revenue trends, member growth, and performance metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Upload Dialog */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Company Logo</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your company logo
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PNG, JPG up to 2MB. Recommended size: 256x256px
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('File size must be less than 2MB');
                          return;
                        }
                        handleImageUpload(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowImageUpload(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
            </DialogHeader>
            {/* You can use the CreateCompanyModal form fields here, prefilled with company data. */}
            <CreateCompanyModal
              initialData={{
                ...company,
                staff: company.staff?.map(s => ({
                  user_uuid: s.user_uuid,
                  displayName: s.user_name || 'Unknown User',
                  role: s.role
                })) || []
              }}
              onClose={() => setShowEditModal(false)}
              onCompanyUpdated={fetchCompany}
              isEditMode={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {showAddStaffModal && (
        <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <AddStaffModalContent companyId={company.id} onClose={() => { setShowAddStaffModal(false); fetchCompany(); }} />
          </DialogContent>
        </Dialog>
      )}

      {showAddShopModal && (
        <Dialog open={showAddShopModal} onOpenChange={setShowAddShopModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Shop to Company</DialogTitle>
            </DialogHeader>
            <AddShopModalContent
              companyId={company.id}
              userId={user?.id}
              isAdmin={isAdmin}
              onClose={() => { setShowAddShopModal(false); fetchCompany(); }}
              companyShopIds={company.shops?.map(s => s.id) || []}
            />
          </DialogContent>
        </Dialog>
      )}

      {showTransactionModal && (
        <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
              <DialogDescription>
                Record a new transaction for your company. Choose the transaction type and fill in the details.
              </DialogDescription>
            </DialogHeader>
            <CreateTransactionForm
              companyId={company.id}
              shops={company.shops}
              userId={user.id}
              onClose={() => setShowTransactionModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const AddStaffModalContent: React.FC<{ companyId: string; onClose: () => void }> = ({ companyId, onClose }) => {
  const [search, setSearch] = useState('');
  const { players, loading } = usePlayerSearch(search);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [role, setRole] = useState('Staff');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!selectedPlayer) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('company_staff')
        .insert({
          company_id: companyId,
          user_uuid: selectedPlayer.id,
          role: role
        });
      if (error) {
        toast.error('Failed to add staff: ' + (error.message || error.details || error.code || 'Unknown error'));
        throw error;
      }
      toast.success('Staff member added!');
      onClose();
    } catch (e: any) {
      toast.error('Failed to add staff: ' + (e?.message || e?.details || e?.code || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search player by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        disabled={!!selectedPlayer}
      />
      {search.length >= 2 && !selectedPlayer && (
        <div className="max-h-40 overflow-y-auto border rounded">
          {loading ? (
            <div className="p-2 text-muted-foreground">Searching...</div>
          ) : players.length === 0 ? (
            <div className="p-2 text-muted-foreground">No players found</div>
          ) : players.map(player => (
            <div
              key={player.id}
              className="p-2 hover:bg-muted cursor-pointer"
              onClick={() => setSelectedPlayer(player)}
            >
              {player.displayName}
            </div>
          ))}
        </div>
      )}
      {selectedPlayer && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span>{selectedPlayer.displayName}</span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedPlayer(null)}>
            Remove
          </Button>
        </div>
      )}
      <div>
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="z-[9999]" position="popper">
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleAdd} disabled={!selectedPlayer || submitting}>
          Add
        </Button>
      </div>
    </div>
  );
};

const AddShopModalContent: React.FC<{ companyId: string; userId: string; isAdmin: boolean; onClose: () => void; companyShopIds: string[] }> = ({ companyId, userId, isAdmin, onClose, companyShopIds }) => {
  const { shops: allShops, loading } = useShopsData();
  const [submitting, setSubmitting] = useState(false);
  // Admins see all shops, others see only their own
  const userShops = isAdmin
    ? allShops.filter(shop => !shop.company_id || !companyShopIds.includes(shop.id))
    : allShops.filter(shop => shop.owner_uuid === userId && (!shop.company_id || !companyShopIds.includes(shop.id)));
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selectedShopId) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from('shops').update({ company_id: companyId }).eq('id', selectedShopId);
      if (error) throw error;
      toast.success('Shop linked to company!');
      onClose();
    } catch (e) {
      toast.error('Failed to link shop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="p-2 text-muted-foreground">Loading shops...</div>
      ) : userShops.length === 0 ? (
        <div className="p-2 text-muted-foreground">No eligible shops to add.</div>
      ) : (
        <div className="max-h-40 overflow-y-auto border rounded">
          {userShops.map(shop => (
            <div
              key={shop.id}
              className={`p-2 hover:bg-muted cursor-pointer ${selectedShopId === shop.id ? 'bg-primary/10' : ''}`}
              onClick={() => setSelectedShopId(shop.id)}
            >
              {shop.item_display_name || shop.item_type} ({shop.world} {shop.x},{shop.y},{shop.z})
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleAdd} disabled={!selectedShopId || submitting}>
          Add
        </Button>
      </div>
    </div>
  );
};

const CreateTransactionForm: React.FC<{ companyId: string; shops: Shop[]; userId: string; onClose: () => void }> = ({ companyId, shops, userId, onClose }) => {
  const [transactionType, setTransactionType] = useState<'service' | 'product' | 'consultation' | 'other'>('service');
  const [shopId, setShopId] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCategories = [
    'Building & Construction',
    'Design & Architecture', 
    'Consulting & Planning',
    'Transportation & Logistics',
    'Security & Protection',
    'Entertainment & Events',
    'Education & Training',
    'Healthcare & Medical',
    'Technology & IT',
    'Agriculture & Farming',
    'Mining & Resources',
    'Manufacturing & Crafting',
    'Landscaping & Groundskeeping',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !file) {
      toast.error('Amount and proof image are required.');
      return;
    }
    
    // Validate based on transaction type
    if (transactionType === 'product' && !shopId) {
      toast.error('Please select a shop for product transactions.');
      return;
    }
    if (transactionType === 'service' && (!serviceCategory || !serviceName)) {
      toast.error('Please fill in service category and name.');
      return;
    }
    
    setSubmitting(true);
    try {
      // Upload image
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${userId}.${ext}`;
      const { data: uploadData, error: uploadError } = await (supabase as any).storage
        .from('transaction-proofs')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = (supabase as any).storage
        .from('transaction-proofs')
        .getPublicUrl(fileName);
      
      // Create transaction data
      const transactionData: any = {
        company_id: companyId,
        user_id: userId,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        description,
        client_name: clientName || null,
        proof_image_url: publicUrl,
        created_at: new Date().toISOString()
      };

      // Add type-specific data
      if (transactionType === 'product') {
        transactionData.shop_id = shopId;
      } else if (transactionType === 'service') {
        transactionData.service_category = serviceCategory;
        transactionData.service_name = serviceName;
      }

      // Insert transaction
      const { error } = await (supabase as any).from('company_transactions').insert(transactionData);
      if (error) throw error;
      toast.success('Transaction created successfully!');
      onClose();
    } catch (err) {
      console.error('Transaction creation error:', err);
      toast.error('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Transaction Type</Label>
        <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
          <SelectTrigger><SelectValue placeholder="Select transaction type" /></SelectTrigger>
          <SelectContent className="z-[999999]" side="bottom" align="start" sideOffset={4}>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="product">Product (Shop)</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {transactionType === 'product' && (
        <div>
          <Label>Shop</Label>
                  <Select value={shopId} onValueChange={setShopId}>
          <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
          <SelectContent className="z-[999999]" side="bottom" align="start" sideOffset={4}>
            {shops.map(shop => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.item_display_name || shop.item_type} ({shop.world} {shop.x},{shop.y},{shop.z})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      )}

      {transactionType === 'service' && (
        <>
          <div>
            <Label>Service Category</Label>
                    <Select value={serviceCategory} onValueChange={setServiceCategory}>
          <SelectTrigger><SelectValue placeholder="Select service category" /></SelectTrigger>
          <SelectContent className="z-[999999]" side="bottom" align="start" sideOffset={4}>
            {serviceCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
          </div>
          <div>
            <Label>Service Name</Label>
            <Input 
              value={serviceName} 
              onChange={e => setServiceName(e.target.value)} 
              placeholder="e.g., Castle Construction, Redstone System Design"
              required 
            />
          </div>
        </>
      )}

      <div>
        <Label>Client Name (Optional)</Label>
        <Input 
          value={clientName} 
          onChange={e => setClientName(e.target.value)} 
          placeholder="Who was this transaction for?"
        />
      </div>

      <div>
        <Label>Amount</Label>
        <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Describe the transaction details..."
        />
      </div>

      <div>
        <Label>Proof Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required />
        {file && <span className="text-xs text-muted-foreground">{file.name}</span>}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Transaction'}</Button>
      </div>
    </form>
  );
};

const AddInventoryForm: React.FC<{ companyId: string; userId: string; onClose: () => void }> = ({ companyId, userId, onClose }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantity) {
      toast.error('Item name and quantity are required.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('Adding inventory item:', { companyId, itemName, quantity, userId });
      
      // Get current inventory
      const { data: currentCompany } = await (supabase as any)
        .from('companies')
        .select('inventory')
        .eq('id', companyId)
        .single();
      
      const currentInventory = currentCompany?.inventory || [];
      
      // Add new item to inventory
      const newItem = {
        id: Date.now().toString(), // Simple ID for the item
        item_name: itemName,
        quantity: parseInt(quantity, 10),
        added_by: userId,
        added_at: new Date().toISOString()
      };
      
      const updatedInventory = [...currentInventory, newItem];
      
      // Update the companies table
      const { error } = await (supabase as any)
        .from('companies')
        .update({ inventory: updatedInventory })
        .eq('id', companyId);
        
      if (error) {
        console.error('Inventory update error:', error);
        throw error;
      }
      
      toast.success('Inventory item added!');
      onClose();
    } catch (err) {
      console.error('Failed to add inventory item:', err);
      toast.error('Failed to add inventory item: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Item Name</Label>
        <Input value={itemName} onChange={e => setItemName(e.target.value)} required />
      </div>
      <div>
        <Label>Quantity</Label>
        <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Item'}</Button>
      </div>
    </form>
  );
};

export default Company; 