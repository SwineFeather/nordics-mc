# Leveling and Achievements System MVP Definition

## Overview
This document defines the MVP (Minimum Viable Product) for a comprehensive leveling and achievements system based on Minecraft server statistics. The system tracks player activities, awards XP, levels, and achievements based on various gameplay metrics.

## Data Structure

### Player Stats Format
```json
{
  "stat_name": {
    "rank": 5,
    "value": 222
  }
}
```

### Available Stats (150+ tracked metrics)
Based on the analyzed player data, the following stats are tracked:

#### Core Activity Stats
- `play` - Total playtime (ticks)
- `walk` - Distance walked
- `sprint` - Distance sprinted
- `jump` - Number of jumps
- `swim` - Distance swam
- `climb` - Distance climbed
- `fall` - Distance fallen
- `dive` - Distance dived
- `crouch` - Distance crouched
- `aviate` - Distance flown with elytra

#### Combat Stats
- `kill_any` - Total mob kills
- `damage_dealt` - Total damage dealt
- `damage_taken` - Total damage taken
- `damage_shield` - Damage blocked with shield
- `use_bow` - Bow usage count
- `use_crossbow` - Crossbow usage count
- `use_sword` - Sword usage count
- `use_axe` - Axe usage count

#### Mining Stats
- `mine_ground` - Total blocks mined
- `mine_stone` - Stone blocks mined
- `mine_wood` - Wood blocks mined
- `mine_iron_ore` - Iron ore mined
- `mine_coal_ore` - Coal ore mined
- `mine_diamond_ore` - Diamond ore mined
- `mine_gold_ore` - Gold ore mined
- `mine_emerald_ore` - Emerald ore mined
- `mine_lapis_ore` - Lapis ore mined
- `mine_redstone_ore` - Redstone ore mined
- `mine_copper_ore` - Copper ore mined
- `mine_ancient_debris` - Ancient debris mined
- `mine_nether_quartz_ore` - Nether quartz ore mined
- `mine_obsidian` - Obsidian mined
- `mine_glass` - Glass mined
- `mine_snow` - Snow mined
- `mine_ice` - Ice mined
- `mine_grass` - Grass blocks mined

#### Building Stats
- `use_dirt` - Dirt blocks placed
- `place_stairs` - Stairs placed
- `place_wall` - Walls placed
- `place_torch` - Torches placed
- `place_glass` - Glass blocks placed
- `place_rails` - Rails placed
- `place_scaffolding` - Scaffolding placed
- `place_bars` - Bars placed
- `place_conveyor` - Conveyors placed
- `place_electrics` - Electrical components placed
- `place_candle` - Candles placed
- `place_lantern` - Lanterns placed
- `place_banner` - Banners placed
- `place_sapling` - Saplings placed
- `place_sign` - Signs placed
- `place_piston` - Pistons placed
- `place_lightning_rod` - Lightning rods placed
- `place_lodestone` - Lodestones placed

#### Crafting Stats
- `craft_tools` - Tools crafted
- `craft_armor` - Armor crafted
- `craft_sword` - Swords crafted
- `craft_tnt` - TNT crafted
- `craft_bookshelf` - Bookshelves crafted
- `craft_mineral_block` - Mineral blocks crafted
- `craft_wool` - Wool crafted
- `craft_paper` - Paper crafted
- `craft_bread` - Bread crafted
- `craft_ender_chest` - Ender chests crafted
- `craft_turtle_helmet` - Turtle helmets crafted
- `craft_clock` - Clocks crafted
- `craft_compass` - Compasses crafted
- `craft_spyglass` - Spyglasses crafted
- `craft_beacon` - Beacons crafted
- `craft_bundle` - Bundles crafted
- `craft_respawn_anchor` - Respawn anchors crafted
- `craft_glowstone` - Glowstone crafted
- `craft_recovery_compass` - Recovery compasses crafted

#### Farming Stats
- `use_hoe` - Hoe usage
- `harvest_nether_wart` - Nether wart harvested
- `harvest_bamboo` - Bamboo harvested
- `harvest_sugar` - Sugar cane harvested
- `collect_berries` - Berries collected
- `collect_shroom` - Mushrooms collected
- `pot_flower` - Flowers potted
- `breed` - Animals bred

