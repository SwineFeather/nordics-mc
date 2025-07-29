
import type { PlayerProfile } from '@/types/player';

type Ranks = PlayerProfile['stats']['ranks'];

type AggregatedStatsData = {
  [key: string]: number | undefined | { [key: string]: number | undefined };
  playtimeHours: number;
  playTimeTicks: number;
  ranks: { [key: string]: number | undefined };
  medalPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
};

export type AggregatedStats = {
  [uuid: string]: AggregatedStatsData;
};

let aggregatedStats: AggregatedStats | null = null;

export const getAggregatedPlayerStats = async (): Promise<AggregatedStats> => {
  if (aggregatedStats) {
    return aggregatedStats;
  }

  const tempStats: { [uuid: string]: { [key: string]: number } } = {};
  const allPlayers = new Set<string>();
  const allStatKeys = new Set<string>();

  const modules = import.meta.glob('/stats/data/rankings/**/*.json');
  
  for (const path in modules) {
      const match = path.match(/rankings\/(.*)\.json$/);
      if (!match || !match[1]) continue;

      let statKey = match[1].replace(/.*\//, '');
      if (statKey === 'play') {
        statKey = 'playTimeTicks';
      }
      // These are not real stats, just groupings.
      if (['mine_dimensional', 'mine_nether_foliage'].includes(statKey)) continue;

      allStatKeys.add(statKey);

      const module = await modules[path]();
      const fileData = (module as any).default as { uuid: string; value: number }[];
      if (!Array.isArray(fileData)) continue;

      fileData.forEach(entry => {
          if (!entry.uuid || typeof entry.value !== 'number') return;
          allPlayers.add(entry.uuid);
          if (!tempStats[entry.uuid]) tempStats[entry.uuid] = {};
          tempStats[entry.uuid][statKey] = (tempStats[entry.uuid][statKey] || 0) + entry.value;
      });
  }

  const finalStats: AggregatedStats = {};
  
  const ranks: { [category: string]: { [uuid:string]: number } } = {};

  allStatKeys.forEach(statKey => {
    const sortedPlayers = Array.from(allPlayers)
        .map(uuid => ({ uuid, value: tempStats[uuid]?.[statKey] || 0 }))
        .filter(player => player.value > 0) // Only rank players with positive values
        .sort((a, b) => b.value - a.value);

    ranks[statKey] = {};
    sortedPlayers.forEach((player, index) => {
        ranks[statKey][player.uuid] = index + 1;
    });
  });

  // Handle playtimeHours separately
  if (ranks['playTimeTicks']) {
    ranks['playtimeHours'] = ranks['playTimeTicks'];
    allStatKeys.add('playtimeHours');
  }

  allPlayers.forEach(uuid => {
    const playerTempStats = tempStats[uuid] || {};
    const playerRanks: { [key: string]: number | undefined } = {};
    allStatKeys.forEach(statKey => {
        // Only assign rank if player has a positive value for this stat
        const statValue = playerTempStats[statKey] || 0;
        if (statValue > 0) {
          playerRanks[statKey] = ranks[statKey]?.[uuid];
        }
    });

    let medalPoints = 0;
    let goldMedals = 0;
    let silverMedals = 0;
    let bronzeMedals = 0;
    Object.values(playerRanks).forEach(rank => {
        if (rank === 1) {
          medalPoints += 4;
          goldMedals++;
        }
        else if (rank === 2) {
          medalPoints += 2;
          silverMedals++;
        }
        else if (rank === 3) {
          medalPoints += 1;
          bronzeMedals++;
        }
    });

    finalStats[uuid] = {
      ...playerTempStats,
      playtimeHours: Math.round((playerTempStats.playTimeTicks || 0) / 20 / 3600),
      playTimeTicks: playerTempStats.playTimeTicks || 0,
      // Map damage_dealt to damageDealt for TypeScript compatibility
      damageDealt: playerTempStats.damage_dealt || 0,
      ranks: playerRanks,
      medalPoints: medalPoints,
      goldMedals: goldMedals,
      silverMedals: silverMedals,
      bronzeMedals: bronzeMedals,
    };
  });

  aggregatedStats = finalStats;
  return aggregatedStats;
};
