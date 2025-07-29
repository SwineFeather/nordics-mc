import { supabase } from '@/integrations/supabase/client';
import { getAggregatedPlayerStats } from '@/services/statsService';
import { calculateLevelInfo } from '@/lib/leveling';
import { syncPlayerAchievements } from '@/services/achievementService';
import type { Database } from '@/integrations/supabase/types';
import { fetchPlayerInfo } from './playerService';

export const migrateStatsToDb = async () => {
    console.log("Starting data migration...");

    // 1. Get aggregated stats from files
    const aggregatedStats = await getAggregatedPlayerStats();
    const allUuids = Object.keys(aggregatedStats);
    console.log(`Found ${allUuids.length} players in stats files.`);

    // 2. Fetch all player usernames
    const playerInfos = await Promise.all(allUuids.map(uuid => fetchPlayerInfo(uuid)));
    console.log(`Fetched ${playerInfos.length} player usernames.`);

    // 3. Prepare and upsert player core data
    const playersToUpsert = playerInfos.map(info => ({
        uuid: info.uuid,
        name: info.username, // Use 'name' instead of 'username'
        last_seen: Math.floor(Date.now() / 1000), // Use current timestamp as default last_seen
    }));
    const { error: playersError } = await supabase.from('players').upsert(playersToUpsert);
    if (playersError) throw playersError;
    console.log('Upserted core player data.');

    // 4. Prepare and upsert player_stats data with raw stats
    const playerStatsToUpsert = allUuids.map(uuid => {
        const s = aggregatedStats[uuid];
        
        // Keep all raw stats for achievement processing
        const rawStats = { ...s };
        delete (rawStats as any).ranks;
        delete (rawStats as any).medalPoints;
        delete (rawStats as any).goldMedals;
        delete (rawStats as any).silverMedals;
        delete (rawStats as any).bronzeMedals;

        return {
            player_uuid: uuid,
            stats: rawStats, // Store raw stats including custom_minecraft_* stats
            last_updated: Math.floor(Date.now() / 1000), // Add required last_updated field
        };
    });
    
    const { error: playerStatsError } = await supabase.from('player_stats').upsert(playerStatsToUpsert);
    if (playerStatsError) throw playerStatsError;
    console.log('Upserted player stats with raw data.');

    // 5. Process achievements for each player
    console.log("Processing achievements for all players...");
    
    let processedCount = 0;
    const totalPlayers = allUuids.length;
    
    for (const uuid of allUuids) {
        const stats = aggregatedStats[uuid];
        if (!stats) continue;

        try {
            // Sync achievements for this player using the raw stats
            await syncPlayerAchievements(uuid, stats);
            
            processedCount++;
            if (processedCount % 50 === 0) {
                console.log(`Processed ${processedCount}/${totalPlayers} players...`);
            }
            
        } catch (error) {
            console.error(`Error processing player ${uuid}:`, error);
        }
    }
    
    console.log(`Finished processing achievements for ${processedCount} players.`);
    console.log("Migration complete!");
    return true;
};
