import { supabase } from '@/integrations/supabase/client';

export interface TownCompany {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  industry: string | null;
  business_type: string | null;
  member_count: number;
  max_members: number | null;
  is_public: boolean;
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  total_revenue: number;
  status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  owner_uuid: string;
  ceo_uuid: string | null;
}

export class TownCompaniesService {
  /**
   * Get all companies registered under a specific town
   */
  static async getTownCompanies(townId: number): Promise<TownCompany[]> {
    try {
      console.log(`Getting companies for town ID: ${townId}`);
      
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          slug,
          tagline,
          description,
          logo_url,
          banner_url,
          industry,
          business_type,
          member_count,
          max_members,
          is_public,
          is_featured,
          average_rating,
          review_count,
          total_revenue,
          status,
          verification_status,
          created_at,
          updated_at,
          owner_uuid,
          ceo_uuid
        `)
        .eq('town_id', townId)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('average_rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching town companies:', error);
        return [];
      }

      console.log(`Found ${companies?.length || 0} companies for town ${townId}`);
      return companies || [];
    } catch (error) {
      console.error('Error in getTownCompanies:', error);
      return [];
    }
  }

  /**
   * Get company count for a town
   */
  static async getTownCompanyCount(townId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('town_id', townId)
        .eq('status', 'active')
        .eq('is_public', true);

      if (error) {
        console.error('Error fetching town company count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTownCompanyCount:', error);
      return 0;
    }
  }
}

