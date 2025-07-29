import { supabase } from '@/integrations/supabase/client';
// import { createHash } from 'crypto'; // REMOVE THIS LINE

export interface AIKnowledgeEntry {
  id: string;
  title: string;
  section: string;
  content: string;
  tags: string[];
  updated_at: string;
  created_at: string;
}

export interface WikiDocument {
  name: string;
  content: string;
  updated_at: string;
}

export class AIKnowledgeService {
  /**
   * Recursively list all files in a Supabase Storage bucket folder
   */
  static async listAllFiles(bucket: string, path: string = ''): Promise<any[]> {
    // Always start by listing the current path
    const { data: files, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
    if (error) {
      console.error(`Error listing files in ${bucket}/${path}:`, error);
      return [];
    }
    let allFiles: any[] = [];
    let folders: string[] = [];
    for (const file of files) {
      if (file.metadata && file.metadata.mimetype === 'application/x-directory') {
        // It's a folder, collect for later recursion
        folders.push(path ? `${path}/${file.name}` : file.name);
      } else {
        // It's a file
        allFiles.push({ ...file, fullPath: path ? `${path}/${file.name}` : file.name });
      }
    }
    // Recursively list all files in each folder found
    for (const folder of folders) {
      const subFiles = await this.listAllFiles(bucket, folder);
      allFiles = allFiles.concat(subFiles);
    }
    // If we're at the root and found no folders, try a brute-force approach:
    if (path === '' && allFiles.length === 0) {
      // Try a list of likely folder names (can be extended as needed)
      const likelyFolders = ['Nordics', 'docs', 'wiki', 'content'];
      for (const folderName of likelyFolders) {
        const { data: folderFiles, error: folderError } = await supabase.storage.from(bucket).list(folderName, { limit: 1000 });
        if (folderFiles && folderFiles.length > 0) {
          // Recursively list all files in this folder
          const subFiles = await this.listAllFiles(bucket, folderName);
          allFiles = allFiles.concat(subFiles);
        }
      }
    }
    return allFiles;
  }

  /**
   * Fetch AI documents from Supabase storage, including all folders
   */
  static async getAIDocuments(query: string): Promise<string> {
    try {
      // Recursively list all files in the ai-docs bucket
      const files = await this.listAllFiles('ai-docs', '');
      if (!files || files.length === 0) {
        console.log('No files found in ai-docs bucket (recursive)');
        return '';
      }
      console.log('Found files in ai-docs bucket (recursive):', files.map(f => f.fullPath));
      let aiContent = '## AI Knowledge Documents\n\n';
      let relevantDocs = 0;
      for (const file of files) {
        if (!file.fullPath.endsWith('.md')) continue;
        try {
          const { data: fileContent, error: downloadError } = await supabase.storage
            .from('ai-docs')
            .download(file.fullPath);
          if (downloadError) {
            console.error(`Error downloading ${file.fullPath}:`, downloadError);
            continue;
          }
          if (fileContent) {
            const text = await fileContent.text();
            aiContent += `**${file.fullPath}**:\n${text}\n\n`;
            relevantDocs++;
            console.log(`Successfully loaded document: ${file.fullPath}`);
          }
        } catch (downloadError) {
          console.error(`Error processing ${file.fullPath}:`, downloadError);
        }
      }
      console.log(`Loaded ${relevantDocs} documents from ai-docs bucket (recursive)`);
      return relevantDocs > 0 ? aiContent : '';
    } catch (error) {
      console.error('Error in getAIDocuments (recursive):', error);
      return '';
    }
  }

  /**
   * Fetch wiki documents from Supabase storage, including all folders
   */
  static async getWikiDocuments(query: string): Promise<string> {
    try {
      // Recursively list all files in the wiki bucket
      const files = await this.listAllFiles('wiki', '');
      if (!files || files.length === 0) {
        console.log('No files found in wiki bucket (recursive)');
        return '';
      }
      console.log('Found files in wiki bucket (recursive):', files.map(f => f.fullPath));
      let wikiContent = '## Wiki Knowledge Documents\n\n';
      let relevantDocs = 0;
      for (const file of files) {
        if (!file.fullPath.endsWith('.md')) continue;
        try {
          const { data: fileContent, error: downloadError } = await supabase.storage
            .from('wiki')
            .download(file.fullPath);
          if (downloadError) {
            console.error(`Error downloading ${file.fullPath}:`, downloadError);
            continue;
          }
          if (fileContent) {
            const text = await fileContent.text();
            wikiContent += `**${file.fullPath}**:\n${text}\n\n`;
            relevantDocs++;
            console.log(`Successfully loaded wiki document: ${file.fullPath}`);
          }
        } catch (downloadError) {
          console.error(`Error processing ${file.fullPath}:`, downloadError);
        }
      }
      console.log(`Loaded ${relevantDocs} documents from wiki bucket (recursive)`);
      return relevantDocs > 0 ? wikiContent : '';
    } catch (error) {
      console.error('Error in getWikiDocuments (recursive):', error);
      return '';
    }
  }

  /**
   * Fetch real towns and nations data for AI context
   */
  static async getTownsAndNationsData(): Promise<string> {
    try {
      let dataText = '## Current Towns and Nations\n\n';

      // Fetch towns data - try both old and new table structures
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      console.log('Towns query result:', { towns, townsError });
      if (towns && towns.length > 0) {
        console.log('Sample town data:', towns[0]);
        console.log('Available town fields:', Object.keys(towns[0]));
      }

      if (!townsError && towns && towns.length > 0) {
        dataText += '### Towns Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `mayor`, `mayor_name`, `mayor_uuid`, `balance`, `population`, `residents_count`, `residents`, `nation_id`, `nation_name`, `nation`, `status`, `type`, `is_open`, `is_public`, `level`, `total_xp`, `created_at`, `updated_at`, `image_url`, `world_name`, `location_x`, `location_z`, `spawn_x`, `spawn_y`, `spawn_z`, `board`, `tag`, `max_residents`, `min_residents`, `max_plots`, `min_plots`, `taxes`, `plot_tax`, `shop_tax`, `embassy_tax`, `plot_price`, `is_capital`, `plots_count`, `home_block_count`, `shop_plot_count`, `embassy_plot_count`, `wild_plot_count`, `last_activity`, `activity_score`, `growth_rate`, `market_value`\n\n';
        
        dataText += '**Complete Towns Data:**\n\n';
        dataText += '| Name | Mayor | Mayor Name | Balance | Population | Residents Count | Nation | Nation Name | Status | Type | Level | Total XP | Is Open | Is Public | Is Capital | Location (X,Z) | Spawn (X,Y,Z) | Market Value | Activity Score | Growth Rate |\n';
        dataText += '|------|-------|------------|---------|------------|----------------|--------|-------------|--------|------|-------|----------|---------|-----------|------------|----------------|--------------|---------------|----------------|-------------|\n';
        
        towns.forEach((town: any) => {
          // Extract all relevant fields with proper fallbacks
          const name = town.name || 'Unknown';
          const mayor = town.mayor || 'Unknown';
          const mayorName = town.mayor_name || 'Unknown';
          const balance = town.balance !== undefined && town.balance !== null ? town.balance.toString() : 'Unknown';
          const population = town.population || 0;
          const residentsCount = town.residents_count || 0;
          const nation = town.nation?.name || town.nation_name || 'Independent';
          const nationName = town.nation_name || 'Independent';
          const status = town.status || (town.is_open ? 'Open' : 'Closed') || 'Unknown';
          const type = town.type || 'Town';
          const level = town.level || 1;
          const totalXp = town.total_xp || 0;
          const isOpen = town.is_open ? 'Yes' : 'No';
          const isPublic = town.is_public ? 'Yes' : 'No';
          const isCapital = town.is_capital ? 'Yes' : 'No';
          const location = `${town.location_x || 0}, ${town.location_z || 0}`;
          const spawn = `${town.spawn_x || 0}, ${town.spawn_y || 64}, ${town.spawn_z || 0}`;
          const marketValue = town.market_value || 0;
          const activityScore = town.activity_score || 0;
          const growthRate = town.growth_rate || 0;
          
          dataText += `| ${name} | ${mayor} | ${mayorName} | ${balance} | ${population} | ${residentsCount} | ${nation} | ${nationName} | ${status} | ${type} | ${level} | ${totalXp} | ${isOpen} | ${isPublic} | ${isCapital} | ${location} | ${spawn} | ${marketValue} | ${activityScore} | ${growthRate} |\n`;
        });
        dataText += '\n';
      } else {
        dataText += '### Towns:\nNo towns found in database.\n\n';
      }

      // Fetch nations data - try both old and new table structures
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      console.log('Nations query result:', { nations, nationsError });
      if (nations && nations.length > 0) {
        console.log('Sample nation data:', nations[0]);
        console.log('Available nation fields:', Object.keys(nations[0]));
      }

      if (!nationsError && nations && nations.length > 0) {
        dataText += '### Nations Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `leader`, `leader_name`, `leader_uuid`, `king_name`, `king_uuid`, `capital`, `capital_name`, `capital_town_name`, `capital_uuid`, `balance`, `population`, `residents_count`, `type`, `color`, `description`, `board`, `tag`, `taxes`, `town_tax`, `max_towns`, `is_open`, `is_public`, `towns_count`, `ally_count`, `enemy_count`, `last_activity`, `activity_score`, `growth_rate`, `created_at`, `updated_at`, `image_url`, `founded`, `lore`, `government`, `motto`, `specialties`, `history`\n\n';
        
        dataText += '**Complete Nations Data:**\n\n';
        dataText += '| Name | Leader | Leader Name | King Name | Capital | Capital Name | Balance | Population | Residents Count | Type | Color | Description | Government | Motto | Towns Count | Ally Count | Enemy Count | Activity Score | Growth Rate |\n';
        dataText += '|------|--------|-------------|-----------|---------|--------------|---------|------------|----------------|------|-------|-------------|------------|-------|-------------|------------|-------------|----------------|-------------|\n';
        
        nations.forEach((nation: any) => {
          // Extract all relevant fields with proper fallbacks
          const name = nation.name || 'Unknown';
          const leader = nation.leader || 'Unknown';
          const leaderName = nation.leader_name || 'Unknown';
          const kingName = nation.king_name || 'Unknown';
          const capital = nation.capital || 'Unknown';
          const capitalName = nation.capital_name || nation.capital_town_name || 'Unknown';
          const balance = nation.balance !== undefined && nation.balance !== null ? nation.balance.toString() : 'Unknown';
          const population = nation.population || 0;
          const residentsCount = nation.residents_count || 0;
          const type = nation.type || 'Nation';
          const color = nation.color || 'Unknown';
          const description = nation.description || 'No description';
          const government = nation.government || 'Unknown';
          const motto = nation.motto || 'No motto';
          const townsCount = nation.towns_count || 0;
          const allyCount = nation.ally_count || 0;
          const enemyCount = nation.enemy_count || 0;
          const activityScore = nation.activity_score || 0;
          const growthRate = nation.growth_rate || 0;
          
          dataText += `| ${name} | ${leader} | ${leaderName} | ${kingName} | ${capital} | ${capitalName} | ${balance} | ${population} | ${residentsCount} | ${type} | ${color} | ${description} | ${government} | ${motto} | ${townsCount} | ${allyCount} | ${enemyCount} | ${activityScore} | ${growthRate} |\n`;
        });
        dataText += '\n';
      } else {
        dataText += '### Nations:\nNo nations found in database.\n\n';
      }

      console.log('Final data text:', dataText);
      return dataText;
    } catch (error) {
      console.error('Error fetching towns and nations data:', error);
      return '';
    }
  }

  /**
   * Fetch comprehensive database data for AI context
   */
  static async getComprehensiveDatabaseData(): Promise<string> {
    try {
      let dataText = '## Current Database Information\n\n';

      // Fetch towns data
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (!townsError && towns && towns.length > 0) {
        dataText += '### Towns Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `mayor_uuid`, `mayor_name`, `balance`, `world_name`, `location_x`, `location_z`, `spawn_x`, `spawn_y`, `spawn_z`, `board`, `tag`, `is_public`, `is_open`, `max_residents`, `min_residents`, `max_plots`, `min_plots`, `taxes`, `plot_tax`, `shop_tax`, `embassy_tax`, `plot_price`, `nation_id`, `nation_name`, `nation_uuid`, `is_capital`, `residents_count`, `plots_count`, `home_block_count`, `shop_plot_count`, `embassy_plot_count`, `wild_plot_count`, `residents`, `last_activity`, `activity_score`, `growth_rate`, `market_value`, `level`, `total_xp`, `image_url`\n\n';
        
        dataText += '**Complete Towns Data:**\n\n';
        dataText += '| Name | Mayor Name | Balance | Nation | Is Open | Is Public | Level | Total XP | Residents Count | Location (X,Z) | Market Value | Activity Score |\n';
        dataText += '|------|------------|---------|--------|---------|-----------|-------|----------|----------------|----------------|--------------|----------------|\n';
        
        towns.forEach((town: any) => {
          const name = town.name || 'Unknown';
          const mayorName = town.mayor_name || 'Unknown';
          const balance = town.balance !== undefined && town.balance !== null ? town.balance.toString() : '0';
          const nation = town.nation_name || 'Independent';
          const isOpen = town.is_open ? 'Yes' : 'No';
          const isPublic = town.is_public ? 'Yes' : 'No';
          const level = town.level || 1;
          const totalXp = town.total_xp || 0;
          const residentsCount = town.residents_count || 0;
          const location = `${town.location_x || 0}, ${town.location_z || 0}`;
          const marketValue = town.market_value || 0;
          const activityScore = town.activity_score || 0;
          
          dataText += `| ${name} | ${mayorName} | ${balance} | ${nation} | ${isOpen} | ${isPublic} | ${level} | ${totalXp} | ${residentsCount} | ${location} | ${marketValue} | ${activityScore} |\n`;
        });
        dataText += '\n';
      }

      // Fetch nations data
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (!nationsError && nations && nations.length > 0) {
        dataText += '### Nations Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `leader_uuid`, `king_uuid`, `king_name`, `leader_name`, `capital_town_id`, `capital_town_name`, `capital_name`, `capital_uuid`, `balance`, `board`, `tag`, `taxes`, `town_tax`, `max_towns`, `is_open`, `is_public`, `towns_count`, `residents_count`, `ally_count`, `enemy_count`, `last_activity`, `activity_score`, `growth_rate`, `image_url`\n\n';
        
        dataText += '**Complete Nations Data:**\n\n';
        dataText += '| Name | Leader Name | King Name | Capital | Balance | Towns Count | Residents Count | Is Open | Activity Score | Growth Rate |\n';
        dataText += '|------|-------------|-----------|---------|---------|-------------|----------------|---------|----------------|-------------|\n';
        
        nations.forEach((nation: any) => {
          const name = nation.name || 'Unknown';
          const leaderName = nation.leader_name || 'Unknown';
          const kingName = nation.king_name || 'Unknown';
          const capital = nation.capital_town_name || nation.capital_name || 'Unknown';
          const balance = nation.balance !== undefined && nation.balance !== null ? nation.balance.toString() : '0';
          const townsCount = nation.towns_count || 0;
          const residentsCount = nation.residents_count || 0;
          const isOpen = nation.is_open ? 'Yes' : 'No';
          const activityScore = nation.activity_score || 0;
          const growthRate = nation.growth_rate || 0;
          
          dataText += `| ${name} | ${leaderName} | ${kingName} | ${capital} | ${balance} | ${townsCount} | ${residentsCount} | ${isOpen} | ${activityScore} | ${growthRate} |\n`;
        });
        dataText += '\n';
      }

      // Fetch shops data - CRITICAL for answering shop questions
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .order('item_type');

      if (!shopsError && shops && shops.length > 0) {
        dataText += '### Shops Database Table\n\n';
        dataText += '**Available Columns:** `id`, `owner_uuid`, `world`, `x`, `y`, `z`, `item_type`, `item_amount`, `item_durability`, `item_display_name`, `item_lore`, `item_enchants`, `item_custom_model_data`, `item_unbreakable`, `price`, `type`, `stock`, `unlimited`, `last_updated`, `description`, `company_id`, `is_featured`\n\n';
        
        dataText += '**Complete Shops Data:**\n\n';
        dataText += '| Item Type | Item Display Name | Price | Type | Stock | Unlimited | World | Location (X,Y,Z) | Company ID | Is Featured |\n';
        dataText += '|-----------|-------------------|-------|------|-------|-----------|-------|------------------|------------|-------------|\n';
        
        shops.forEach((shop: any) => {
          const itemType = shop.item_type || 'Unknown';
          const itemDisplayName = shop.item_display_name || itemType;
          const price = shop.price || 0;
          const type = shop.type || 'Unknown';
          const stock = shop.stock || 0;
          const unlimited = shop.unlimited ? 'Yes' : 'No';
          const world = shop.world || 'Unknown';
          const location = `${shop.x || 0}, ${shop.y || 0}, ${shop.z || 0}`;
          const companyId = shop.company_id || 'None';
          const isFeatured = shop.is_featured ? 'Yes' : 'No';
          
          dataText += `| ${itemType} | ${itemDisplayName} | ${price} | ${type} | ${stock} | ${unlimited} | ${world} | ${location} | ${companyId} | ${isFeatured} |\n`;
        });
        dataText += '\n';
      }

      // Fetch companies data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (!companiesError && companies && companies.length > 0) {
        dataText += '### Companies Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `slug`, `tagline`, `description`, `website_url`, `discord_invite`, `logo_url`, `banner_url`, `primary_color`, `secondary_color`, `business_type`, `industry`, `founded_date`, `headquarters_world`, `headquarters_coords`, `social_links`, `member_count`, `max_members`, `is_public`, `is_featured`, `gallery_images`, `featured_products`, `achievements`, `total_revenue`, `total_transactions`, `average_rating`, `review_count`, `owner_uuid`, `ceo_uuid`, `executives`, `members`, `status`, `verification_status`, `keywords`, `tags`, `parent_company_id`, `town_id`, `company_type`\n\n';
        
        dataText += '**Complete Companies Data:**\n\n';
        dataText += '| Name | Tagline | Industry | Member Count | Max Members | Total Revenue | Average Rating | Status | Verification Status | Company Type |\n';
        dataText += '|------|---------|----------|--------------|-------------|---------------|----------------|--------|-------------------|--------------|\n';
        
        companies.forEach((company: any) => {
          const name = company.name || 'Unknown';
          const tagline = company.tagline || 'No tagline';
          const industry = company.industry || 'Unknown';
          const memberCount = company.member_count || 0;
          const maxMembers = company.max_members || 'Unlimited';
          const totalRevenue = company.total_revenue || 0;
          const averageRating = company.average_rating || 0;
          const status = company.status || 'Unknown';
          const verificationStatus = company.verification_status || 'Unknown';
          const companyType = company.company_type || 'Unknown';
          
          dataText += `| ${name} | ${tagline} | ${industry} | ${memberCount} | ${maxMembers} | ${totalRevenue} | ${averageRating} | ${status} | ${verificationStatus} | ${companyType} |\n`;
        });
        dataText += '\n';
      }

      // Fetch players data
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (!playersError && players && players.length > 0) {
        dataText += '### Players Database Table\n\n';
        dataText += '**Available Columns:** `uuid`, `name`, `last_seen`, `level`, `total_xp`\n\n';
        
        dataText += '**Complete Players Data:**\n\n';
        dataText += '| Name | Level | Total XP | Last Seen |\n';
        dataText += '|------|-------|----------|-----------|\n';
        
        players.forEach((player: any) => {
          const name = player.name || 'Unknown';
          const level = player.level || 1;
          const totalXp = player.total_xp || 0;
          const lastSeen = player.last_seen ? new Date(player.last_seen * 1000).toISOString() : 'Unknown';
          
          dataText += `| ${name} | ${level} | ${totalXp} | ${lastSeen} |\n`;
        });
        dataText += '\n';
      }

      // Fetch residents data
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .order('name');

      if (!residentsError && residents && residents.length > 0) {
        dataText += '### Residents Database Table\n\n';
        dataText += '**Available Columns:** `uuid`, `name`, `town_id`, `town_name`, `nation_id`, `nation_name`, `is_mayor`, `is_king`, `is_assistant`, `is_treasurer`, `last_login`, `last_activity`, `total_playtime`, `activity_score`, `login_count`, `balance`, `total_deposits`, `total_withdrawals`, `total_taxes_paid`, `owned_plots`, `owned_towns`, `owned_nations`, `permissions`\n\n';
        
        dataText += '**Complete Residents Data:**\n\n';
        dataText += '| Name | Town | Nation | Is Mayor | Is King | Balance | Activity Score | Total Playtime |\n';
        dataText += '|------|------|--------|----------|---------|---------|----------------|----------------|\n';
        
        residents.forEach((resident: any) => {
          const name = resident.name || 'Unknown';
          const town = resident.town_name || 'None';
          const nation = resident.nation_name || 'None';
          const isMayor = resident.is_mayor ? 'Yes' : 'No';
          const isKing = resident.is_king ? 'Yes' : 'No';
          const balance = resident.balance || 0;
          const activityScore = resident.activity_score || 0;
          const totalPlaytime = resident.total_playtime || 0;
          
          dataText += `| ${name} | ${town} | ${nation} | ${isMayor} | ${isKing} | ${balance} | ${activityScore} | ${totalPlaytime} |\n`;
        });
        dataText += '\n';
      }

      // Fetch achievement definitions
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('name');

      if (!achievementsError && achievements && achievements.length > 0) {
        dataText += '### Achievement Definitions Database Table\n\n';
        dataText += '**Available Columns:** `id`, `name`, `description`, `stat`\n\n';
        
        dataText += '**Complete Achievement Definitions:**\n\n';
        dataText += '| ID | Name | Description | Stat |\n';
        dataText += '|----|------|-------------|------|\n';
        
        achievements.forEach((achievement: any) => {
          const id = achievement.id || 'Unknown';
          const name = achievement.name || 'Unknown';
          const description = achievement.description || 'No description';
          const stat = achievement.stat || 'Unknown';
          
          dataText += `| ${id} | ${name} | ${description} | ${stat} |\n`;
        });
        dataText += '\n';
      }

      // Fetch player leaderboard
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('player_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(20);

      if (!leaderboardError && leaderboard && leaderboard.length > 0) {
        dataText += '### Player Leaderboard (Top 20)\n\n';
        dataText += '**Available Columns:** `uuid`, `name`, `total_points`, `total_medals`, `gold_medals`, `silver_medals`, `bronze_medals`, `last_seen`\n\n';
        
        dataText += '**Top Players:**\n\n';
        dataText += '| Rank | Name | Total Points | Total Medals | Gold | Silver | Bronze |\n';
        dataText += '|------|------|--------------|--------------|------|--------|--------|\n';
        
        leaderboard.forEach((player: any, index: number) => {
          const name = player.name || 'Unknown';
          const totalPoints = player.total_points || 0;
          const totalMedals = player.total_medals || 0;
          const goldMedals = player.gold_medals || 0;
          const silverMedals = player.silver_medals || 0;
          const bronzeMedals = player.bronze_medals || 0;
          
          dataText += `| ${index + 1} | ${name} | ${totalPoints} | ${totalMedals} | ${goldMedals} | ${silverMedals} | ${bronzeMedals} |\n`;
        });
        dataText += '\n';
      }

      console.log('Final comprehensive database data:', dataText);
      return dataText;
    } catch (error) {
      console.error('Error fetching comprehensive database data:', error);
      return '';
    }
  }

  static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Replace hashQuestion with a browser-compatible async version
  static async hashQuestion(question: string): Promise<string> {
    // Use SHA-256 for a consistent hash (browser-compatible)
    const encoder = new TextEncoder();
    const data = encoder.encode(question);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get comprehensive context for AI based on user query
   */
  static async getAIContext(userQuery: string): Promise<string> {
    try {
      // --- AI ANSWER CACHE: Check for cached answer first ---
      const normalizedQuestion = this.normalizeString(userQuery);
      const questionHash = await this.hashQuestion(normalizedQuestion);
      let entity = '';
      // Try to extract a main entity (first word > 3 chars)
      const entityMatch = normalizedQuestion.match(/([a-z0-9]{4,})/g);
      if (entityMatch && entityMatch.length > 0) entity = entityMatch[0];
      // Check cache
      const { data: cached, error: cacheError } = await supabase
        .from('ai_answer_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .maybeSingle();
      if (cached && cached.answer) {
        // Increment hits
        await supabase.from('ai_answer_cache').update({ hits: (cached.hits || 1) + 1, updated_at: new Date().toISOString() }).eq('id', cached.id);
        console.log('[AIKnowledgeService] Returning cached answer for:', normalizedQuestion);
        return cached.answer;
      }

      let context = '';
      let matchedWikiContent = '';
      let matchedPagesCount = 0;
      let debugLog = [];
      
      // Always fetch AI documents to make the AI smarter
      const aiDocs = await this.getAIDocuments(userQuery);
      if (aiDocs) {
        context += aiDocs + '\n\n';
        debugLog.push(`[DEBUG] Included AI docs in context.`);
      }

      // Always fetch wiki documents for community knowledge
      const wikiDocs = await this.getWikiDocuments(userQuery);
      if (wikiDocs) {
        context += wikiDocs + '\n\n';
        debugLog.push(`[DEBUG] Included general wiki docs in context.`);
      }

      // --- ENHANCEMENT: Use the wiki_pages_index table for robust entity matching ---
      const entityMatchForPages = userQuery.match(/([A-Za-z0-9_\- ]{3,})/g);
      let matchedPages = [];
      if (entityMatchForPages) {
        const normalizedQuery = this.normalizeString(userQuery);
        const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);
        debugLog.push(`[DEBUG] Entity matching: normalizedQuery = ${normalizedQuery}, queryWords = ${JSON.stringify(queryWords)}`);
        // Query all wiki_pages_index rows
        const { data: allWikiPages, error: indexError } = await supabase
          .from('wiki_pages_index')
          .select('*');
        if (indexError) {
          debugLog.push(`[DEBUG] Error querying wiki_pages_index: ${indexError.message}`);
        } else if (allWikiPages && allWikiPages.length > 0) {
          // First, try strong (substring) matches
          let strongMatches = [];
          let partialMatches = [];
          let fuzzyMatches = [];
          for (const page of allWikiPages) {
            const normTitle = this.normalizeString(page.title || '');
            const normSlug = this.normalizeString(page.slug || '');
            const normPath = this.normalizeString(page.path || '');
            // Strong match: full query is substring
            const strong = normTitle.includes(normalizedQuery) || normSlug.includes(normalizedQuery) || normPath.includes(normalizedQuery);
            // Partial match: any word in query is substring
            const partial = queryWords.some(word => normTitle.includes(word) || normSlug.includes(word) || normPath.includes(word));
            // Fuzzy match: Levenshtein distance <= 2 for any word
            const levenshtein = (a, b) => {
              if (a.length === 0) return b.length;
              if (b.length === 0) return a.length;
              const matrix = [];
              for (let i = 0; i <= b.length; i++) matrix[i] = [i];
              for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
              for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                  if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                  } else {
                    matrix[i][j] = Math.min(
                      matrix[i - 1][j - 1] + 1, // substitution
                      matrix[i][j - 1] + 1,     // insertion
                      matrix[i - 1][j] + 1      // deletion
                    );
                  }
                }
              }
              return matrix[b.length][a.length];
            };
            let fuzzy = false;
            if (!strong && !partial) {
              for (const word of queryWords) {
                if (
                  levenshtein(word, normTitle) <= 2 ||
                  levenshtein(word, normSlug) <= 2 ||
                  levenshtein(word, normPath) <= 2
                ) {
                  fuzzy = true;
                  break;
                }
              }
            }
            if (strong) {
              strongMatches.push(page);
            } else if (partial) {
              partialMatches.push(page);
            } else if (fuzzy) {
              fuzzyMatches.push(page);
            }
          }
          if (strongMatches.length > 0) {
            matchedPages = strongMatches;
            debugLog.push(`[DEBUG] Strong matches found: ${strongMatches.map(p => p.title).join(', ')}`);
          } else if (partialMatches.length > 0) {
            matchedPages = partialMatches;
            debugLog.push(`[DEBUG] Partial matches found: ${partialMatches.map(p => p.title).join(', ')}`);
          } else if (fuzzyMatches.length > 0) {
            matchedPages = fuzzyMatches;
            debugLog.push(`[DEBUG] Fuzzy matches found: ${fuzzyMatches.map(p => p.title).join(', ')}`);
          } else {
            debugLog.push(`[DEBUG] No strong or partial matches for: ${normalizedQuery}`);
          }
          // Sort by best match (title/slug/path containing the full normalized query first)
          matchedPages = matchedPages.sort((a, b) => {
            const aNorm = this.normalizeString(a.title + ' ' + a.slug + ' ' + a.path);
            const bNorm = this.normalizeString(b.title + ' ' + b.slug + ' ' + b.path);
            const aScore = aNorm.includes(normalizedQuery) ? 1 : 0;
            const bScore = bNorm.includes(normalizedQuery) ? 1 : 0;
            return bScore - aScore;
          });
          // Only keep the top 2 most relevant
          matchedPages = matchedPages.slice(0, 2);
          matchedPagesCount = matchedPages.length;
          debugLog.push(`[DEBUG] Final matched wiki pages: ${matchedPages.map(p => p.title).join(', ')}`);
          for (const fileInfo of matchedPages) {
            try {
              const { data: fileContent, error } = await supabase.storage
                .from(fileInfo.bucket)
                .download(fileInfo.path);
              if (!error && fileContent) {
                let text = await fileContent.text();
                if (text.length > 800) text = text.slice(0, 800) + '\n...';
                matchedWikiContent += `\n## Wiki Page: ${fileInfo.title} (${fileInfo.path})\n${text}\n`;
                debugLog.push(`[DEBUG] ✓ Included wiki page: ${fileInfo.title} from ${fileInfo.bucket}/${fileInfo.path}`);
              }
            } catch (err) {
              debugLog.push(`[DEBUG] Error downloading ${fileInfo.path}: ${err}`);
            }
          }
        } else {
          debugLog.push(`[DEBUG] No wiki pages found in index for query: ${userQuery}`);
        }
      }

      // --- PRIORITIZE WIKI CONTENT FOR LORE/HISTORY ---
      // If we found relevant wiki pages, prepend them to the context
      if (matchedWikiContent) {
        context = `\n# IMPORTANT: The following wiki pages are highly relevant to the user's question.\n${matchedWikiContent}\n` + context;
      }

      // --- OPTIMIZE: Only include relevant database rows ---
      let dbData = '';
      if (entityMatchForPages) {
        // Try to match town/nation/player/company names
        const normalizedQuery = this.normalizeString(userQuery);
        // Towns
        const { data: towns } = await supabase.from('towns').select('*');
        if (towns && towns.length > 0) {
          const matchedTowns = towns.filter(town => this.normalizeString(town.name).includes(normalizedQuery));
          if (matchedTowns.length > 0) {
            dbData += '\n## Relevant Towns Data\n';
            for (const town of matchedTowns) {
              dbData += `- Name: ${town.name}, Mayor: ${town.mayor_name}, Nation: ${town.nation_name}, Residents: ${town.residents_count}, Level: ${town.level}, Activity: ${town.activity_score}\n`;
              debugLog.push(`[DEBUG] Included town: ${town.name}`);
            }
          }
        }
        // Nations
        const { data: nations } = await supabase.from('nations').select('*');
        if (nations && nations.length > 0) {
          const matchedNations = nations.filter(nation => this.normalizeString(nation.name).includes(normalizedQuery));
          if (matchedNations.length > 0) {
            dbData += '\n## Relevant Nations Data\n';
            for (const nation of matchedNations) {
              dbData += `- Name: ${nation.name}, Leader: ${nation.leader_name}, Capital: ${nation.capital_town_name}, Residents: ${nation.residents_count}, Towns: ${nation.towns_count}\n`;
              debugLog.push(`[DEBUG] Included nation: ${nation.name}`);
            }
          }
        }
        // Players
        const { data: players } = await supabase.from('players').select('*');
        if (players && players.length > 0) {
          const matchedPlayers = players.filter(player => this.normalizeString(player.name).includes(normalizedQuery));
          if (matchedPlayers.length > 0) {
            dbData += '\n## Relevant Players Data\n';
            for (const player of matchedPlayers) {
              dbData += `- Name: ${player.name}\n`;
              debugLog.push(`[DEBUG] Included player: ${player.name}`);
            }
          }
        }
      }
      if (dbData) {
        context += dbData + '\n';
      }

      // Always include Towny plugin knowledge
      const townyKnowledge = this.getTownyKnowledge();
      context += townyKnowledge + '\n\n';
      debugLog.push('[DEBUG] Included Towny plugin knowledge.');

      // (No longer include full comprehensive database data by default)
      // const comprehensiveData = await this.getComprehensiveDatabaseData();
      // if (comprehensiveData) {
      //   context += comprehensiveData + '\n\n';
      // }

      debugLog.push(`[DEBUG] Final context length: ${context.length}`);
      debugLog.push(`[DEBUG] First 2000 chars of context: ${context.slice(0, 2000)}`);
      console.log(debugLog.join('\n'));
      return context;
    } catch (error) {
      console.error('Error getting AI context:', error);
      return '';
    }
  }

  // Call this after generating an answer to cache it
  static async cacheAIAnswer(userQuery: string, answer: string) {
    const normalizedQuestion = this.normalizeString(userQuery);
    const questionHash = await this.hashQuestion(normalizedQuestion);
    let entity = '';
    const entityMatch = normalizedQuestion.match(/([a-z0-9]{4,})/g);
    if (entityMatch && entityMatch.length > 0) entity = entityMatch[0];
    await supabase.from('ai_answer_cache').upsert({
      question_hash: questionHash,
      entity,
      answer,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'question_hash' });
    console.log('[AIKnowledgeService] Cached answer for:', normalizedQuestion);
  }

  /**
   * Get Towny plugin knowledge
   */
  static getTownyKnowledge(): string {
    return `## Towny Plugin Knowledge

### Towny Commands
- **/town** - Main town command
- **/town new [name]** - Create a new town
- **/town claim** - Claim a plot for your town
- **/town unclaim** - Unclaim a plot
- **/town add [player]** - Add a resident to your town
- **/town remove [player]** - Remove a resident from your town
- **/town set mayor [player]** - Set a new mayor
- **/town set board [message]** - Set town board message
- **/town set tag [tag]** - Set town tag
- **/town set name [name]** - Rename town
- **/town set spawn** - Set town spawn point
- **/town set homeblock** - Set town home block
- **/town set taxes [amount]** - Set town taxes
- **/town set plotprice [amount]** - Set plot price
- **/town set perm [resident/ally/outsider] [build/destroy/switch/itemuse]** - Set permissions
- **/town deposit [amount]** - Deposit money to town bank
- **/town withdraw [amount]** - Withdraw money from town bank
- **/town list** - List all towns
- **/town online** - Show online residents
- **/town here** - Show town info for current location
- **/town ranklist** - Show town ranks and permissions

### Nation Commands
- **/nation** - Main nation command
- **/nation new [name] [capital]** - Create a new nation
- **/nation add [town]** - Add a town to your nation
- **/nation remove [town]** - Remove a town from your nation
- **/nation set capital [town]** - Set nation capital
- **/nation set king [player]** - Set nation king
- **/nation set board [message]** - Set nation board message
- **/nation set tag [tag]** - Set nation tag
- **/nation set name [name]** - Rename nation
- **/nation set taxes [amount]** - Set nation taxes
- **/nation deposit [amount]** - Deposit money to nation bank
- **/nation withdraw [amount]** - Withdraw money from nation bank
- **/nation list** - List all nations
- **/nation ranklist** - Show nation ranks and permissions

### Plot Commands
- **/plot** - Main plot command
- **/plot claim** - Claim the plot you're standing on
- **/plot unclaim** - Unclaim the plot you're standing on
- **/plot forsale [price]** - Put plot up for sale
- **/plot notforsale** - Remove plot from sale
- **/plot buy** - Buy a plot that's for sale
- **/plot set [resident/ally/outsider] [build/destroy/switch/itemuse]** - Set plot permissions
- **/plot set reset** - Reset plot permissions to town default
- **/plot set name [name]** - Name the plot
- **/plot set price [price]** - Set plot price
- **/plot set perm [resident/ally/outsider] [build/destroy/switch/itemuse]** - Set plot permissions

### Resident Commands
- **/resident** - Main resident command
- **/resident set [friend/enemy]** - Set friend/enemy status
- **/resident set perm [resident/ally/outsider] [build/destroy/switch/itemuse]** - Set personal permissions
- **/resident deposit [amount]** - Deposit money to personal bank
- **/resident withdraw [amount]** - Withdraw money from personal bank
- **/resident list** - List all residents

### General Commands
- **/towny** - Main Towny command
- **/towny map** - Show town map
- **/towny top** - Show top towns/nations
- **/towny time** - Show server time
- **/towny prices** - Show current prices
- **/towny unclaim [world]** - Unclaim all plots in world
- **/towny toggle** - Toggle various settings

### Towny Concepts
- **Towns**: Player-created settlements with claimed plots
- **Nations**: Groups of towns with shared government
- **Plots**: Individual land areas that can be claimed
- **Residents**: Players who live in towns
- **Mayors**: Town leaders with full control
- **Kings**: Nation leaders with full control
- **Taxes**: Regular payments from residents to towns/nations
- **Bank**: Money storage for towns, nations, and residents
- **Permissions**: Control over building, destroying, switching, and item use
- **Ranks**: Different permission levels for residents
- **Allies**: Friendly relationships between towns/nations
- **Enemies**: Hostile relationships between towns/nations

### Towny Economy
- **Town Bank**: Stores town money from taxes and deposits
- **Nation Bank**: Stores nation money from taxes and deposits
- **Resident Bank**: Personal money storage for each player
- **Taxes**: Regular payments (daily/weekly/monthly)
- **Plot Prices**: Cost to buy individual plots
- **Town Costs**: Daily upkeep costs for towns
- **Nation Costs**: Daily upkeep costs for nations

### Towny Permissions
- **Build**: Ability to place blocks
- **Destroy**: Ability to break blocks
- **Switch**: Ability to use switches (buttons, levers, etc.)
- **ItemUse**: Ability to use items (chests, furnaces, etc.)
- **Permission Levels**: Resident (town members), Ally (friendly towns), Outsider (everyone else)

### Towny Ranks
- **Mayor**: Town leader with full control
- **Assistant**: Can manage town but not delete it
- **Treasurer**: Can manage town money
- **Resident**: Regular town member
- **King**: Nation leader with full control
- **Nation Assistant**: Can manage nation but not delete it
- **Nation Treasurer**: Can manage nation money

This knowledge helps Thor understand how Towny works and can provide accurate information about town/nation management, commands, and gameplay mechanics.`;
  }
} 