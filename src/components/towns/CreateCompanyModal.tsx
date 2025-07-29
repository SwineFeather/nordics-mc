import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  slug: string;
  description: string;
  tagline: string;
  industry: string;
  business_type: string;
  headquarters_coords: string;
  headquarters_world: string;
  website_url: string;
  discord_invite: string;
  email: string;
  tags: string[];
  logo_url?: string;
  banner_url?: string;
}

interface CreateCompanyModalProps {
  onCompanyCreated: () => Promise<void>;
}

export const CreateCompanyModal = ({ onCompanyCreated }: CreateCompanyModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    tagline: '',
    industry: '',
    business_type: '',
    headquarters_coords: '',
    headquarters_world: '',
    website_url: '',
    discord_invite: '',
    email: '',
    tags: [],
    logo_url: '',
    banner_url: ''
  });

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const tagsArray = value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      tagline: '',
      industry: '',
      business_type: '',
      headquarters_coords: '',
      headquarters_world: '',
      website_url: '',
      discord_invite: '',
      email: '',
      tags: [],
      logo_url: '',
      banner_url: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('You must be logged in to create a company');
      return;
    }

    setLoading(true);
    try {
      const companyData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        tagline: formData.tagline,
        industry: formData.industry,
        business_type: formData.business_type,
        headquarters_coords: formData.headquarters_coords,
        headquarters_world: formData.headquarters_world,
        website_url: formData.website_url,
        discord_invite: formData.discord_invite,
        email: formData.email,
        tags: formData.tags,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        owner_uuid: profile.id,
        status: 'active',
        is_public: true,
        member_count: 1
      };

      const { error } = await supabase
        .from('companies')
        .insert(companyData);

      if (error) throw error;

      toast.success('Company created successfully!');
      await onCompanyCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen}>
        Create Company
      </Button>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Company</DialogTitle>
            <CardDescription>
              Fill in the details to register your company in our directory.
            </CardDescription>
          </DialogHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Company Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="headquarters_coords">Headquarters Coordinates</Label>
                <Input
                  id="headquarters_coords"
                  name="headquarters_coords"
                  value={formData.headquarters_coords}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="headquarters_world">Headquarters World</Label>
                <Input
                  id="headquarters_world"
                  name="headquarters_world"
                  value={formData.headquarters_world}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  name="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="discord_invite">Discord Invite</Label>
                <Input
                  id="discord_invite"
                  name="discord_invite"
                  type="url"
                  value={formData.discord_invite}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagChange}
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  name="banner_url"
                  type="url"
                  value={formData.banner_url || ''}
                  onChange={handleInputChange}
                />
              </div>

              <Button disabled={loading}>
                {loading ? 'Creating...' : 'Create Company'}
              </Button>
            </form>
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  );
};
