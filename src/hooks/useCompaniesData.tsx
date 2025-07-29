
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  website_url?: string;
  email?: string;
  discord_invite?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  secondary_color?: string;
  business_type: string;
  industry: string;
  founded_date?: string;
  headquarters_world?: string;
  headquarters_coords?: string;
  parent_company_id?: string;
  town_id?: string;
  company_type: 'parent' | 'subsidiary' | 'independent';
  social_links?: any;
  member_count: number;
  max_members?: number;
  is_public: boolean;
  is_featured: boolean;
  gallery_images?: any;
  featured_products?: any;
  achievements?: any;
  total_revenue: number;
  total_transactions: number;
  average_rating: number;
  review_count: number;
  owner_uuid: string;
  ceo_uuid?: string;
  executives?: any;
  members?: any;
  status: string;
  verification_status: string;
  verification_date?: string;
  verified_by?: string;
  keywords?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export const useCompaniesData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading, error };
};
