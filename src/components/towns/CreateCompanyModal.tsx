import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Upload, X, CheckCircle, AlertCircle, Building2, MapPin, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { useTownsData } from '@/hooks/useTownsData';
import { toast } from 'sonner';
import { usePlayerSearch } from '@/hooks/usePlayerSearch';
import { PlayerTownService } from '@/services/playerTownService';
import { Portal } from '@radix-ui/react-portal';

interface CreateCompanyModalProps {
  onCompanyCreated?: () => void;
  initialData?: Partial<FormData & { id?: string; logo_url?: string; banner_url?: string }>;
  isEditMode?: boolean;
  onClose?: () => void;
  onCompanyUpdated?: () => void;
}

interface FormData {
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  email: string;
  discord_invite: string;
  business_type: string;
  industry: string;
  headquarters_world: string;
  headquarters_coords: string;
  parent_company_id: string;
  town_id: string;
  primary_color: string;
  secondary_color: string;
  staff: Array<{ user_uuid: string; displayName: string; role: string }>;
}

const industries = [
  'Mining', 'Farming', 'Trading', 'Manufacturing', 'Construction', 
  'Technology', 'Entertainment', 'Transportation', 'Healthcare', 
  'Education', 'Real Estate', 'Finance', 'Food & Beverage', 
  'Fashion', 'Automotive', 'Energy', 'Telecommunications', 
  'Media', 'Tourism', 'Consulting', 'Conglomerate', 'Holding Company',
  'Landscaping'
];

const businessTypes = [
  'Sole Proprietorship', 'Partnership', 'Corporation', 'LLC', 
  'Cooperative', 'Franchise', 'Enterprise', 'Group', 'Holding Company'
];

const businessTypeDescriptions: Record<string, string> = {
  'Sole Proprietorship': 'One owner, unlimited liability.',
  'Partnership': 'Multiple owners, shared liability.',
  'Corporation': 'Legal entity, limited liability, complex structure.',
  'LLC': 'Limited liability, flexible structure.',
  'Cooperative': 'Owned by members for mutual benefit.',
  'Franchise': 'Business model using another\'s brand.',
  'Enterprise': 'Large-scale business operation.',
  'Group': 'Collection of related companies.',
  'Holding Company': 'Owns other companies\' stocks to control them.'
};

const worlds = ['Overworld', 'Nether', 'End', 'Multiple Worlds'];

