#!/usr/bin/env ts-node

import { PlayerStatsSyncService } from '../services/playerStatsSyncService';

/**
 * Script to sync all player stats with comprehensive data
 * This ensures all players have all possible stats from possible_stats.json
 * 
 * Usage:
 * npx ts-node src/scripts/syncAllPlayerStats.ts
 */

async function main() {
  console.log('🚀 Starting comprehensive player stats sync...');
  console.log('===============================================');
  
  try {
    // Step 1: Initialize player stats table
    console.log('\n📋 Step 1: Initializing player stats table...');
    const initResult = await PlayerStatsSyncService.initializePlayerStatsTable();
    
    if (!initResult) {
      console.error('❌ Failed to initialize player stats table');
      process.exit(1);
    }
    
    console.log('✅ Player stats table initialized successfully');
    
    // Step 2: Sync all player stats
    console.log('\n🔄 Step 2: Syncing comprehensive stats for all players...');
    const syncResult = await PlayerStatsSyncService.syncAllPlayerStats();
    
    // Display results
    console.log('\n📊 Sync Results:');
    console.log('================');
    console.log(`Total Players: ${syncResult.total}`);
    console.log(`Successfully Synced: ${syncResult.success} ✅`);
    console.log(`Failed: ${syncResult.failed} ❌`);
    
    if (syncResult.success > 0) {
      const successRate = Math.round((syncResult.success / syncResult.total) * 100);
      console.log(`Success Rate: ${successRate}%`);
    }
    
    if (syncResult.errors.length > 0) {
      console.log('\n❌ Errors:');
      console.log('==========');
      syncResult.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      if (syncResult.errors.length > 10) {
        console.log(`... and ${syncResult.errors.length - 10} more errors`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Sync completed!');
    console.log('==================');
    
    if (syncResult.failed === 0) {
      console.log('✅ All players synced successfully!');
    } else if (syncResult.success > 0) {
      console.log('⚠️  Sync completed with some errors');
    } else {
      console.log('❌ Sync failed completely');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error during sync:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Sync interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Sync terminated');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
} 