#### Interaction Stats
- `interact_stonecutter` - Stonecutter interactions
- `interact_blast_furnace` - Blast furnace interactions
- `interact_grindstone` - Grindstone interactions
- `interact_anvil` - Anvil interactions
- `interact_lectern` - Lectern interactions
- `interact_cartography` - Cartography table interactions
- `interact_brewing_stand` - Brewing stand interactions
- `interact_smoker` - Smoker interactions
- `interact_loom` - Loom interactions
- `interact_campfire` - Campfire interactions
- `open_container` - Container openings
- `enchant` - Items enchanted
- `sleep` - Times slept
- `use_potion` - Potions used
- `use_fireworks` - Fireworks used
- `use_egg` - Eggs used
- `use_ender_pearl` - Ender pearls used
- `use_lava_bucket` - Lava buckets used
- `use_water_bucket` - Water buckets used
- `use_shears` - Shears used
- `use_flint` - Flint used
- `use_book` - Books used
- `use_goat_horn` - Goat horns used
- `use_snowball` - Snowballs used
- `use_honey_bottle` - Honey bottles used
- `use_totem` - Totems used
- `use_ender_eye` - Ender eyes used

#### Transportation Stats
- `ride_horse` - Horse riding distance
- `ride_boat` - Boat riding distance
- `ride_pig` - Pig riding distance
- `ride_minecart` - Minecart riding distance
- `ride_strider` - Strider riding distance

#### Food Stats
- `eat_meat` - Meat consumed
- `eat_fish` - Fish consumed
- `eat_veggie` - Vegetables consumed
- `eat_soup` - Soup consumed
- `eat_cookie` - Cookies consumed
- `eat_rawmeat` - Raw meat consumed
- `eat_junkfood` - Junk food consumed
- `drink_milk` - Milk consumed

#### Mob Kill Stats
- `kill_skeleton` - Skeletons killed
- `kill_zombie` - Zombies killed
- `kill_spider` - Spiders killed
- `kill_creeper` - Creepers killed
- `kill_enderman` - Endermen killed
- `kill_slime` - Slimes killed
- `kill_magma_cube` - Magma cubes killed
- `kill_ghast` - Ghasts killed
- `kill_blaze` - Blazes killed
- `kill_witch` - Witches killed
- `kill_phantom` - Phantoms killed
- `kill_illagers` - Illagers killed
- `kill_warden` - Wardens killed
- `kill_ender_dragon` - Ender dragons killed
- `kill_wither` - Withers killed
- `kill_goat` - Goats killed
- `kill_sheep` - Sheep killed
- `kill_cow` - Cows killed
- `kill_pig` - Pigs killed
- `kill_chicken` - Chickens killed
- `kill_wolf` - Wolves killed
- `kill_bat` - Bats killed
- `kill_squid` - Squids killed
- `kill_guardian` - Guardians killed
- `kill_shulker` - Shulkers killed
- `kill_wither_skeleton` - Wither skeletons killed
- `kill_zombified_piglin` - Zombified piglins killed
- `kill_piglin` - Piglins killed
- `kill_hoglins` - Hoglins killed
- `kill_strider` - Striders killed
- `kill_endermite` - Endermites killed
- `kill_silverfish` - Silverfish killed
- `kill_vex` - Vexes killed
- `kill_ravager` - Ravagers killed
- `kill_pillager` - Pillagers killed
- `kill_vindicator` - Vindicators killed
- `kill_evoker` - Evokers killed
- `kill_villager` - Villagers killed
- `kill_wandering_trader` - Wandering traders killed
- `kill_iron_golem` - Iron golems killed
- `kill_snow_golem` - Snow golems killed
- `kill_parrot` - Parrots killed
- `kill_rabbit` - Rabbits killed
- `kill_fox` - Foxes killed
- `kill_panda` - Pandas killed
- `kill_bee` - Bees killed
- `kill_dolphin` - Dolphins killed
- `kill_turtle` - Turtles killed
- `kill_axolotl` - Axolotls killed
- `kill_frog` - Frogs killed
- `kill_tadpole` - Tadpoles killed
- `kill_sniffer` - Sniffers killed
- `kill_camel` - Camels killed
- `kill_mooshroom` - Mooshrooms killed
- `kill_allay` - Allays killed
- `kill_polar_bear` - Polar bears killed
- `kill_llama` - Llamas killed
- `kill_trader_llama` - Trader llamas killed
- `kill_cat` - Cats killed
- `kill_ocelot` - Ocelots killed

#### Death Stats
- `death` - Total deaths
- `killed_by_creeper` - Deaths by creeper
- `killed_by_warden` - Deaths by warden
- `time_since_death` - Time since last death (ticks)
- `time_since_sleep` - Time since last sleep (ticks)

