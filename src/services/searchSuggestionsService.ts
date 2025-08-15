import { supabase } from '@/integrations/supabase/client';

export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'trending' | 'popular' | 'recent' | 'suggestion';
  category: 'player' | 'town' | 'nation' | 'company' | 'wiki' | 'general';
  searchTerm: string;
  clickCount?: number;
  lastClicked?: string;
}

export interface TrendingSearch {
  term: string;
  count: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

export class SearchSuggestionsService {
  private static readonly SUGGESTIONS_KEY = 'searchSuggestions';
  private static readonly TRENDING_KEY = 'trendingSearches';
  private static readonly CLICK_HISTORY_KEY = 'searchClickHistory';

  // Get trending searches based on recent activity
  static async getTrendingSearches(): Promise<TrendingSearch[]> {
    try {
      // Get recent search clicks from localStorage
      const clickHistory = this.getClickHistory();
      
      // Count search terms and categorize them
      const termCounts = new Map<string, { count: number; category: string; lastClick: number }>();
      
      clickHistory.forEach(click => {
        const existing = termCounts.get(click.term);
        if (existing) {
          existing.count++;
          existing.lastClick = Math.max(existing.lastClick, click.timestamp);
        } else {
          termCounts.set(click.term, {
            count: 1,
            category: click.category,
            lastClick: click.timestamp
          });
        }
      });

      // Convert to trending searches and sort by count
      const trending = Array.from(termCounts.entries())
        .map(([term, data]) => ({
          term,
          count: data.count,
          category: data.category,
          trend: this.calculateTrend(data.lastClick, data.count)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return trending;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  // Get popular searches based on stored data
  static async getPopularSearches(): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [
        {
          id: 'popular-nations',
          title: 'Active Nations',
          description: 'You clicked on nations',
          type: 'popular',
          category: 'nation',
          searchTerm: 'nations'
        },
        {
          id: 'popular-towns',
          title: 'Major Towns',
          description: 'You clicked on towns',
          type: 'popular',
          category: 'town',
          searchTerm: 'towns'
        },
        {
          id: 'popular-companies',
          title: 'Top Companies',
          description: 'You clicked on companies',
          type: 'popular',
          category: 'company',
          searchTerm: 'companies'
        },
        {
          id: 'popular-wiki',
          title: 'Wiki Pages',
          description: 'You clicked on wiki content',
          type: 'popular',
          category: 'wiki',
          searchTerm: 'wiki'
        }
      ];

      return suggestions;
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  // Get contextual suggestions based on current data
  static async getContextualSuggestions(
    profiles: any[],
    nations: any[],
    companies: any[],
    wikiCategories: any[]
  ): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [];

      // Add suggestions based on available data
      if (nations.length > 0) {
        suggestions.push({
          id: 'context-nations',
          title: 'Nations',
          description: `${nations.length} nations available`,
          type: 'suggestion',
          category: 'nation',
          searchTerm: 'nations'
        });
      }

      if (companies.length > 0) {
        suggestions.push({
          id: 'context-companies',
          title: 'Businesses',
          description: `${companies.length} companies registered`,
          type: 'suggestion',
          category: 'company',
          searchTerm: 'businesses'
        });
      }

      if (wikiCategories.length > 0) {
        const totalPages = wikiCategories.reduce((sum, cat) => sum + (cat.pages?.length || 0), 0);
        suggestions.push({
          id: 'context-wiki',
          title: 'Wiki',
          description: `${totalPages} pages available`,
          type: 'suggestion',
          category: 'wiki',
          searchTerm: 'wiki'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
      return [];
    }
  }

  // Record a search click for analytics
  static recordSearchClick(term: string, category: string): void {
    try {
      const clickHistory = this.getClickHistory();
      const newClick = {
        term: term.toLowerCase(),
        category,
        timestamp: Date.now()
      };

      // Add new click and keep only last 100 clicks
      clickHistory.unshift(newClick);
      if (clickHistory.length > 100) {
        clickHistory.splice(100);
      }

      localStorage.setItem(this.CLICK_HISTORY_KEY, JSON.stringify(clickHistory));
    } catch (error) {
      console.error('Error recording search click:', error);
    }
  }

  // Get search click history from localStorage
  private static getClickHistory(): Array<{ term: string; category: string; timestamp: number }> {
    try {
      const saved = localStorage.getItem(this.CLICK_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing click history:', error);
      return [];
    }
  }

  // Calculate trend based on recency and frequency
  private static calculateTrend(lastClick: number, count: number): 'up' | 'down' | 'stable' {
    const now = Date.now();
    const hoursSinceLastClick = (now - lastClick) / (1000 * 60 * 60);
    
    if (hoursSinceLastClick < 24 && count > 5) return 'up';
    if (hoursSinceLastClick > 168 && count < 3) return 'down'; // 1 week
    return 'stable';
  }

  // Get search suggestions for a specific query
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!query.trim() || query.length < 2) return [];

      const suggestions: string[] = [];
      const lowerQuery = query.toLowerCase();

      // Add common search patterns
      const commonPatterns = [
        'towns', 'nations', 'companies', 'wiki',
        'online', 'active', 'popular', 'recent', 'top'
      ];

      commonPatterns.forEach(pattern => {
        if (pattern.includes(lowerQuery) || lowerQuery.includes(pattern)) {
          suggestions.push(pattern);
        }
      });

      // Add query variations
      if (lowerQuery.includes('town')) suggestions.push('towns');
      if (lowerQuery.includes('nation')) suggestions.push('nations');
      if (lowerQuery.includes('company')) suggestions.push('companies');

      // Remove duplicates and limit results
      return [...new Set(suggestions)].slice(0, 5);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get personalized suggestions based on user's search history
  static getPersonalizedSuggestions(userId?: string): SearchSuggestion[] {
    try {
      if (!userId) return [];

      const userHistoryKey = `userSearchHistory_${userId}`;
      const saved = localStorage.getItem(userHistoryKey);
      
      if (!saved) return [];

      const userHistory = JSON.parse(saved);
      const recentSearches = userHistory
        .slice(0, 5)
        .map((term: string, index: number) => ({
          id: `personal-${index}`,
          title: term,
          description: 'Your recent search',
          type: 'recent' as const,
          category: 'general' as const,
          searchTerm: term
        }));

      return recentSearches;
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
      return [];
    }
  }
}
