import { supabase } from '@/integrations/supabase/client';

export interface WikiAnalytics {
  pageViews: PageView[];
  userActions: UserAction[];
  performanceMetrics: PerformanceMetric[];
  searchAnalytics: SearchAnalytics;
  contentAnalytics: ContentAnalytics;
  userEngagement: UserEngagement;
}

export interface PageView {
  id: string;
  pageId: string;
  pageTitle: string;
  userId?: string;
  username?: string;
  timestamp: string;
  sessionId: string;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
  duration?: number; // Time spent on page in seconds
}

export interface UserAction {
  id: string;
  userId?: string;
  username?: string;
  action: 'page_view' | 'page_edit' | 'page_create' | 'page_delete' | 'search' | 'comment' | 'like' | 'share';
  resourceType: 'page' | 'category' | 'comment' | 'search';
  resourceId?: string;
  resourceTitle?: string;
  timestamp: string;
  sessionId: string;
  metadata?: any;
}

export interface PerformanceMetric {
  id: string;
  metric: 'page_load_time' | 'api_response_time' | 'cache_hit_rate' | 'sync_duration' | 'search_time';
  value: number;
  unit: 'ms' | 'seconds' | 'percentage';
  timestamp: string;
  context?: any;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearchers: number;
  averageResultsPerSearch: number;
  mostSearchedTerms: Array<{ term: string; count: number }>;
  searchSuccessRate: number;
  averageSearchTime: number;
}

export interface ContentAnalytics {
  totalPages: number;
  totalCategories: number;
  mostViewedPages: Array<{ pageId: string; title: string; views: number }>;
  mostEditedPages: Array<{ pageId: string; title: string; edits: number }>;
  recentlyCreatedPages: Array<{ pageId: string; title: string; createdAt: string }>;
  contentGrowthRate: number; // Pages created per day
}

export interface UserEngagement {
  activeUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  userRetentionRate: number;
}

class AnalyticsService {
  private pageViews: PageView[] = [];
  private userActions: UserAction[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private initializeAnalytics(): void {
    // Load existing analytics from localStorage if available
    try {
      const storedPageViews = localStorage.getItem('wiki_page_views');
      const storedUserActions = localStorage.getItem('wiki_user_actions');
      const storedPerformanceMetrics = localStorage.getItem('wiki_performance_metrics');

      if (storedPageViews) {
        this.pageViews = JSON.parse(storedPageViews);
      }
      if (storedUserActions) {
        this.userActions = JSON.parse(storedUserActions);
      }
      if (storedPerformanceMetrics) {
        this.performanceMetrics = JSON.parse(storedPerformanceMetrics);
      }
    } catch (error) {
      console.error('❌ Error loading analytics from localStorage:', error);
    }
  }

  private saveAnalytics(): void {
    try {
      localStorage.setItem('wiki_page_views', JSON.stringify(this.pageViews));
      localStorage.setItem('wiki_user_actions', JSON.stringify(this.userActions));
      localStorage.setItem('wiki_performance_metrics', JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('❌ Error saving analytics to localStorage:', error);
    }
  }

  // Track page view
  async trackPageView(pageId: string, pageTitle: string, duration?: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const pageView: PageView = {
        id: crypto.randomUUID(),
        pageId,
        pageTitle,
        userId: user?.id,
        username: user?.email?.split('@')[0],
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        duration
      };

      this.pageViews.unshift(pageView);
      
      // Keep only last 1000 page views
      if (this.pageViews.length > 1000) {
        this.pageViews = this.pageViews.slice(0, 1000);
      }

      this.saveAnalytics();
      console.log(`📊 Tracked page view: ${pageTitle}`);

    } catch (error) {
      console.error('❌ Error tracking page view:', error);
    }
  }

  // Track user action
  async trackUserAction(
    action: UserAction['action'],
    resourceType: UserAction['resourceType'],
    resourceId?: string,
    resourceTitle?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const userAction: UserAction = {
        id: crypto.randomUUID(),
        userId: user?.id,
        username: user?.email?.split('@')[0],
        action,
        resourceType,
        resourceId,
        resourceTitle,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        metadata
      };

      this.userActions.unshift(userAction);
      
      // Keep only last 1000 user actions
      if (this.userActions.length > 1000) {
        this.userActions = this.userActions.slice(0, 1000);
      }

      this.saveAnalytics();
      console.log(`📊 Tracked user action: ${action} on ${resourceType}`);

    } catch (error) {
      console.error('❌ Error tracking user action:', error);
    }
  }

