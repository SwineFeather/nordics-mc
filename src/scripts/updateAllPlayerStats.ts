import { updateAllPlayerStatsComprehensive } from '@/services/comprehensiveStatsService';

/**
 * Script to update all player stats with comprehensive data
 * Run this script to ensure all players have complete stat information
 */
const runComprehensiveStatsUpdate = async () => {
  console.log('🚀 Starting comprehensive stats update for all players...');
  console.log('This will ensure all players have all possible stats from possible_stats.json');
  console.log('');
  
  try {
    const result = await updateAllPlayerStatsComprehensive();
    
    console.log('✅ Update completed!');
    console.log(`📊 Results:`);
    console.log(`   - Total players processed: ${result.total}`);
    console.log(`   - Successful updates: ${result.success}`);
    console.log(`   - Failed updates: ${result.failed}`);
    console.log(`   - Success rate: ${((result.success / result.total) * 100).toFixed(1)}%`);
    
    if (result.failed > 0) {
      console.log('');
      console.log('⚠️  Some updates failed. Check the console for error details.');
    } else {
      console.log('');
      console.log('🎉 All player stats have been successfully updated!');
      console.log('Players should now have complete stat information in the community and profile pages.');
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive stats update:', error);
    process.exit(1);
  }
};

// Run the update if this script is executed directly
if (require.main === module) {
  runComprehensiveStatsUpdate();
}

export default runComprehensiveStatsUpdate; 