#### Special Stats
- `biomes` - Unique biomes visited
- `mine_dimensional` - Dimensional blocks mined
- `mine_nether_foliage` - Nether foliage mined
- `mine_coral` - Coral mined
- `mine_kelp` - Kelp mined
- `mine_pointed_dripstone` - Pointed dripstone mined
- `mine_amethyst` - Amethyst mined
- `mine_cobweb` - Cobwebs mined
- `mine_spawner` - Spawners mined
- `mine_coral` - Coral mined
- `mine_kelp` - Kelp mined
- `mine_pointed_dripstone` - Pointed dripstone mined
- `mine_amethyst` - Amethyst mined
- `mine_cobweb` - Cobwebs mined
- `mine_spawner` - Spawners mined
- `drop` - Items dropped
- `trade` - Trades completed
- `win_raid` - Raids won
- `trigger_raid` - Raids triggered
- `ring_bell` - Bells rung
- `noteblock` - Note blocks played
- `play_record` - Records played
- `walk_on_water` - Distance walked on water
- `place_chorus_flower` - Chorus flowers placed
- `use_snowball` - Snowballs used
- `use_egg` - Eggs used
- `use_ender_pearl` - Ender pearls used
- `use_lava_bucket` - Lava buckets used
- `use_water_bucket` - Water buckets used
- `use_shears` - Shears used
- `use_flint` - Flint used
- `use_book` - Books used
- `use_goat_horn` - Goat horns used
- `use_snowball` - Snowballs used
- `use_honey_bottle` - Honey bottles used
- `use_totem` - Totems used
- `use_ender_eye` - Ender eyes used

## Leveling System

