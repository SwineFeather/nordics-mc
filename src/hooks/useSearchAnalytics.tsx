import { useState, useEffect, useCallback } from 'react';
import { SearchSuggestionsService } from '@/services/searchSuggestionsService';

export interface SearchAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  mostClickedItems: Array<{ term: string; count: number }>;
  recentClicks: string[];
  clickSuccessRate: number;
}

export const useSearchAnalytics = () => {
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    totalClicks: 0,
    uniqueClicks: 0,
    mostClickedItems: [],
    recentClicks: [],
    clickSuccessRate: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  // Record a click action (not search term)
  const recordSearch = useCallback((term: string, category: string, hasResults: boolean = true) => {
    try {
      // Record in the suggestions service
      SearchSuggestionsService.recordSearchClick(term, category);
      
      // Update local analytics
      setAnalytics(prev => {
        const newRecentClicks = [term, ...prev.recentClicks.filter(s => s !== term)].slice(0, 10);
        
        // Update most clicked items
        const termCounts = new Map(prev.mostClickedItems.map(item => [item.term, item.count]));
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
        
        const newMostClickedItems = Array.from(termCounts.entries())
          .map(([term, count]) => ({ term, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Calculate success rate
        const totalClicks = prev.totalClicks + 1;
        const successfulClicks = prev.totalClicks * (prev.clickSuccessRate / 100) + (hasResults ? 1 : 0);
        const newSuccessRate = (successfulClicks / totalClicks) * 100;

        return {
          totalClicks,
          uniqueClicks: new Set([...prev.recentClicks, term]).size,
          mostClickedItems: newMostClickedItems,
          recentClicks: newRecentClicks,
          clickSuccessRate: newSuccessRate
        };
      });
    } catch (error) {
      console.error('Error recording search click:', error);
    }
  }, []);

  // Get search suggestions based on analytics
  const getSmartSuggestions = useCallback(async (query: string, limit: number = 5) => {
    try {
      const suggestions = await SearchSuggestionsService.getSearchSuggestions(query);
      
      // Add analytics-based suggestions
      const analyticsSuggestions = analytics.mostClickedItems
        .filter(item => item.term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit - suggestions.length)
        .map(item => item.term);

      return [...suggestions, ...analyticsSuggestions].slice(0, limit);
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [];
    }
  }, [analytics]);

  // Get trending searches with analytics context
  const getTrendingSearchesWithContext = useCallback(async () => {
    try {
      const trending = await SearchSuggestionsService.getTrendingSearches();
      
      // Enhance with analytics data
      return trending.map(item => ({
        ...item,
        isPopular: analytics.mostClickedItems.some(term => term.term === item.term),
        userClicked: analytics.recentClicks.includes(item.term)
      }));
    } catch (error) {
      console.error('Error getting trending searches with context:', error);
      return [];
    }
  }, [analytics]);

  // Get personalized search recommendations
  const getPersonalizedRecommendations = useCallback(() => {
    const recommendations = [];

    // Based on recent clicks
    if (analytics.recentClicks.length > 0) {
      recommendations.push({
        type: 'recent',
        title: 'Continue Exploring',
        items: analytics.recentClicks.slice(0, 3).map(term => ({
          term,
          reason: 'You clicked on this recently'
        }))
      });
    }

    // Based on most clicked items
    if (analytics.mostClickedItems.length > 0) {
      recommendations.push({
        type: 'popular',
        title: 'Your Favorites',
        items: analytics.mostClickedItems.slice(0, 3).map(item => ({
          term: item.term,
          reason: `You've clicked ${item.count} times`
        }))
      });
    }

    return recommendations;
  }, [analytics]);

  // Load analytics from localStorage on mount
  useEffect(() => {
    try {
      const savedAnalytics = localStorage.getItem('searchAnalytics');
      if (savedAnalytics) {
        setAnalytics(JSON.parse(savedAnalytics));
      }
    } catch (error) {
      console.error('Error loading search analytics:', error);
    }
  }, []);

  // Save analytics to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Error saving search analytics:', error);
    }
  }, [analytics]);

  // Get search performance insights
  const getSearchInsights = useCallback(() => {
    const insights = [];

    if (analytics.clickSuccessRate > 80) {
      insights.push({
        type: 'success',
        message: 'Great click success rate!',
        value: `${analytics.clickSuccessRate.toFixed(1)}%`
      });
    } else if (analytics.clickSuccessRate < 50) {
      insights.push({
        type: 'warning',
        message: 'Consider exploring different content',
        value: `${analytics.clickSuccessRate.toFixed(1)}%`
      });
    }

    if (analytics.uniqueClicks > 20) {
      insights.push({
        type: 'info',
        message: 'You\'ve explored many topics',
        value: `${analytics.uniqueClicks} unique clicks`
      });
    }

    return insights;
  }, [analytics]);

  return {
    analytics,
    isLoading,
    recordSearch,
    getSmartSuggestions,
    getTrendingSearchesWithContext,
    getPersonalizedRecommendations,
    getSearchInsights
  };
};