  // Track performance metric
  trackPerformanceMetric(
    metric: PerformanceMetric['metric'],
    value: number,
    unit: PerformanceMetric['unit'],
    context?: any
  ): void {
    try {
      const performanceMetric: PerformanceMetric = {
        id: crypto.randomUUID(),
        metric,
        value,
        unit,
        timestamp: new Date().toISOString(),
        context
      };

      this.performanceMetrics.unshift(performanceMetric);
      
      // Keep only last 500 performance metrics
      if (this.performanceMetrics.length > 500) {
        this.performanceMetrics = this.performanceMetrics.slice(0, 500);
      }

      this.saveAnalytics();
      console.log(`📊 Tracked performance metric: ${metric} = ${value}${unit}`);

    } catch (error) {
      console.error('❌ Error tracking performance metric:', error);
    }
  }

  // Get search analytics
  getSearchAnalytics(): SearchAnalytics {
    const searchActions = this.userActions.filter(action => action.action === 'search');
    const uniqueSearchers = new Set(searchActions.map(action => action.userId).filter(Boolean)).size;
    
    // Calculate average results per search (if metadata contains results count)
    const searchesWithResults = searchActions.filter(action => action.metadata?.resultsCount);
    const averageResults = searchesWithResults.length > 0 
      ? searchesWithResults.reduce((sum, action) => sum + (action.metadata?.resultsCount || 0), 0) / searchesWithResults.length
      : 0;

    // Get most searched terms
    const searchTerms = searchActions
      .filter(action => action.metadata?.searchTerm)
      .map(action => action.metadata.searchTerm);
    
    const termCounts = searchTerms.reduce((acc, term) => {
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostSearchedTerms = Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate search success rate (searches that returned results)
    const successfulSearches = searchActions.filter(action => 
      action.metadata?.resultsCount && action.metadata.resultsCount > 0
    ).length;
    const searchSuccessRate = searchActions.length > 0 ? (successfulSearches / searchActions.length) * 100 : 0;

    // Calculate average search time
    const searchesWithTime = searchActions.filter(action => action.metadata?.searchTime);
    const averageSearchTime = searchesWithTime.length > 0
      ? searchesWithTime.reduce((sum, action) => sum + (action.metadata?.searchTime || 0), 0) / searchesWithTime.length
      : 0;

    return {
      totalSearches: searchActions.length,
      uniqueSearchers,
      averageResultsPerSearch: averageResults,
      mostSearchedTerms,
      searchSuccessRate,
      averageSearchTime
    };
  }

  // Get content analytics
  getContentAnalytics(): ContentAnalytics {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get most viewed pages
    const pageViewCounts = this.pageViews.reduce((acc, view) => {
      acc[view.pageId] = acc[view.pageId] || { pageId: view.pageId, title: view.pageTitle, views: 0 };
      acc[view.pageId].views++;
      return acc;
    }, {} as Record<string, { pageId: string; title: string; views: number }>);

    const mostViewedPages = Object.values(pageViewCounts)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Get most edited pages
    const editActions = this.userActions.filter(action => 
      action.action === 'page_edit' || action.action === 'page_create'
    );
    
    const editCounts = editActions.reduce((acc, action) => {
      if (action.resourceId) {
        acc[action.resourceId] = acc[action.resourceId] || { pageId: action.resourceId, title: action.resourceTitle || 'Unknown', edits: 0 };
        acc[action.resourceId].edits++;
      }
      return acc;
    }, {} as Record<string, { pageId: string; title: string; edits: number }>);

    const mostEditedPages = Object.values(editCounts)
      .sort((a, b) => b.edits - a.edits)
      .slice(0, 10);

    // Get recently created pages
    const createActions = this.userActions.filter(action => action.action === 'page_create');
    const recentlyCreatedPages = createActions
      .map(action => ({
        pageId: action.resourceId || '',
        title: action.resourceTitle || 'Unknown',
        createdAt: action.timestamp
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Calculate content growth rate
    const pagesCreatedToday = createActions.filter(action => 
      new Date(action.timestamp) > oneDayAgo
    ).length;

    const pagesCreatedLastWeek = createActions.filter(action => 
      new Date(action.timestamp) > oneWeekAgo
    ).length;

    const contentGrowthRate = pagesCreatedLastWeek > 0 ? pagesCreatedToday / (pagesCreatedLastWeek / 7) : 0;

    return {
      totalPages: createActions.length,
      totalCategories: 0, // TODO: Track category creation
      mostViewedPages,
      mostEditedPages,
      recentlyCreatedPages,
      contentGrowthRate
    };
  }

  // Get user engagement analytics
  getUserEngagement(): UserEngagement {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get active users (users with actions in last 24 hours)
    const recentActions = this.userActions.filter(action => 
      new Date(action.timestamp) > oneDayAgo
    );
    const activeUsers = new Set(recentActions.map(action => action.userId).filter(Boolean)).size;

    // Get returning users (users with actions in last week but not just today)
    const weekActions = this.userActions.filter(action => 
      new Date(action.timestamp) > oneWeekAgo
    );
    const returningUsers = new Set(weekActions.map(action => action.userId).filter(Boolean)).size;

    // Calculate average session duration
    const sessions = this.groupActionsBySession();
    const sessionDurations = sessions.map(session => {
      if (session.actions.length < 2) return 0;
      
      const firstAction = session.actions[session.actions.length - 1]; // Oldest action
      const lastAction = session.actions[0]; // Newest action
      
      return (new Date(lastAction.timestamp).getTime() - new Date(firstAction.timestamp).getTime()) / 1000;
    }).filter(duration => duration > 0);

    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
      : 0;

    // Calculate pages per session
    const pagesPerSession = sessions.length > 0
      ? sessions.reduce((sum, session) => sum + session.actions.length, 0) / sessions.length
      : 0;

    // Calculate bounce rate (sessions with only one action)
    const bounceSessions = sessions.filter(session => session.actions.length === 1).length;
    const bounceRate = sessions.length > 0 ? (bounceSessions / sessions.length) * 100 : 0;

    // Calculate user retention rate (users who returned within a week)
    const allUsers = new Set(this.userActions.map(action => action.userId).filter(Boolean));
    const userRetentionRate = allUsers.size > 0 ? (returningUsers / allUsers.size) * 100 : 0;

    return {
      activeUsers,
      returningUsers,
      averageSessionDuration,
      pagesPerSession,
      bounceRate,
      userRetentionRate
    };
  }

  // Group actions by session
  private groupActionsBySession(): Array<{ sessionId: string; actions: UserAction[] }> {
    const sessionGroups = this.userActions.reduce((acc, action) => {
      if (!acc[action.sessionId]) {
        acc[action.sessionId] = [];
      }
      acc[action.sessionId].push(action);
      return acc;
    }, {} as Record<string, UserAction[]>);

    return Object.entries(sessionGroups).map(([sessionId, actions]) => ({
      sessionId,
      actions: actions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }));
  }

  // Get performance analytics
  getPerformanceAnalytics(): {
    averagePageLoadTime: number;
    averageApiResponseTime: number;
    cacheHitRate: number;
    averageSyncDuration: number;
    averageSearchTime: number;
  } {
    const pageLoadMetrics = this.performanceMetrics.filter(m => m.metric === 'page_load_time');
    const apiResponseMetrics = this.performanceMetrics.filter(m => m.metric === 'api_response_time');
    const cacheHitMetrics = this.performanceMetrics.filter(m => m.metric === 'cache_hit_rate');
    const syncMetrics = this.performanceMetrics.filter(m => m.metric === 'sync_duration');
    const searchMetrics = this.performanceMetrics.filter(m => m.metric === 'search_time');

    const averagePageLoadTime = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
      : 0;

    const averageApiResponseTime = apiResponseMetrics.length > 0
      ? apiResponseMetrics.reduce((sum, m) => sum + m.value, 0) / apiResponseMetrics.length
      : 0;

    const cacheHitRate = cacheHitMetrics.length > 0
      ? cacheHitMetrics.reduce((sum, m) => sum + m.value, 0) / cacheHitMetrics.length
      : 0;

    const averageSyncDuration = syncMetrics.length > 0
      ? syncMetrics.reduce((sum, m) => sum + m.value, 0) / syncMetrics.length
      : 0;

    const averageSearchTime = searchMetrics.length > 0
      ? searchMetrics.reduce((sum, m) => sum + m.value, 0) / searchMetrics.length
      : 0;

    return {
      averagePageLoadTime,
      averageApiResponseTime,
      cacheHitRate,
      averageSyncDuration,
      averageSearchTime
    };
  }

  // Get comprehensive analytics
  getComprehensiveAnalytics(): WikiAnalytics {
    return {
      pageViews: this.pageViews,
      userActions: this.userActions,
      performanceMetrics: this.performanceMetrics,
      searchAnalytics: this.getSearchAnalytics(),
      contentAnalytics: this.getContentAnalytics(),
      userEngagement: this.getUserEngagement()
    };
  }

  // Export analytics data
  exportAnalytics(): string {
    const analytics = this.getComprehensiveAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  // Clear analytics data
  clearAnalytics(): void {
    this.pageViews = [];
    this.userActions = [];
    this.performanceMetrics = [];
    this.saveAnalytics();
    console.log('✅ Analytics data cleared');
  }

  // Get analytics summary
  getAnalyticsSummary(): {
    totalPageViews: number;
    totalUserActions: number;
    totalSessions: number;
    activeUsers: number;
    averageSessionDuration: number;
    mostViewedPage: string;
    mostActiveUser: string;
  } {
    const sessions = this.groupActionsBySession();
    
    // Get most viewed page
    const pageViewCounts = this.pageViews.reduce((acc, view) => {
      acc[view.pageTitle] = (acc[view.pageTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostViewedPage = Object.entries(pageViewCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    // Get most active user
    const userActionCounts = this.userActions.reduce((acc, action) => {
      if (action.username) {
        acc[action.username] = (acc[action.username] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostActiveUser = Object.entries(userActionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    // Calculate average session duration
    const sessionDurations = sessions.map(session => {
      if (session.actions.length < 2) return 0;
      const firstAction = session.actions[session.actions.length - 1];
      const lastAction = session.actions[0];
      return (new Date(lastAction.timestamp).getTime() - new Date(firstAction.timestamp).getTime()) / 1000;
    }).filter(duration => duration > 0);

    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
      : 0;

    // Get active users (users with actions in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActions = this.userActions.filter(action => 
      new Date(action.timestamp) > oneDayAgo
    );
    const activeUsers = new Set(recentActions.map(action => action.userId).filter(Boolean)).size;

    return {
      totalPageViews: this.pageViews.length,
      totalUserActions: this.userActions.length,
      totalSessions: sessions.length,
      activeUsers,
      averageSessionDuration,
      mostViewedPage,
      mostActiveUser
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 