### Player Levels (15 levels)
```typescript
interface LevelDefinition {
  level: number;
  xp_required: number;
  title: string;
  description: string;
  color: string;
}

const PLAYER_LEVELS: LevelDefinition[] = [
  { level: 1, xp_required: 0, title: 'Newcomer', description: 'Welcome to the server!', color: '#6b7280' },
  { level: 2, xp_required: 100, title: 'Novice', description: 'Getting started', color: '#10b981' },
  { level: 3, xp_required: 250, title: 'Apprentice', description: 'Learning the ropes', color: '#3b82f6' },
  { level: 4, xp_required: 500, title: 'Journeyman', description: 'Making progress', color: '#8b5cf6' },
  { level: 5, xp_required: 1000, title: 'Adventurer', description: 'Exploring the world', color: '#f59e0b' },
  { level: 6, xp_required: 1750, title: 'Explorer', description: 'Discovering new places', color: '#06b6d4' },
  { level: 7, xp_required: 2750, title: 'Veteran', description: 'Experienced player', color: '#84cc16' },
  { level: 8, xp_required: 4000, title: 'Expert', description: 'Skilled and knowledgeable', color: '#f97316' },
  { level: 9, xp_required: 6000, title: 'Master', description: 'Mastered the game', color: '#ef4444' },
  { level: 10, xp_required: 8500, title: 'Champion', description: 'Elite player', color: '#a855f7' },
  { level: 11, xp_required: 12000, title: 'Legend', description: 'Legendary status', color: '#dc2626' },
  { level: 12, xp_required: 16500, title: 'Mythic', description: 'Mythical prowess', color: '#9333ea' },
  { level: 13, xp_required: 22500, title: 'Ascended', description: 'Beyond mortal limits', color: '#1d4ed8' },
  { level: 14, xp_required: 30000, title: 'Divine', description: 'Divine power', color: '#059669' },
  { level: 15, xp_required: 40000, title: 'Transcendent', description: 'Transcended reality', color: '#be123c' },
  { level: 16, xp_required: 52500, title: 'Cosmic', description: 'Cosmic significance', color: '#7c3aed' },
  { level: 17, xp_required: 67500, title: 'Ethereal', description: 'Beyond mortal understanding', color: '#d97706' },
  { level: 18, xp_required: 85000, title: 'Celestial', description: 'Celestial power', color: '#ec4899' },
  { level: 19, xp_required: 105000, title: 'Astral', description: 'Master of the stars', color: '#6366f1' },
  { level: 20, xp_required: 127500, title: 'Galactic', description: 'Ruler of galaxies', color: '#10b981' },
  { level: 21, xp_required: 152500, title: 'Universal', description: 'Universal conqueror', color: '#f59e0b' },
  { level: 22, xp_required: 180000, title: 'Infinite', description: 'Infinite potential', color: '#ef4444' },
  { level: 23, xp_required: 210000, title: 'Eternal', description: 'Timeless legend', color: '#a855f7' },
  { level: 24, xp_required: 242500, title: 'Omnipotent', description: 'Ultimate power', color: '#dc2626' },
  { level: 25, xp_required: 277500, title: 'Omniscient', description: 'All-knowing entity', color: '#9333ea' },
  { level: 26, xp_required: 315000, title: 'Primordial', description: 'Origin of all', color: '#1d4ed8' },
  { level: 27, xp_required: 355000, title: 'Voidwalker', description: 'Master of the void', color: '#059669' },
  { level: 28, xp_required: 397500, title: 'Starforger', description: 'Creator of stars', color: '#be123c' },
  { level: 29, xp_required: 442500, title: 'Reality Weaver', description: 'Shaper of reality', color: '#7c3aed' },
  { level: 30, xp_required: 490000, title: 'Time Lord', description: 'Master of time', color: '#d97706' },
  { level: 31, xp_required: 540000, title: 'Dimension Lord', description: 'Ruler of dimensions', color: '#ec4899' },
  { level: 32, xp_required: 592500, title: 'Cosmic Sovereign', description: 'Sovereign of the cosmos', color: '#6366f1' },
  { level: 33, xp_required: 647500, title: 'Eternal Monarch', description: 'Eternal ruler', color: '#10b981' },
  { level: 34, xp_required: 705000, title: 'Transcendent King', description: 'King beyond reality', color: '#f59e0b' },
  { level: 35, xp_required: 765000, title: 'Nexus Overlord', description: 'Ultimate overlord of existence', color: '#ef4444' }
];

const TOWN_LEVELS: LevelDefinition[] = [
  { level: 1, xp_required: 0, title: 'Outpost', description: 'A small gathering of settlers', color: '#6b7280' },
  { level: 2, xp_required: 50, title: 'Camp', description: 'A temporary settlement', color: '#6b7280' },
  { level: 3, xp_required: 125, title: 'Settlement', description: 'A permanent home for pioneers', color: '#10b981' },
  { level: 4, xp_required: 225, title: 'Hamlet', description: 'A small but growing community', color: '#10b981' },
  { level: 5, xp_required: 350, title: 'Village', description: 'A thriving rural settlement', color: '#10b981' },
  { level: 6, xp_required: 500, title: 'Town', description: 'A bustling center of activity', color: '#3b82f6' },
  { level: 7, xp_required: 700, title: 'Market Town', description: 'A hub of commerce and trade', color: '#3b82f6' },
  { level: 8, xp_required: 950, title: 'Port Town', description: 'A coastal trading center', color: '#3b82f6' },
  { level: 9, xp_required: 1250, title: 'Mining Town', description: 'A settlement built on resources', color: '#3b82f6' },
  { level: 10, xp_required: 1600, title: 'Farming Town', description: 'A settlement sustained by agriculture', color: '#3b82f6' },
  { level: 11, xp_required: 2000, title: 'Trading Post', description: 'A center of regional commerce', color: '#8b5cf6' },
  { level: 12, xp_required: 2500, title: 'Crossroads', description: 'A town at the intersection of trade routes', color: '#8b5cf6' },
  { level: 13, xp_required: 3100, title: 'Fortress Town', description: 'A well-defended settlement', color: '#8b5cf6' },
  { level: 14, xp_required: 3800, title: 'University Town', description: 'A center of learning and knowledge', color: '#8b5cf6' },
  { level: 15, xp_required: 4600, title: 'Craftsmen Town', description: 'A settlement of skilled artisans', color: '#8b5cf6' },
  { level: 16, xp_required: 5500, title: 'Merchant Town', description: 'A wealthy trading center', color: '#f59e0b' },
  { level: 17, xp_required: 6500, title: 'Guild Town', description: 'A settlement of organized crafts', color: '#f59e0b' },
  { level: 18, xp_required: 7600, title: 'Harbor Town', description: 'A major port settlement', color: '#f59e0b' },
  { level: 19, xp_required: 8800, title: 'Frontier Town', description: 'A settlement on the edge of civilization', color: '#f59e0b' },
  { level: 20, xp_required: 10200, title: 'Industrial Town', description: 'A center of manufacturing', color: '#f59e0b' }
];
```

## Achievement System