const LEVEL_REQUIREMENTS_HINT = `
Company Creation Level Requirements:

- Level 5: Create your first company
- Level 10: Create your second company
- Level 20: Create your third company
- Level 25, 30, ... 100: Each additional company requires 5 more levels (capped at 100)
- Enterprise: Always requires at least level 15
\n- Admins are exempt from level requirements and can create unlimited companies
`;

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ onCompanyCreated, initialData, isEditMode, onClose, onCompanyUpdated }) => {
  const { user, profile } = useAuth();
  const { companies } = useCompaniesData();
  const { towns } = useTownsData();
  // Remove dialog open/close logic for edit mode
  const [isOpen, setIsOpen] = useState(isEditMode ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Array<{ user_uuid: string; displayName: string; role: string }>>([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.banner_url || null);
  const [bannerUrlInput, setBannerUrlInput] = useState<string>('');
  const [playerTownData, setPlayerTownData] = useState(null);
  const [showLevelDetails, setShowLevelDetails] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    tagline: initialData?.tagline || '',
    description: initialData?.description || '',
    website_url: initialData?.website_url || '',
    email: initialData?.email || '',
    discord_invite: initialData?.discord_invite || '',
    business_type: initialData?.business_type || '',
    industry: initialData?.industry || '',
    headquarters_world: initialData?.headquarters_world || '',
    headquarters_coords: initialData?.headquarters_coords || '',
    parent_company_id: initialData?.parent_company_id || 'independent',
    town_id: initialData?.town_id || 'none',
    primary_color: initialData?.primary_color || '#1E40AF',
    secondary_color: initialData?.secondary_color || '#F59E0B',
    staff: initialData?.staff || [],
  });

  const [playerLevel, setPlayerLevel] = useState<number | null>(null);
  const [ownedCount, setOwnedCount] = useState<number>(0);
  const [requiredLevel, setRequiredLevel] = useState<number>(5);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState<boolean>(true);

  // Add state for debug info
  const [playerLevelDebug, setPlayerLevelDebug] = useState<string>('');
  const [playerLevelLookups, setPlayerLevelLookups] = useState<string[]>([]);

  // Filter parent companies (only Enterprise/Group types can be parents)
  const parentCompanies = companies.filter(company => 
    company.business_type === 'Enterprise' || 
    company.business_type === 'Group' || 
    company.business_type === 'Holding Company'
  );

  // Fetch staff list for edit mode
  const fetchStaffList = async () => {
    if (isEditMode && initialData?.id) {
      const { data, error } = await supabase
        .from('company_staff')
        .select('user_uuid, role')
        .eq('company_id', initialData.id);
      if (!error && data) {
        // Optionally fetch displayName from profiles
        const userUuids = data.map((s: any) => s.user_uuid);
        let profilesMap: Record<string, string> = {};
        if (userUuids.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userUuids);
          if (profiles) {
            profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name]));
          }
        }
        setStaffList(data.map((s: any) => ({
          user_uuid: s.user_uuid,
          displayName: profilesMap[s.user_uuid] || '',
          role: s.role
        })));
      } else {
        setStaffList([]);
      }
    }
  };

  useEffect(() => {
    fetchStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, initialData?.id]);

  useEffect(() => {
    if (profile?.minecraft_username) {
      PlayerTownService.getPlayerTownData(profile.minecraft_username).then(setPlayerTownData);
    }
  }, [profile?.minecraft_username]);

  // Fetch player level and owned companies on mount or when user/companies change
  useEffect(() => {
    const fetchLevelAndCompanies = async () => {
      if (!user) return;
      const isAdmin = profile?.role === 'admin';
      let playerLevelFetched: number | null = null;
      let lookupTried = [];
      let debugInfo = [];
      // 1. Try profile.minecraft_username (Minecraft username)
      if (profile?.minecraft_username) {
        const username = profile.minecraft_username.trim();
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .ilike('name', username)
          .single();
        lookupTried.push('minecraft_username');
        debugInfo.push(`Tried minecraft_username: ${username} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      // 2. If not found, try full_name (display name)
      if (playerLevelFetched === null && profile?.full_name) {
        const displayName = profile.full_name.trim();
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .ilike('name', displayName)
          .single();
        lookupTried.push('full_name');
        debugInfo.push(`Tried full_name: ${displayName} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      // 3. Fallback to user.id as uuid
      if (playerLevelFetched === null) {
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .eq('uuid', user.id)
          .single();
        lookupTried.push('uuid');
        debugInfo.push(`Tried uuid: ${user.id} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      setPlayerLevel(playerLevelFetched);
      setPlayerLevelDebug(debugInfo.join('\n'));
      setPlayerLevelLookups(lookupTried);
      // Count companies owned
      const owned = companies.filter(c => c.owner_uuid === user.id).length;
      setOwnedCount(owned);
      // Admins are exempt from creation limits
      if (isAdmin) {
        setLevelError(null);
        setCanCreate(true);
      }
    };
    fetchLevelAndCompanies();
  }, [user, companies, profile?.minecraft_username, profile?.full_name, profile?.role]);

  // Calculate required level and eligibility reactively
  useEffect(() => {
    const isAdmin = profile?.role === 'admin';
    if (isAdmin) {
      setLevelError(null);
      setCanCreate(true);
      return;
    }

    let reqLevel = 5;
    if (ownedCount === 0) reqLevel = 5;
    else if (ownedCount === 1) reqLevel = 10;
    else if (ownedCount === 2) reqLevel = 20;
    else reqLevel = 5 + ownedCount * 5;
    if (reqLevel > 100) reqLevel = 100;
    setRequiredLevel(reqLevel);

    // Enterprise special case
    if (formData.business_type === 'Enterprise' && (playerLevel ?? 1) < 15) {
      setLevelError('You must be at least level 15 to create an Enterprise.');
      setCanCreate(false);
      return;
    }
    // General case
    if ((playerLevel ?? 1) < reqLevel) {
      setLevelError(`You need to be at least level ${reqLevel} to create your next company. (Current level: ${playerLevel ?? 1})`);
      setCanCreate(false);
      return;
    }
    setLevelError(null);
    setCanCreate(true);
  }, [formData.business_type, playerLevel, ownedCount, profile?.role]);

  // Helper: check if user is owner (by UUID or Minecraft username)
  const isOwner = initialData && profile && (
    initialData.owner_uuid === user?.id ||
    (initialData.owner_minecraft_username && initialData.owner_minecraft_username.toLowerCase() === profile.minecraft_username?.toLowerCase())
  );

  // Helper: check if user is staff (by UUID or Minecraft username)
  const isStaff = staffList.some(staff =>
    staff.user_uuid === user?.id ||
    (staff.minecraft_username && staff.minecraft_username.toLowerCase() === profile.minecraft_username?.toLowerCase())
  );

  // Use isOwner/isStaff for all permission checks and UI controls
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addStaffMember = () => {
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { user_uuid: '', displayName: '', role: '' }]
    }));
  };

  const removeStaffMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index)
    }));
  };

  const updateStaffMember = (index: number, field: 'name' | 'role', value: string) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a company');
      return;
    }

    if (!formData.name || !formData.business_type || !formData.industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // --- LEVEL REQUIREMENTS LOGIC ---
      const isAdmin = profile?.role === 'admin';
      // 1. Fetch player level (repeat lookup logic for robustness)
      let playerLevelFetched: number | null = null;
      let lookupTried = [];
      let debugInfo = [];
      if (profile?.minecraft_username) {
        const username = profile.minecraft_username.trim();
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .ilike('name', username)
          .single();
        lookupTried.push('minecraft_username');
        debugInfo.push(`Tried minecraft_username: ${username} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      if (playerLevelFetched === null && profile?.full_name) {
        const displayName = profile.full_name.trim();
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .ilike('name', displayName)
          .single();
        lookupTried.push('full_name');
        debugInfo.push(`Tried full_name: ${displayName} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      if (playerLevelFetched === null) {
        const { data: playerData } = await supabase
          .from('players')
          .select('level')
          .eq('uuid', user.id)
          .single();
        lookupTried.push('uuid');
        debugInfo.push(`Tried uuid: ${user.id} → ${playerData ? JSON.stringify(playerData) : 'not found'}`);
        if (playerData && typeof playerData.level === 'number') {
          playerLevelFetched = playerData.level;
        }
      }
      if (playerLevelFetched === null && !isAdmin) {
        toast.error('Could not verify your player level.\n' + debugInfo.join('\n'));
        setIsSubmitting(false);
        return;
      }
      const playerLevel = playerLevelFetched || 1;

      // 2. Count companies owned by this user
      const ownedCompanies = companies.filter(c => c.owner_uuid === user.id);
      const ownedCount = ownedCompanies.length;

      // 3. Calculate required level for next company
      // 1st: 5, 2nd: 10, 3rd: 20, 4th: 25, 5th: 30, ... nth: 5 + (n-1)*5
      let requiredLevel = 5;
      if (ownedCount === 0) requiredLevel = 5;
      else if (ownedCount === 1) requiredLevel = 10;
      else if (ownedCount === 2) requiredLevel = 20;
      else requiredLevel = 5 + ownedCount * 5;
      if (requiredLevel > 100) requiredLevel = 100;

      // 4. Enterprise special case
      if (!isAdmin && formData.business_type === 'Enterprise' && playerLevel < 15) {
        toast.error('You must be at least level 15 to create an Enterprise.');
        setIsSubmitting(false);
        return;
      }

      // 5. Block if requirements not met
      if (!isAdmin && playerLevel < requiredLevel) {
        toast.error(`You need to be at least level ${requiredLevel} to create your next company. (Current level: ${playerLevel})`);
        setIsSubmitting(false);
        return;
      }
      // --- END LEVEL REQUIREMENTS LOGIC ---

      let logoUrl = initialData?.logo_url || null;
      
      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nation-town-images')
          .upload(`companies/${fileName}`, logoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('nation-town-images')
          .getPublicUrl(`companies/${fileName}`);
        
        logoUrl = publicUrl;
      }

      let bannerUrl = initialData?.banner_url || null;
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `banner_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nation-town-images')
          .upload(`companies/${fileName}`, bannerFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('nation-town-images')
          .getPublicUrl(`companies/${fileName}`);
        bannerUrl = publicUrl;
      } else if (bannerPreview && bannerPreview.startsWith('http')) {
        bannerUrl = bannerPreview;
      }

      if (isEditMode && initialData?.id) {
        // Update company only
        const { error } = await (supabase as any)
          .from('companies')
          .update({
            name: formData.name,
            tagline: formData.tagline,
            description: formData.description,
            website_url: formData.website_url || null,
            email: formData.email || null,
            discord_invite: formData.discord_invite || null,
            business_type: formData.business_type,
            industry: formData.industry,
            headquarters_world: formData.headquarters_world || null,
            headquarters_coords: formData.headquarters_coords || null,
            parent_company_id: formData.parent_company_id === 'independent' ? null : formData.parent_company_id || null,
            town_id: formData.town_id === 'none' ? null : formData.town_id || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            logo_url: logoUrl,
            banner_url: bannerUrl,
            is_public: formData.is_public,
            is_open: formData.is_open,
          })
          .eq('id', initialData.id);
        if (error) throw error;

        // --- Remove staff upsert logic from here ---
        // (Staff will be managed via a dedicated button/modal in the staff section)
        // --- End staff upsert logic ---

        toast.success('Company updated successfully!');
        if (onCompanyUpdated) onCompanyUpdated();
        if (onClose) onClose();
        return;
      }
      // Only allow creation if not in edit mode
      if (!isEditMode) {
        // Create company
        const { data: company, error } = await supabase
          .from('companies')
          .insert({
            name: formData.name,
            slug: formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            tagline: formData.tagline,
            description: formData.description,
            website_url: formData.website_url || null,
            email: formData.email || null,
            discord_invite: formData.discord_invite || null,
            business_type: formData.business_type,
            industry: formData.industry,
            headquarters_world: formData.headquarters_world || null,
            headquarters_coords: formData.headquarters_coords || null,
            parent_company_id: formData.parent_company_id === 'independent' ? null : formData.parent_company_id || null,
            town_id: formData.town_id === 'none' ? null : formData.town_id || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            logo_url: logoUrl,
            banner_url: bannerUrl,
            owner_uuid: user.id,
            company_type: formData.parent_company_id && formData.parent_company_id !== 'independent' ? 'subsidiary' : 'independent',
            is_public: formData.is_public,
            is_open: formData.is_open,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        // --- Ensure creator is added as staff (Owner) ---
        let staffData = formData.staff
          .filter(staff => staff.user_uuid) // Only add if user_uuid is present
          .map(staff => ({
            company_id: company.id,
            user_uuid: staff.user_uuid,
            role: staff.role.trim(),
            added_by: user.id
          }));
        // Add creator as staff if not already present
        if (!staffData.some(s => s.user_uuid === user.id)) {
          staffData.unshift({
            company_id: company.id,
            user_uuid: user.id,
            role: 'Owner',
            added_by: user.id
          });
        }
        if (staffData.length > 0) {
          const { error: staffError } = await supabase
            .from('company_staff')
            .insert(staffData);
          if (staffError) {
            console.error('Error adding staff:', staffError);
            // Don't throw here as the company was created successfully
          }
        }
        // --- End ensure creator is staff ---

        toast.success('Company created successfully!');
        setIsOpen(false);
        setFormData({
          name: '',
          tagline: '',
          description: '',
          website_url: '',
          email: '',
          discord_invite: '',
          business_type: '',
          industry: '',
          headquarters_world: '',
          headquarters_coords: '',
          parent_company_id: 'independent',
          town_id: 'none',
          primary_color: '#1E40AF',
          secondary_color: '#F59E0B',
          staff: [],
        });
        setLogoFile(null);
        setLogoPreview(null);
        setBannerFile(null);
        setBannerPreview(null);
        setBannerUrlInput('');
        
        if (onCompanyCreated) {
          onCompanyCreated();
        }
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only render DialogTrigger if not in edit mode */}
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Company
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Company' : 'Create New Company'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your company details below. All fields are editable.'
              : 'Fill out the form below to create your new company. Required fields are marked with an asterisk (*).'}
          </DialogDescription>
          <div className="mt-2">
            {!showLevelDetails ? (
              <button
                type="button"
                className="flex items-center gap-2 text-blue-700 hover:underline text-sm bg-blue-50 rounded px-2 py-1 border border-blue-100"
                onClick={() => setShowLevelDetails(true)}
                aria-expanded="false"
              >
                <Info className="w-4 h-4 text-blue-500" />
                Company creation level requirements
                <span className="ml-1 text-xs">(Show details)</span>
              </button>
            ) : (
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex items-start gap-2 text-sm text-blue-900 relative">
                <Info className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
                <span style={{ whiteSpace: 'pre-line' }}>{LEVEL_REQUIREMENTS_HINT}</span>
                <button
                  type="button"
                  className="absolute top-2 right-2 text-xs text-blue-700 hover:underline"
                  onClick={() => setShowLevelDetails(false)}
                  aria-expanded="true"
                >
                  Hide details
                </button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {playerLevel === null && (
            <div className="mb-4 p-2 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 text-sm">
              <div>Could not find your Minecraft player data. Please make sure your account is linked.</div>
              <div className="mt-1 text-xs text-yellow-800">
                <b>Debug info:</b><br />
                {playerLevelDebug.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
              <div className="mt-1 text-xs text-yellow-800">
                <b>Lookups tried:</b> {playerLevelLookups.join(', ')}
              </div>
              <div className="mt-1 text-xs text-yellow-800">
                If you believe this is an error, check your Minecraft account linking in your profile settings or contact support.
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Brief description of your company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of your company (supports Markdown)"
                  rows={4}
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className={!formData.industry ? 'border-red-300 focus:border-red-500' : ''}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[999999] !fixed" 
                    position="popper" 
                    sideOffset={4}
                    avoidCollisions={true}
                    side="bottom"
                    align="start"
                  >
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.industry && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Selected: {formData.industry}
                  </p>
                )}
                {!formData.industry && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Industry is required
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <div className="flex items-center gap-2 relative">
                  <Select
                    id="business_type"
                    value={formData.business_type}
                    onValueChange={value => handleInputChange('business_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <Portal>
                      <SelectContent className="z-[99999]">
                        {businessTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            <span className="flex items-center gap-2">
                              {type}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span tabIndex={-1} className="focus:outline-none">
                                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    {businessTypeDescriptions[type]}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Portal>
                  </Select>
                </div>
                {levelError && (
                  <div className="text-xs text-red-600 mt-1">{levelError}</div>
                )}
                {formData.business_type && businessTypeDescriptions[formData.business_type] && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {businessTypeDescriptions[formData.business_type]}
                  </div>
                )}
                {!formData.business_type && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Business type is required
                  </p>
                )}
              </div>

              {/* Parent Company Selection */}
              <div className="space-y-2">
                <Label htmlFor="parent_company">Parent Company (Optional)</Label>
                <Select value={formData.parent_company_id} onValueChange={(value) => handleInputChange('parent_company_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent company (optional)" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[999999] !fixed" 
                    position="popper" 
                    sideOffset={4}
                    avoidCollisions={true}
                    side="bottom"
                    align="start"
                  >
                    <SelectItem value="independent">Independent Company</SelectItem>
                    {parentCompanies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.business_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.parent_company_id && formData.parent_company_id !== 'independent' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Subsidiary of: {parentCompanies.find(c => c.id === formData.parent_company_id)?.name}
                  </p>
                )}
              </div>

              {/* Town Location */}
              <div className="space-y-2">
                <Label htmlFor="town">Town Location (Optional)</Label>
                <Select value={formData.town_id} onValueChange={(value) => handleInputChange('town_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select town location (optional)" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[999999] !fixed" 
                    position="popper" 
                    sideOffset={4}
                    avoidCollisions={true}
                    side="bottom"
                    align="start"
                  >
                    <SelectItem value="none">No specific town</SelectItem>
                    {towns.map(town => (
                      <SelectItem key={town.id} value={town.id}>
                        {town.name} ({town.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.town_id && formData.town_id !== 'none' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Located in: {towns.find(t => t.id === formData.town_id)?.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters_world">World *</Label>
                <Select value={formData.headquarters_world} onValueChange={(value) => handleInputChange('headquarters_world', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select world" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[999999] !fixed" 
                    position="popper" 
                    sideOffset={4}
                    avoidCollisions={true}
                    side="bottom"
                    align="start"
                  >
                    {worlds.map(world => (
                      <SelectItem key={world} value={world}>
                        {world}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select which world your company operates in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters_coords">Headquarters Coordinates</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="X"
                    value={formData.headquarters_coords.split(',')[0] || ''}
                    onChange={e => {
                      const [, y = '', z = ''] = formData.headquarters_coords.split(',');
                      setFormData(prev => ({ ...prev, headquarters_coords: `${e.target.value},${y},${z}` }));
                    }}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Y"
                    value={formData.headquarters_coords.split(',')[1] || ''}
                    onChange={e => {
                      const [x = '', , z = ''] = formData.headquarters_coords.split(',');
                      setFormData(prev => ({ ...prev, headquarters_coords: `${x},${e.target.value},${z}` }));
                    }}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Z"
                    value={formData.headquarters_coords.split(',')[2] || ''}
                    onChange={e => {
                      const [x = '', y = ''] = formData.headquarters_coords.split(',');
                      setFormData(prev => ({ ...prev, headquarters_coords: `${x},${y},${e.target.value}` }));
                    }}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord_invite">Discord Invite</Label>
                <Input
                  id="discord_invite"
                  value={formData.discord_invite}
                  onChange={(e) => handleInputChange('discord_invite', e.target.value)}
                  placeholder="https://discord.gg/invite"
                />
              </div>
            </div>

            {/* Staff Management (Edit Mode Only) */}
            {isEditMode && initialData?.id && (
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Staff Members</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddStaffModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </Button>
                </div>
                {staffList.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No staff members added yet. Click "Add Staff" to add team members.
                  </p>
                )}
                {staffList.map((member, index) => (
                  <StaffMemberRow
                    key={member.user_uuid}
                    member={member}
                    onChange={() => {}}
                    onRemove={async () => {
                      try {
                        const { error } = await supabase
                          .from('company_staff')
                          .delete()
                          .eq('company_id', initialData.id)
                          .eq('user_uuid', member.user_uuid);
                        if (error) throw error;
                        toast.success('Staff member removed');
                        fetchStaffList();
                      } catch (e: any) {
                        toast.error('Failed to remove staff: ' + (e?.message || e?.details || e?.code || 'Unknown error'));
                      }
                    }}
                  />
                ))}
                <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Staff Member</DialogTitle>
                    </DialogHeader>
                    <AddStaffModalContent 
                      companyId={initialData.id} 
                      onClose={() => { setShowAddStaffModal(false); fetchStaffList(); }} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Visual Branding */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Visual Branding</h3>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Banner Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBannerFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-64"
                  />
                  <Input
                    type="url"
                    placeholder="Paste image URL..."
                    value={bannerUrlInput}
                    onChange={e => setBannerUrlInput(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setBannerPreview(bannerUrlInput);
                      setBannerFile(null);
                    }}
                    disabled={!bannerUrlInput}
                  >
                    Use URL
                  </Button>
                </div>
                {bannerPreview && (
                  <div className="mt-2">
                    <img src={bannerPreview} alt="Banner Preview" className="max-h-32 rounded border" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Public/Open Toggle */}
            <div className="space-y-2">
              <Label htmlFor="is_public">Public Company</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked ? 'true' : 'false')}
                  className="rounded"
                />
                <label htmlFor="is_public" className="text-sm text-muted-foreground">
                  Make this company visible to all users
                </label>
              </div>
            </div>

            {/* Open for Joining Toggle */}
            <div className="space-y-2">
              <Label htmlFor="is_open">Open for Joining</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_open"
                  checked={formData.is_open}
                  onChange={(e) => handleInputChange('is_open', e.target.checked ? 'true' : 'false')}
                  className="rounded"
                />
                <label htmlFor="is_open" className="text-sm text-muted-foreground">
                  Allow any user to join this company
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 mt-8">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={(() => { const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'; return isSubmitting || (!isAdmin && (!canCreate || playerLevel === null)); })()}>
                {isEditMode ? 'Save Changes' : 'Create Company'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StaffMemberRow: React.FC<{
  member: { user_uuid: string; displayName: string; role: string };
  onChange: (m: { user_uuid: string; displayName: string; role: string }) => void;
  onRemove: () => void;
}> = ({ member, onChange, onRemove }) => {
  const [search, setSearch] = useState('');
  const { players, loading } = usePlayerSearch(search);
  return (
    <div className="flex gap-2 p-3 border rounded-lg items-center">
      <div className="flex-1">
        {member.user_uuid ? (
          <div className="flex items-center gap-2">
            <span>{member.displayName}</span>
            <Button size="xs" variant="ghost" onClick={() => onChange({ user_uuid: '', displayName: '', role: member.role })}>
              Change
            </Button>
          </div>
        ) : (
          <div>
            <Input
              placeholder="Search user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search.length >= 2 && (
              <div className="max-h-32 overflow-y-auto border rounded mt-1 bg-background">
                {loading ? (
                  <div className="p-2 text-muted-foreground">Searching...</div>
                ) : players.length === 0 ? (
                  <div className="p-2 text-muted-foreground">No users found</div>
                ) : players.map(player => (
                  <div
                    key={player.id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => onChange({ user_uuid: player.id, displayName: player.displayName, role: member.role })}
                  >
                    {player.displayName} ({player.id})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <Input
          placeholder="Role/Position"
          value={member.role}
          onChange={e => onChange({ ...member, role: e.target.value })}
          className="mt-2"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

// AddStaffModalContent for adding staff in the modal
const AddStaffModalContent: React.FC<{ companyId: string; onClose: () => void }> = ({ companyId, onClose }) => {
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [role, setRole] = useState('Staff');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (search.length >= 2) {
      setLoading(true);
      setError(null);
      supabase
        .from('profiles')
        .select('id, minecraft_username, full_name')
        .ilike('minecraft_username', `%${search}%`)
        .then(({ data, error }) => {
          setProfiles(data || []);
          setLoading(false);
          if (error) setError('Error searching profiles');
        });
    } else {
      setProfiles([]);
    }
  }, [search]);

  const handleAdd = async () => {
    if (!selectedProfile) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('company_staff')
        .insert({
          company_id: companyId,
          user_uuid: selectedProfile.id,
          role
        });
      if (error) {
        setError('Failed to add staff: ' + (error.message || error.details || error.code || 'Unknown error'));
        throw error;
      }
      toast.success('Staff member added!');
      onClose();
    } catch (e: any) {
      setError('Failed to add staff: ' + (e?.message || e?.details || e?.code || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by Minecraft username..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        disabled={!!selectedProfile}
      />
      {search.length >= 2 && !selectedProfile && (
        <div className="max-h-40 overflow-y-auto border rounded">
          {loading ? (
            <div className="p-2 text-muted-foreground">Searching...</div>
          ) : profiles.length === 0 ? (
            <div className="p-2 text-muted-foreground">No profiles found</div>
          ) : profiles.map(profile => (
            <div
              key={profile.id}
              className="p-2 hover:bg-muted cursor-pointer"
              onClick={() => setSelectedProfile(profile)}
            >
              {profile.minecraft_username} {profile.full_name ? `(${profile.full_name})` : ''}
            </div>
          ))}
        </div>
      )}
      {selectedProfile && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span>{selectedProfile.minecraft_username} {selectedProfile.full_name ? `(${selectedProfile.full_name})` : ''}</span>
          <Button size="xs" variant="ghost" onClick={() => setSelectedProfile(null)}>
            Remove
          </Button>
        </div>
      )}
      <div>
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="z-[99999] min-w-[180px]" position="popper" side="top" forceMount>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleAdd} disabled={!selectedProfile || submitting}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default CreateCompanyModal; 