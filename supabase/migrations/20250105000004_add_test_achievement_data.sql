-- Add basic achievement definitions and tiers for testing

-- Insert achievement definitions
INSERT INTO public.achievement_definitions (id, name, description, stat) VALUES
('playtime', 'Time Lord', 'Accumulate playtime on the server', 'play'),
('blocks_placed', 'Master Builder', 'Place blocks to build amazing structures', 'blocks_placed_total'),
('blocks_broken', 'Mining Master', 'Break blocks to gather resources', 'blocks_broken_total'),
('mob_kills', 'Combat Expert', 'Defeat hostile mobs', 'mob_kills_total'),
('diamond_mining', 'Diamond Hunter', 'Mine diamond ores', 'mine_diamond_ore'),
('fishing', 'Master Angler', 'Catch fish and treasures', 'use_fishing_rod'),
('woodcutting', 'Lumberjack', 'Cut down trees and gather wood', 'mine_wood'),
('travel', 'Explorer', 'Travel across the world', 'walk'),
('combat_weapons', 'Weapon Master', 'Master different combat weapons', 'use_netherite_sword'),
('ranged_combat', 'Archer', 'Master ranged combat', 'use_bow')
ON CONFLICT (id) DO NOTHING;

-- Insert achievement tiers
INSERT INTO public.achievement_tiers (achievement_id, tier, name, description, threshold, icon, points) VALUES
-- Playtime tiers
('playtime', 1, 'Newcomer', 'Play for 1 hour', 1, 'clock', 50),
('playtime', 2, 'Regular', 'Play for 10 hours', 10, 'clock', 100),
('playtime', 3, 'Dedicated', 'Play for 50 hours', 50, 'clock', 150),
('playtime', 4, 'Veteran', 'Play for 100 hours', 100, 'clock', 200),
('playtime', 5, 'Time Lord', 'Play for 500 hours', 500, 'clock', 250),

-- Blocks placed tiers
('blocks_placed', 1, 'Builder', 'Place 1,000 blocks', 1000, 'hammer', 50),
('blocks_placed', 2, 'Constructor', 'Place 5,000 blocks', 5000, 'hammer', 100),
('blocks_placed', 3, 'Engineer', 'Place 25,000 blocks', 25000, 'hammer', 150),
('blocks_placed', 4, 'Master Builder', 'Place 100,000 blocks', 100000, 'hammer', 200),
('blocks_placed', 5, 'Architect', 'Place 500,000 blocks', 500000, 'hammer', 250),

-- Blocks broken tiers
('blocks_broken', 1, 'Miner', 'Break 1,000 blocks', 1000, 'pickaxe', 50),
('blocks_broken', 2, 'Excavator', 'Break 5,000 blocks', 5000, 'pickaxe', 100),
('blocks_broken', 3, 'Tunneler', 'Break 25,000 blocks', 25000, 'pickaxe', 150),
('blocks_broken', 4, 'Mining Master', 'Break 100,000 blocks', 100000, 'pickaxe', 200),
('blocks_broken', 5, 'Terraformer', 'Break 500,000 blocks', 500000, 'pickaxe', 250),

-- Mob kills tiers
('mob_kills', 1, 'Fighter', 'Kill 100 mobs', 100, 'swords', 50),
('mob_kills', 2, 'Warrior', 'Kill 500 mobs', 500, 'swords', 100),
('mob_kills', 3, 'Slayer', 'Kill 2,500 mobs', 2500, 'swords', 150),
('mob_kills', 4, 'Combat Expert', 'Kill 10,000 mobs', 10000, 'swords', 200),
('mob_kills', 5, 'Legendary Hunter', 'Kill 50,000 mobs', 50000, 'swords', 250),

-- Diamond mining tiers
('diamond_mining', 1, 'Prospector', 'Mine 10 diamond ores', 10, 'gem', 100),
('diamond_mining', 2, 'Diamond Hunter', 'Mine 50 diamond ores', 50, 'gem', 200),
('diamond_mining', 3, 'Diamond Master', 'Mine 200 diamond ores', 200, 'gem', 300),
('diamond_mining', 4, 'Diamond Baron', 'Mine 1,000 diamond ores', 1000, 'gem', 400),
('diamond_mining', 5, 'Diamond King', 'Mine 5,000 diamond ores', 5000, 'gem', 500),