### Achievement Structure
```typescript
interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  color: string;
  tiers: AchievementTier[];
}

interface AchievementTier {
  tier: number;
  name: string;
  description: string;
  threshold: number;
  icon: string;
  points: number;
}
```

### Player Achievements

#### 1. Time Lord (Playtime)
- **Stat**: `custom_minecraft_play_time`
- **Description**: Accumulate playtime on the server
- **Tiers**:
  - Tier 1: Newcomer (1 hour) - 50 points
  - Tier 2: Regular (10 hours) - 100 points
  - Tier 3: Dedicated (50 hours) - 150 points
  - Tier 4: Veteran (100 hours) - 200 points
  - Tier 5: Loyal (450 hours) - 250 points
  - Tier 6: Time Lord (900 hours) - 300 points

#### 2. Master Builder (Blocks Placed)
- **Stat**: `use_dirt` (primary), `place_stairs`, `place_wall`, etc.
- **Description**: Place blocks to build amazing structures
- **Tiers**:
  - Tier 1: Builder (1,000 blocks) - 50 points
  - Tier 2: Constructor (5,000 blocks) - 100 points
  - Tier 3: Engineer (25,000 blocks) - 150 points
  - Tier 4: Master Builder (100,000 blocks) - 200 points
  - Tier 5: Architect (500,000 blocks) - 250 points

#### 3. Excavator (Blocks Broken)
- **Stat**: `mine_ground` (primary), `mine_stone`, `mine_wood`, etc.(calculate multiple ones)
- **Description**: Break blocks to gather resources
- **Tiers**:
  - Tier 1: Digger (1,000 blocks) - 50 points
  - Tier 2: Miner (5,000 blocks) - 100 points
  - Tier 3: Quarryman (25,000 blocks) - 150 points
  - Tier 4: Strip Miner (100,000 blocks) - 200 points
  - Tier 5: Excavator (500,000 blocks) - 250 points

#### 4. Monster Hunter (Mob Kills)
- **Stat**: `kill_any` (calculate multilpe ones)
- **Description**: Defeat hostile mobs and creatures
- **Tiers**:
  - Tier 1: Hunter (100 mobs) - 50 points
  - Tier 2: Warrior (500 mobs) - 100 points
  - Tier 3: Champion (2,500 mobs) - 150 points
  - Tier 4: Gladiator (10,000 mobs) - 200 points
  - Tier 5: Slayer (50,000 mobs) - 250 points

#### 5. Boat Captain (Boat Travel)
- **Stat**: `ride_boat`
- **Description**: Navigate the seas and waterways
- **Tiers**:
  - Tier 1: Sailor (1km) - 50 points
  - Tier 2: Navigator (5km) - 100 points
  - Tier 3: Seafarer (25km) - 150 points
  - Tier 4: Admiral (100km) - 200 points
  - Tier 5: Boat Captain (500km) - 250 points

#### 6. Wood Cutter (Wood Harvesting)
- **Stat**: `mine_wood`
- **Description**: Harvest wood from trees
- **Tiers**:
  - Tier 1: Lumberjack (100 logs) - 50 points
  - Tier 2: Forester (500 logs) - 100 points
  - Tier 3: Tree Feller (2,500 logs) - 150 points
  - Tier 4: Master Logger (10,000 logs) - 200 points
  - Tier 5: Wood Cutter (25,000 logs) - 250 points

#### 7. Financier (Wealth)
- **Stat**: `balance`
- **Description**: Accumulate wealth and riches
- **Tiers**:
  - Tier 1: Saver (10,000 coins) - 10 points
  - Tier 2: Investor (50,000 coins) - 20 points
  - Tier 3: Wealthy (250,000 coins) - 30 points
  - Tier 4: Rich (1,000,000 coins) - 40 points
  - Tier 5: Financier (5,000,000 coins) - 50 points

#### 8. Diamond Miner (Diamond Mining)
- **Stat**: `mine_diamond_ore`
- **Description**: Mine diamond ore blocks
- **Tiers**:
  - Tier 1: Shiny Finder (1 diamond ore) - 100 points
  - Tier 2: Gem Seeker (10 diamond ore) - 200 points
  - Tier 3: Treasure Hunter (50 diamond ore) - 300 points
  - Tier 4: Deep Delver (200 diamond ore) - 400 points
  - Tier 5: Diamond King (1,000 diamond ore) - 500 points

