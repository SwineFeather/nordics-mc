
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '@/hooks/useProfiles';
import { useSupabaseWikiData } from '@/hooks/useSupabaseWikiData';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import { SupabaseTownService, SupabaseNationData, SupabaseTownData } from '@/services/supabaseTownService';
import { SearchSuggestionsService, SearchSuggestion, TrendingSearch } from '@/services/searchSuggestionsService';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { User, Building2, MapPin, FileText, Crown, TrendingUp, Clock, Star, Search as SearchIcon, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  type: 'player' | 'town' | 'company' | 'wiki' | 'nation';
  description?: string;
  priority?: number;
  data?: any;
  onClick: () => void;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RecommendedSearch {
  id: string;
  title: string;
  description: string;
  type: 'trending' | 'recent' | 'popular' | 'suggestion' | 'personalized';
  icon: React.ReactNode;
  onClick: () => void;
  category?: string;
  trend?: 'up' | 'down' | 'stable';
  reason?: string;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [nations, setNations] = useState<(SupabaseNationData & { towns: SupabaseTownData[] })[]>([]);
  const [towns, setTowns] = useState<SupabaseTownData[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [contextualSuggestions, setContextualSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();

  const { profiles } = useProfiles({ fetchAll: true });
  const { categories: wikiCategories, fileStructure: wikiFileStructure } = useSupabaseWikiData();
  const { companies } = useCompaniesData();
  const { 
    analytics, 
    recordSearch, 
    getPersonalizedRecommendations, 
    getSearchInsights 
  } = useSearchAnalytics();

  // Recursive function to flatten all wiki pages from nested categories and subcategories
  const flattenAllWikiPages = useCallback((categories: any[]): any[] => {
    const allPages: any[] = [];
    
    const processCategory = (category: any) => {
      // Add pages from this category
      if (category.pages && category.pages.length > 0) {
        category.pages.forEach((page: any) => {
          allPages.push({
            ...page,
            categoryTitle: category.title,
            categorySlug: category.slug,
            fullPath: `${category.title}/${page.title}`
          });
        });
      }
      
      // Recursively process subcategories
      if (category.children && category.children.length > 0) {
        category.children.forEach(processCategory);
      }
    };
    
    categories.forEach(processCategory);
    return allPages;
  }, []);

  // Function to flatten all wiki files from the file structure
  const flattenAllWikiFiles = useCallback((fileStructure: any[]): any[] => {
    const allFiles: any[] = [];
    
    const processItem = (item: any) => {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        // Extract category from path
        const pathParts = item.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const categoryName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Root';
        
        allFiles.push({
          id: item.path, // Use path as ID
          title: fileName.replace('.md', '').replace(/-/g, ' ').replace(/_/g, ' '),
          slug: fileName.replace('.md', ''),
          path: item.path,
          categoryTitle: categoryName,
          categorySlug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          fullPath: item.path,
          isPage: true
        });
      }
      
      // Recursively process children
      if (item.children && item.children.length > 0) {
        item.children.forEach(processItem);
      }
    };
    
    fileStructure.forEach(processItem);
    return allFiles;
  }, []);

  // Create fallback wiki data for testing when no real data is available
  const createFallbackWikiData = useCallback((): any[] => {
    console.log('🔄 Creating fallback wiki data for testing');
    return [
      {
        id: 'fallback-category-1',
        title: 'Getting Started',
        slug: 'getting-started',
        description: 'Basic information to get you started',
        pages: [
          {
            id: 'fallback-page-1',
            title: 'Welcome to the Wiki',
            slug: 'welcome',
            content: 'Welcome to our community wiki! This is a sample page.',
            description: 'Introduction to the wiki system',
            tags: ['welcome', 'introduction'],
            categoryTitle: 'Getting Started',
            categorySlug: 'getting-started'
          },
          {
            id: 'fallback-page-2',
            title: 'Quick Start Guide',
            slug: 'quick-start',
            content: 'Learn how to navigate and use the wiki effectively.',
            description: 'Fast track to wiki usage',
            tags: ['guide', 'tutorial'],
            categoryTitle: 'Getting Started',
            categorySlug: 'getting-started'
          }
        ]
      },
      {
        id: 'fallback-category-2',
        title: 'Community',
        slug: 'community',
        description: 'Information about our community',
        pages: [
          {
            id: 'fallback-page-3',
            title: 'Community Guidelines',
            slug: 'guidelines',
            content: 'Rules and guidelines for community participation.',
            description: 'Community behavior standards',
            tags: ['rules', 'guidelines'],
            categoryTitle: 'Community',
            categorySlug: 'community'
          }
        ]
      }
    ];
  }, []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => setSearchTerm(''), 150);
    }
  }, [open]);

  // Fetch nations and towns data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nationsData, townsData] = await Promise.all([
          SupabaseTownService.getNationsWithTowns(),
          SupabaseTownService.getAllTowns()
        ]);
        setNations(nationsData);
        setTowns(townsData);
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Use wiki file structure if available, otherwise fall back to categories or fallback data
        let effectiveWikiCategories;
        if (wikiFileStructure && wikiFileStructure.length > 0) {
          // Convert file structure to categories for suggestions
          const allFiles = flattenAllWikiFiles(wikiFileStructure);
          const categoriesByFolder = new Map();
          
          allFiles.forEach(file => {
            const categoryName = file.categoryTitle || 'Root';
            if (!categoriesByFolder.has(categoryName)) {
              categoriesByFolder.set(categoryName, {
                id: categoryName.toLowerCase().replace(/\s+/g, '-'),
                title: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                description: `Files in ${categoryName}`,
                pages: []
              });
            }
            categoriesByFolder.get(categoryName).pages.push(file);
          });
          
          effectiveWikiCategories = Array.from(categoriesByFolder.values());
        } else if (wikiCategories && wikiCategories.length > 0) {
          effectiveWikiCategories = wikiCategories;
        } else {
          effectiveWikiCategories = createFallbackWikiData();
        }
        
        const [trending, popular, contextual] = await Promise.all([
          SearchSuggestionsService.getTrendingSearches(),
          SearchSuggestionsService.getPopularSearches(),
          SearchSuggestionsService.getContextualSuggestions(profiles, nations, companies, effectiveWikiCategories)
        ]);
        
        setTrendingSearches(trending);
        setPopularSearches(popular);
        setContextualSuggestions(contextual);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    };

    if (open) {
      fetchSuggestions();
    }
  }, [open, profiles, nations, companies, wikiFileStructure, wikiCategories, createFallbackWikiData, flattenAllWikiFiles]);

  // Debug wiki data structure
  useEffect(() => {
    if (wikiFileStructure && wikiFileStructure.length > 0) {
      console.log('🔍 Wiki File Structure loaded:', wikiFileStructure.length);
      console.log('📁 Wiki File Structure:', wikiFileStructure);
      
      // Count total files
      const totalFiles = wikiFileStructure.reduce((total, item) => {
        const countFiles = (item: any): number => {
          let count = 0;
          if (item.type === 'file' && item.name.endsWith('.md')) {
            count = 1;
          }
          if (item.children && item.children.length > 0) {
            count += item.children.reduce((subTotal: number, child: any) => subTotal + countFiles(child), 0);
          }
          return count;
        };
        return total + countFiles(item);
      }, 0);
      
      console.log(`📄 Total wiki files found: ${totalFiles}`);
      
      // Log first few items for debugging
      wikiFileStructure.slice(0, 3).forEach((item, index) => {
        console.log(`📁 Item ${index + 1}:`, {
          type: item.type,
          name: item.name,
          path: item.path,
          children: item.children?.length || 0
        });
        
        // Log first few children in this item
        if (item.children && item.children.length > 0) {
          item.children.slice(0, 2).forEach((child: any, childIndex: number) => {
            console.log(`  📄 Child ${childIndex + 1}:`, {
              type: child.type,
              name: child.name,
              path: child.path,
              isPage: child.isPage
            });
          });
        }
      });
    } else if (wikiCategories && wikiCategories.length > 0) {
      console.log('🔍 Wiki Categories loaded:', wikiCategories.length);
      console.log('📁 Wiki Categories structure:', wikiCategories);
      
      // Count total pages
      const totalPages = wikiCategories.reduce((total, cat) => {
        const categoryPages = cat.pages?.length || 0;
        const subcategoryPages = cat.children?.reduce((subTotal, subCat) => 
          subTotal + (subCat.pages?.length || 0), 0) || 0;
        return total + categoryPages + subcategoryPages;
      }, 0);
      
      console.log(`📄 Total wiki pages found: ${totalPages}`);
      
      // Log first few categories for debugging
      wikiCategories.slice(0, 3).forEach((cat, index) => {
        console.log(`📁 Category ${index + 1}:`, {
          title: cat.title,
          slug: cat.slug,
          pages: cat.pages?.length || 0,
          children: cat.children?.length || 0
        });
        
        // Log first few pages in this category
        if (cat.pages && cat.pages.length > 0) {
          cat.pages.slice(0, 2).forEach((page: any, pageIndex: number) => {
            console.log(`  📄 Page ${pageIndex + 1}:`, {
              id: page.id,
              title: page.title,
              slug: page.slug,
              content: page.content?.substring(0, 50) + '...',
              description: page.description,
              tags: page.tags
            });
          });
        }
      });
    } else {
      console.log('⚠️ No wiki data loaded');
    }
  }, [wikiFileStructure, wikiCategories]);

  // Generate recommended searches
  const recommendedSearches = useMemo((): RecommendedSearch[] => {
    const recommendations: RecommendedSearch[] = [];

    // Add trending searches
    trendingSearches.slice(0, 2).forEach(trending => {
      recommendations.push({
        id: `trending-${trending.term}`,
        title: trending.term,
        description: 'Trending search',
        type: 'trending',
        icon: trending.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
               trending.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-600" /> :
               <Minus className="w-4 h-4 text-gray-600" />,
        onClick: () => setSearchTerm(trending.term),
        category: trending.category,
        trend: trending.trend
      });
    });

    // Add popular searches (excluding "popular players")
    popularSearches
      .filter(popular => popular.searchTerm !== 'players')
      .slice(0, 1)
      .forEach(popular => {
        recommendations.push({
          id: `popular-${popular.id}`,
          title: popular.title,
          description: popular.description,
          type: 'popular',
          icon: <Star className="w-4 h-4 text-yellow-600" />,
          onClick: () => navigate(popular.searchTerm === 'nations' ? '/towns/nations' :
                                 popular.searchTerm === 'towns' ? '/towns/towns' :
                                 popular.searchTerm === 'companies' ? '/towns/businesses' :
                                 popular.searchTerm === 'wiki' ? '/wiki' : '/community'),
          category: popular.category
        });
      });

    // Add contextual suggestions
    contextualSuggestions.slice(0, 1).forEach(suggestion => {
      recommendations.push({
        id: `context-${suggestion.id}`,
        title: suggestion.title,
        description: suggestion.description,
        type: 'suggestion',
        icon: <SearchIcon className="w-4 h-4 text-blue-600" />,
        onClick: () => navigate(suggestion.searchTerm === 'nations' ? '/towns/nations' :
                               suggestion.searchTerm === 'businesses' ? '/towns/businesses' :
                               suggestion.searchTerm === 'wiki' ? '/wiki' : '/community'),
        category: suggestion.category
      });
    });

    // Add personalized recommendations
    const personalized = getPersonalizedRecommendations();
    personalized.forEach(rec => {
      rec.items.slice(0, 2).forEach(item => {
        recommendations.push({
          id: `personalized-${item.term}`,
          title: item.term,
          description: item.reason,
          type: 'personalized',
          icon: <BarChart3 className="w-4 h-4 text-purple-600" />,
          onClick: () => setSearchTerm(item.term),
          reason: item.reason
        });
      });
    });

    return recommendations;
  }, [trendingSearches, popularSearches, contextualSuggestions, navigate, getPersonalizedRecommendations]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const allResults: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    const getMatchScore = (term: string, fields: string[]): number => {
      let score = 0;
      const lowerTerm = term.toLowerCase();
      fields.forEach(field => {
        const lowerField = (field || '').toLowerCase();
        if (lowerField === lowerTerm) score += 100;
        else if (lowerField.startsWith(lowerTerm)) score += 50;
        else if (lowerField.includes(lowerTerm)) score += 25;
      });
      return score;
    };

    // Search players
    profiles.forEach(profile => {
        const matchScore = getMatchScore(term, [profile.username, profile.displayName || '', profile.minecraft_username || '']);
        if (matchScore > 0) {
            allResults.push({
                id: `player-${profile.id}`, // Ensure unique ID
                title: profile.displayName || profile.username, // Remove type label
                type: 'player',
                description: `${profile.role || 'Player'} • ${profile.town || 'No town'}`,
                priority: matchScore,
                data: profile,
                onClick: () => {
                  // Always navigate using the exact username so /community opens the right profile
                  if (profile.username) {
                    navigate(`/community?player=${encodeURIComponent(profile.username)}`);
                  } else if (profile.displayName) {
                    navigate(`/community?player=${encodeURIComponent(profile.displayName)}`);
                  } else if (profile.minecraft_username) {
                    navigate(`/community?player=${encodeURIComponent(profile.minecraft_username)}`);
                  }
                }
            });
        }
    });

    // Search nations
    nations.forEach(nation => {
      if (getMatchScore(term, [nation.name]) > 0) {
        allResults.push({ 
          id: `nation-${nation.id}`, // Ensure unique ID
          title: nation.name, // Remove type label
          type: 'nation', 
          description: `${nation.towns?.length || 0} towns`, 
          priority: getMatchScore(term, [nation.name]), 
          onClick: () => navigate('/towns/nations') 
        });
      }
    });

    // Search towns - ONLY show towns that belong to nations (not independent towns)
    nations.forEach(nation => {
      nation.towns?.forEach(town => {
        if (getMatchScore(term, [town.name]) > 0) {
          allResults.push({ 
            id: `town-${nation.id}-${town.name}`, // Ensure unique ID
            title: town.name, // Remove type label
            type: 'town', 
            description: `Town in ${nation.name}`, 
            priority: getMatchScore(term, [town.name]), 
            onClick: () => navigate(`/town/${encodeURIComponent(town.name)}`) // Navigate to town page
          });
        }
      });
    });

    // Search companies
    companies.forEach(company => {
        if (getMatchScore(term, [company.name]) > 0) {
            allResults.push({ 
              id: `company-${company.id}`, // Ensure unique ID
              title: company.name, // Remove type label
              type: 'company', 
              description: company.industry, 
              priority: getMatchScore(term, [company.name]), 
              onClick: () => navigate('/towns/businesses') 
            });
        }
    });

    // Search ALL wiki pages - recursively discover everything in folders within folders
    if (wikiFileStructure && wikiFileStructure.length > 0) {
      // Flatten all files from the file structure (this discovers everything in folders within folders)
      const allWikiFiles = flattenAllWikiFiles(wikiFileStructure);
      
      console.log(`🔍 Found ${allWikiFiles.length} total wiki files to search through`);
      console.log('📄 Sample wiki files:', allWikiFiles.slice(0, 3));
      
      allWikiFiles.forEach(file => {
        // Search in title and path
        const searchableFields = [
          file.title || '',
          file.path || '',
          file.categoryTitle || ''
        ].filter(Boolean);
        
        console.log(`🔍 Searching file "${file.title}" with fields:`, searchableFields);
        
        const matchScore = getMatchScore(term, searchableFields);
        console.log(`🔍 Match score for "${file.title}": ${matchScore}`);
        
        if (matchScore > 0) {
            console.log(`✅ Adding wiki file "${file.title}" to results with score ${matchScore}`);
            allResults.push({ 
              id: `wiki-${file.id}`, // Ensure unique ID with wiki prefix
              title: file.title, // Remove type label
              type: 'wiki', 
              description: `Wiki • ${file.categoryTitle || 'Root'} • ${file.path}`, 
              priority: matchScore, 
              onClick: () => navigate(`/wiki/${file.slug}`) 
            });
        }
      });
    } else if (wikiCategories && wikiCategories.length > 0) {
      // Fallback to categories if file structure is not available
      const allWikiPages = flattenAllWikiPages(wikiCategories);
      
      console.log(`🔍 Found ${allWikiPages.length} total wiki pages to search through (via categories)`);
      console.log('📄 Sample wiki pages:', allWikiPages.slice(0, 3));
      
      allWikiPages.forEach(page => {
        // Search in title, content, description, and tags
        const searchableFields = [
          page.title || '',
          page.content || '',
          page.description || '',
          page.categoryTitle || '', // Include category name in search
          ...(page.tags || [])
        ].filter(Boolean);
        
        console.log(`🔍 Searching page "${page.title}" with fields:`, searchableFields);
        
        const matchScore = getMatchScore(term, searchableFields);
        console.log(`🔍 Match score for "${page.title}": ${matchScore}`);
        
        if (matchScore > 0) {
            console.log(`✅ Adding wiki page "${page.title}" to results with score ${matchScore}`);
            allResults.push({ 
              id: `wiki-${page.id}`, // Ensure unique ID with wiki prefix
              title: page.title, // Remove type label
              type: 'wiki', 
              description: `Wiki • ${page.categoryTitle || 'Unknown Category'}${page.description ? ` • ${page.description.substring(0, 50)}...` : ''}`, 
              priority: matchScore, 
              onClick: () => navigate(`/wiki/${page.slug}`) 
            });
        }
      });
    } else {
      // Fallback to createFallbackWikiData if no real wiki data is available
      console.log('⚠️ No real wiki data available, using fallback wiki data.');
      const fallbackWikiPages = createFallbackWikiData();
      console.log(`🔍 Found ${fallbackWikiPages.length} total fallback wiki pages to search through`);
      
      fallbackWikiPages.forEach(page => {
        const searchableFields = [
          page.title || '',
          page.content || '',
          page.description || '',
          page.categoryTitle || '',
          ...(page.tags || [])
        ].filter(Boolean);
        
        console.log(`🔍 Searching fallback page "${page.title}" with fields:`, searchableFields);
        
        const matchScore = getMatchScore(term, searchableFields);
        console.log(`🔍 Match score for fallback "${page.title}": ${matchScore}`);
        
        if (matchScore > 0) {
          console.log(`✅ Adding fallback wiki page "${page.title}" to results with score ${matchScore}`);
          allResults.push({
            id: `fallback-wiki-${page.id}`, // Ensure unique ID with fallback prefix
            title: page.title, // Remove type label
            type: 'wiki',
            description: `Fallback Wiki • ${page.categoryTitle || 'Unknown Category'}${page.description ? ` • ${page.description.substring(0, 50)}...` : ''}`,
            priority: matchScore,
            onClick: () => navigate(`/wiki/${page.slug}`)
          });
        }
      });
    }

    console.log(`🔍 Total search results found: ${allResults.length}`);
    console.log('🔍 All results:', allResults);

    // Deduplicate results by ensuring each result has a unique combination of title and type
    const deduplicatedResults = allResults.reduce((acc: SearchResult[], result) => {
      const existingIndex = acc.findIndex(existing => 
        existing.title === result.title && existing.type === result.type
      );
      
      if (existingIndex === -1) {
        // This is a new unique result
        acc.push(result);
      } else {
        // If we have a duplicate, keep the one with higher priority
        if ((result.priority || 0) > (acc[existingIndex].priority || 0)) {
          acc[existingIndex] = result;
        }
      }
      
      return acc;
    }, []);

    console.log(`🔍 After deduplication: ${deduplicatedResults.length} results`);
    console.log('🔍 Deduplicated results:', deduplicatedResults);

    return deduplicatedResults.sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 15); // Increased limit to show more wiki results
  }, [searchTerm, profiles, nations, companies, wikiFileStructure, wikiCategories, navigate, flattenAllWikiFiles, createFallbackWikiData]);

  const handleSelect = (callback: () => void) => {
    // Record what was actually clicked on, not what was typed
    if (searchTerm.trim()) {
      // saveSearchHistory(searchTerm.trim()); // This line is removed
      // Record the actual click action for analytics
      recordSearch(searchTerm.trim(), 'clicked', true);
    }
    callback();
    onOpenChange(false);
  };

  const handleRecommendedClick = (recommendation: RecommendedSearch) => {
    if (recommendation.type === 'recent' || recommendation.type === 'trending' || recommendation.type === 'personalized') {
      setSearchTerm(recommendation.title);
      if (recommendation.type === 'trending') {
        // Record the click on trending item
        SearchSuggestionsService.recordSearchClick(recommendation.title, recommendation.category || 'general');
      }
    } else {
      // Record the click on recommendation
      SearchSuggestionsService.recordSearchClick(recommendation.title, recommendation.category || 'general');
      recommendation.onClick();
      onOpenChange(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'player': return <User className="w-4 h-4" />;
      case 'town': return <MapPin className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'wiki': return <FileText className="w-4 h-4" />;
      case 'nation': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'town': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'company': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'wiki': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'nation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColorForRecommendation = (type: string) => {
    switch (type) {
      case 'trending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'recent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'popular': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suggestion': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'personalized': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get search insights
  const searchInsights = getSearchInsights();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search players, towns, wiki..." 
        value={searchTerm} 
        onValueChange={setSearchTerm} 
      />
      <CommandList>
        {!searchTerm.trim() ? (
          // Show recommended searches when no search term
          <>
            {/* Search Insights */}
            {searchInsights.length > 0 && (
              <CommandGroup heading="Search Insights">
                {searchInsights.map((insight, index) => (
                  <div key={index} className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        insight.type === 'success' ? 'bg-green-500' :
                        insight.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <span className="text-muted-foreground">{insight.message}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {insight.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Recommended Searches">
              {recommendedSearches.map((recommendation) => (
                <CommandItem 
                  key={recommendation.id} 
                  onSelect={() => handleRecommendedClick(recommendation)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="p-2 rounded-lg bg-muted/50 transition-colors duration-200">
                      {recommendation.icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{recommendation.title}</div>
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        {recommendation.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {recommendation.trend && (
                        <span className={`text-xs ${getTrendColor(recommendation.trend)}`}>
                          {recommendation.trend === 'up' ? '↗' : recommendation.trend === 'down' ? '↘' : '→'}
                        </span>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${getTypeColorForRecommendation(recommendation.type)}`}
                      >
                        {recommendation.type}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : (
          // Show search results
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((result) => (
                  <CommandItem key={result.id} value={result.title} onSelect={() => handleSelect(result.onClick)}>
                    <div className="flex items-center space-x-3 w-full">
                      <div className="p-2 rounded-lg bg-muted/50 transition-colors duration-200">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs capitalize ${getTypeColor(result.type)}`}>
                        {result.type}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
