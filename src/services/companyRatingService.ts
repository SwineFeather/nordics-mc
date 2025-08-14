import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyRating {
  id: string;
  company_id: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyRatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export class CompanyRatingService {
  /**
   * Submit a rating for a company
   */
  static async submitRating(
    companyId: string, 
    rating: number, 
    comment: string, 
    userId: string,
    username: string
  ): Promise<boolean> {
    try {
      // Check if user already rated this company
      const { data: existingRating } = await supabase
        .from('company_ratings')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .single();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('company_ratings')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (error) throw error;
        toast.success('Rating updated successfully!');
      } else {
        // Create new rating
        const { error } = await supabase
          .from('company_ratings')
          .insert({
            company_id: companyId,
            user_id: userId,
            username,
            rating,
            comment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Rating submitted successfully!');
      }

      // Update company's average rating
      await this.updateCompanyRatingStats(companyId);
      
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      return false;
    }
  }

  /**
   * Get all ratings for a company
   */
  static async getCompanyRatings(companyId: string): Promise<CompanyRating[]> {
    try {
      const { data, error } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company ratings:', error);
      return [];
    }
  }

  /**
   * Get rating statistics for a company
   */
  static async getCompanyRatingStats(companyId: string): Promise<CompanyRatingStats> {
    try {
      const { data, error } = await supabase
        .from('company_ratings')
        .select('rating')
        .eq('company_id', companyId);

      if (error) throw error;

      const ratings = data || [];
      const totalRatings = ratings.length;
      
      if (totalRatings === 0) {
        return {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: {}
        };
      }

      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
      
      // Calculate rating distribution
      const distribution: { [key: number]: number } = {};
      for (let i = 1; i <= 5; i++) {
        distribution[i] = ratings.filter(r => r.rating === i).length;
      }

      return {
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        total_ratings: totalRatings,
        rating_distribution: distribution
      };
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {}
      };
    }
  }

  /**
   * Check if user has already rated this company
   */
  static async getUserRating(companyId: string, userId: string): Promise<CompanyRating | null> {
    try {
      const { data, error } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
  }

  /**
   * Update company's average rating in the companies table
   */
  private static async updateCompanyRatingStats(companyId: string): Promise<void> {
    try {
      const stats = await this.getCompanyRatingStats(companyId);
      
      const { error } = await supabase
        .from('companies')
        .update({
          average_rating: stats.average_rating,
          review_count: stats.total_ratings
        })
        .eq('id', companyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating company rating stats:', error);
    }
  }
}