#### 9. Wheat Farmer (Farming)
- **Stat**: `mined.wheat`
- **Description**: Harvest wheat crops
- **Tiers**:
  - Tier 1: Harvester (100 wheat) - 50 points
  - Tier 2: Field Worker (500 wheat) - 100 points
  - Tier 3: Crop Master (2,500 wheat) - 150 points
  - Tier 4: Golden Farmer (10,000 wheat) - 200 points
  - Tier 5: Wheat Baron (50,000 wheat) - 250 points

### Town Achievements

#### 1. Population Growth
- **Stat**: `population`
- **Description**: Grow your town population
- **Tiers**:
  - Tier 1: Small Settlement (3 residents) - 50 points
  - Tier 2: Growing Community (5 residents) - 100 points
  - Tier 3: Thriving Town (10 residents) - 150 points
  - Tier 4: Major City (15 residents) - 200 points
  - Tier 5: Metropolis (20 residents) - 250 points
  - Tier 6: Mega City (30 residents) - 300 points
  - Tier 7: Capital City (40 residents) - 350 points
  - Tier 8: Empire Capital (50 residents) - 400 points

#### 2. Nation Member
- **Stat**: `nation_member`
- **Description**: Join a nation and become part of something greater
- **Tiers**:
  - Tier 1: Nation Citizen (Join a nation) - 100 points

#### 3. Independent Spirit
- **Stat**: `independent`
- **Description**: Maintain independence as a sovereign town
- **Tiers**:
  - Tier 1: Independent Town (Remain independent) - 150 points

#### 4. Capital Status
- **Stat**: `capital`
- **Description**: Become the capital of your nation
- **Tiers**:
  - Tier 1: Nation Capital (Become a nation capital) - 200 points

## XP Calculation System

### Player XP Sources
1. **Playtime**: 1 hour = 1 XP
2. **Block Placement**: 1 block = 0.02 XP
3. **Block Mining**: 1 block = 0.01 XP
4. **Mob Kills**: 1 kill = 0.1 XP
5. **Diamond Mining**: 1 diamond ore = 2 XP
7. **Special Activities**: Various XP rewards

### Town XP Sources
1. **Population**: 1 resident = 10 XP
2. **Buildings**: Various building types = XP
3. **Infrastructure**: Roads, farms, etc. = XP
4. **Achievements**: Achievement points = XP
5. **Activity**: Town member activity = XP

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  uuid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Level Definitions Table
```sql
CREATE TABLE level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Achievement Definitions Table
```sql
CREATE TABLE achievement_definitions (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stat VARCHAR(255) NOT NULL,
  color VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Achievement Tiers Table
```sql
CREATE TABLE achievement_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id VARCHAR(255) REFERENCES achievement_definitions(id),
  tier INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  threshold INTEGER NOT NULL,
  icon VARCHAR(255),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(achievement_id, tier)
);
```

### Unlocked Achievements Table
```sql
CREATE TABLE unlocked_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid UUID REFERENCES players(uuid),
  achievement_id VARCHAR(255) REFERENCES achievement_definitions(id),
  tier_id UUID REFERENCES achievement_tiers(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  current_value INTEGER DEFAULT 0
);
```

## API Endpoints

### Player Stats
- `GET /api/players/{uuid}/stats` - Get player statistics
- `GET /api/players/{uuid}/level` - Get player level info
- `GET /api/players/{uuid}/achievements` - Get player achievements

### Achievements
- `GET /api/achievements` - Get all achievement definitions
- `GET /api/achievements/{id}` - Get specific achievement
- `GET /api/achievements/{id}/tiers` - Get achievement tiers

### Levels
- `GET /api/levels` - Get all level definitions
- `GET /api/levels/{level}` - Get specific level definition

### Towns
- `GET /api/towns/{id}/level` - Get town level info
- `GET /api/towns/{id}/achievements` - Get town achievements

## Implementation Notes

### Stat Mapping
- Some stats have different names in the database vs. achievement system
- Use mapping tables to convert between stat names
- Handle stat value conversions (ticks to hours, cm to blocks, etc.)

### Performance Considerations
- Cache frequently accessed data (level definitions, achievement definitions)
- Use database functions for level calculations
- Implement pagination for large datasets
- Use Redis for real-time stats caching

### Data Validation
- Validate stat values are within reasonable ranges
- Handle missing or corrupted data gracefully
- Implement data consistency checks

### Security
- Validate user permissions for achievement unlocks
- Prevent achievement manipulation
- Audit achievement unlock events

This MVP provides a comprehensive foundation for a leveling and achievements system that can be extended and customized based on specific server needs. 