-- Fishing tiers
('fishing', 1, 'Fisher', 'Use fishing rod 100 times', 100, 'ship', 50),
('fishing', 2, 'Angler', 'Use fishing rod 500 times', 500, 'ship', 100),
('fishing', 3, 'Master Angler', 'Use fishing rod 2,500 times', 2500, 'ship', 150),
('fishing', 4, 'Fishing Legend', 'Use fishing rod 10,000 times', 10000, 'ship', 200),
('fishing', 5, 'Sea Lord', 'Use fishing rod 50,000 times', 50000, 'ship', 250),

-- Woodcutting tiers
('woodcutting', 1, 'Woodcutter', 'Mine 100 oak logs', 100, 'tree-deciduous', 50),
('woodcutting', 2, 'Lumberjack', 'Mine 500 oak logs', 500, 'tree-deciduous', 100),
('woodcutting', 3, 'Forest Master', 'Mine 2,500 oak logs', 2500, 'tree-deciduous', 150),
('woodcutting', 4, 'Timber Baron', 'Mine 10,000 oak logs', 10000, 'tree-deciduous', 200),
('woodcutting', 5, 'Nature Guardian', 'Mine 50,000 oak logs', 50000, 'tree-deciduous', 250),

-- Travel tiers
('travel', 1, 'Wanderer', 'Walk 10,000 blocks', 10000, 'footprints', 50),
('travel', 2, 'Explorer', 'Walk 50,000 blocks', 50000, 'footprints', 100),
('travel', 3, 'Adventurer', 'Walk 250,000 blocks', 250000, 'footprints', 150),
('travel', 4, 'Voyager', 'Walk 1,000,000 blocks', 1000000, 'footprints', 200),
('travel', 5, 'World Walker', 'Walk 5,000,000 blocks', 5000000, 'footprints', 250),

-- Combat weapons tiers
('combat_weapons', 1, 'Swordsman', 'Use netherite sword 100 times', 100, 'sword', 100),
('combat_weapons', 2, 'Blade Master', 'Use netherite sword 500 times', 500, 'sword', 200),
('combat_weapons', 3, 'Weapon Master', 'Use netherite sword 2,500 times', 2500, 'sword', 300),
('combat_weapons', 4, 'Combat Legend', 'Use netherite sword 10,000 times', 10000, 'sword', 400),
('combat_weapons', 5, 'War God', 'Use netherite sword 50,000 times', 50000, 'sword', 500),

-- Ranged combat tiers
('ranged_combat', 1, 'Archer', 'Use bow 100 times', 100, 'bow', 50),
('ranged_combat', 2, 'Marksman', 'Use bow 500 times', 500, 'bow', 100),
('ranged_combat', 3, 'Sharpshooter', 'Use bow 2,500 times', 2500, 'bow', 150),
('ranged_combat', 4, 'Ranged Master', 'Use bow 10,000 times', 10000, 'bow', 200),
('ranged_combat', 5, 'Eagle Eye', 'Use bow 50,000 times', 50000, 'bow', 250)
ON CONFLICT (achievement_id, tier) DO NOTHING;

-- Insert level definitions
INSERT INTO public.level_definitions (level, xp_required, title, description, color) VALUES
(1, 0, 'Newcomer', 'Welcome to the server!', '#6b7280'),
(2, 100, 'Novice', 'Getting started', '#10b981'),
(3, 250, 'Apprentice', 'Learning the ropes', '#3b82f6'),
(4, 500, 'Journeyman', 'Making progress', '#8b5cf6'),
(5, 1000, 'Adventurer', 'Exploring the world', '#f59e0b'),
(6, 1750, 'Explorer', 'Discovering new places', '#06b6d4'),
(7, 2750, 'Veteran', 'Experienced player', '#84cc16'),
(8, 4000, 'Expert', 'Skilled and knowledgeable', '#f97316'),
(9, 6000, 'Master', 'Mastered the game', '#ef4444'),
(10, 8500, 'Champion', 'Elite player', '#a855f7'),
(11, 12000, 'Legend', 'Legendary status', '#dc2626'),
(12, 16500, 'Mythic', 'Mythical prowess', '#9333ea'),
(13, 22500, 'Ascended', 'Beyond mortal limits', '#1d4ed8'),
(14, 30000, 'Divine', 'Divine power', '#059669'),
(15, 40000, 'Transcendent', 'Transcended reality', '#be123c')
ON CONFLICT (level) DO NOTHING; 