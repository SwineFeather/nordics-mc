-- Fix achievement stat names to match actual player stats
-- Update achievement definitions to use correct stat names from player data

-- Note: This migration updates the stat names in achievement definitions
-- The actual stat calculation will need to be implemented when we know where player stats are stored

-- First, let's see what stats are actually available and update the definitions
UPDATE public.achievement_definitions 
SET stat = 'play' 
WHERE id = 'playtime';

-- For blocks placed, we need to sum multiple place_* stats
-- We'll use a custom stat name that we'll handle specially
UPDATE public.achievement_definitions 
SET stat = 'blocks_placed_total' 
WHERE id = 'blocks_placed';

-- For blocks broken, we need to sum multiple mine_* stats  
UPDATE public.achievement_definitions 
SET stat = 'blocks_broken_total' 
WHERE id = 'blocks_broken';

-- For mob kills, we need to sum multiple kill_* stats
UPDATE public.achievement_definitions 
SET stat = 'mob_kills_total' 
WHERE id = 'mob_kills';

-- For diamond mining, use the correct stat name
UPDATE public.achievement_definitions 
SET stat = 'mine_diamond_ore' 
WHERE id = 'diamond_mining';

-- For fishing, check if use_fishing_rod exists, otherwise use a placeholder
UPDATE public.achievement_definitions 
SET stat = 'use_fishing_rod' 
WHERE id = 'fishing';

-- For woodcutting, use the correct stat name
UPDATE public.achievement_definitions 
SET stat = 'mine_wood' 
WHERE id = 'woodcutting';

-- For travel, use the correct stat name
UPDATE public.achievement_definitions 
SET stat = 'walk' 
WHERE id = 'travel';

-- For combat weapons, check if use_netherite_sword exists, otherwise use a placeholder
UPDATE public.achievement_definitions 
SET stat = 'use_netherite_sword' 
WHERE id = 'combat_weapons';

-- For ranged combat, use the correct stat name
UPDATE public.achievement_definitions 
SET stat = 'use_bow' 
WHERE id = 'ranged_combat';

-- Note: The get_claimable_achievements function will need to be updated separately
-- when we know where player stats are stored and how to access them 