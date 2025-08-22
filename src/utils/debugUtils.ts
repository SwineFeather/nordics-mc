/**
 * Debug Utilities
 * 
 * This file provides easy access to debug controls for various services
 */

import { SupabaseWikiService } from '@/services/supabaseWikiService';
import { ComprehensiveStatsService } from '@/services/comprehensiveStatsService';

/**
 * Debug control interface
 */
interface DebugControls {
  wiki: boolean;
  autoWiki: boolean;
  github: boolean;
  backgroundSync: boolean;
  analytics: boolean;
  comprehensiveStats: boolean;
}

/**
 * Global debug state
 */
let debugState: DebugControls = {
  wiki: false,
  autoWiki: false,
  github: false,
  backgroundSync: false,
  analytics: false,
  comprehensiveStats: false
};

/**
 * Enable debug logging for wiki service
 */
export const enableWikiDebug = () => {
  SupabaseWikiService.setDebugMode(true);
  debugState.wiki = true;
  console.log('🔧 Wiki service debug mode enabled');
};

/**
 * Disable debug logging for wiki service
 */
export const disableWikiDebug = () => {
  SupabaseWikiService.setDebugMode(false);
  debugState.wiki = false;
  console.log('🔧 Wiki service debug mode disabled');
};

/**
 * Toggle debug logging for wiki service
 */
export const toggleWikiDebug = () => {
  SupabaseWikiService.toggleDebugMode();
  debugState.wiki = !debugState.wiki;
};

/**
 * Enable debug logging for comprehensive stats service
 */
export const enableComprehensiveStatsDebug = () => {
  ComprehensiveStatsService.setDebugMode(true);
  debugState.comprehensiveStats = true;
  console.log('🔧 Comprehensive Stats service debug mode enabled');
};

/**
 * Disable debug logging for comprehensive stats service
 */
export const disableComprehensiveStatsDebug = () => {
  ComprehensiveStatsService.setDebugMode(false);
  debugState.comprehensiveStats = false;
  console.log('🔧 Comprehensive Stats service debug mode disabled');
};

/**
 * Enable all debug logging
 */
export const enableAllDebug = () => {
  enableWikiDebug();
  enableComprehensiveStatsDebug();
  // Add other services here as they get debug controls
  console.log('🔧 All debug modes enabled');
};

/**
 * Disable all debug logging
 */
export const disableAllDebug = () => {
  disableWikiDebug();
  disableComprehensiveStatsDebug();
  // Add other services here as they get debug controls
  debugState = {
    wiki: false,
    autoWiki: false,
    github: false,
    backgroundSync: false,
    analytics: false,
    comprehensiveStats: false
  };
  console.log('🔧 All debug modes disabled');
};

/**
 * Get current debug status
 */
export const getDebugStatus = () => {
  return { ...debugState };
};

/**
 * Set specific debug mode
 */
export const setDebugMode = (service: keyof DebugControls, enabled: boolean) => {
  switch (service) {
    case 'wiki':
      if (enabled) enableWikiDebug();
      else disableWikiDebug();
      break;
    case 'comprehensiveStats':
      if (enabled) enableComprehensiveStatsDebug();
      else disableComprehensiveStatsDebug();
      break;
    // Add other services here as they get debug controls
    default:
      console.log(`⚠️ Debug control for ${service} not yet implemented`);
  }
};

/**
 * Quick debug commands for console
 * 
 * Usage in browser console:
 * - enableWikiDebug()     - Enable verbose wiki logging
 * - disableWikiDebug()    - Disable verbose wiki logging  
 * - toggleWikiDebug()     - Toggle debug mode
 * - enableComprehensiveStatsDebug() - Enable stats service debug
 * - disableComprehensiveStatsDebug() - Disable stats service debug
 * - enableAllDebug()      - Enable all debug modes
 * - disableAllDebug()     - Disable all debug modes
 * - getDebugStatus()      - Show current debug status
 */
if (typeof window !== 'undefined') {
  (window as any).enableWikiDebug = enableWikiDebug;
  (window as any).disableWikiDebug = disableWikiDebug;
  (window as any).toggleWikiDebug = toggleWikiDebug;
  (window as any).enableComprehensiveStatsDebug = enableComprehensiveStatsDebug;
  (window as any).disableComprehensiveStatsDebug = disableComprehensiveStatsDebug;
  (window as any).enableAllDebug = enableAllDebug;
  (window as any).disableAllDebug = disableAllDebug;
  (window as any).getDebugStatus = getDebugStatus;
  (window as any).setDebugMode = setDebugMode;
  
  // Show available commands
  console.log('🔧 Debug controls available:');
  console.log('  enableWikiDebug(), disableWikiDebug(), toggleWikiDebug()');
  console.log('  enableComprehensiveStatsDebug(), disableComprehensiveStatsDebug()');
  console.log('  enableAllDebug(), disableAllDebug()');
  console.log('  getDebugStatus(), setDebugMode(service, enabled)');
}
