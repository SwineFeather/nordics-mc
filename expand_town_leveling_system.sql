-- Expand Town Leveling System with More Levels and Better Names
-- Replaces the current 15-level system with a 50-level system using appropriate town-themed names

-- First, clear existing level definitions
DELETE FROM public.town_level_definitions;

-- Insert expanded level definitions (50 levels total)
INSERT INTO public.town_level_definitions (level, xp_required, title, description, color) VALUES
-- Early Levels (1-10): Foundation and Growth
(1, 0, 'Outpost', 'A small gathering of settlers', '#6b7280'),
(2, 50, 'Camp', 'A temporary settlement', '#6b7280'),
(3, 125, 'Settlement', 'A permanent home for pioneers', '#10b981'),
(4, 225, 'Hamlet', 'A small but growing community', '#10b981'),
(5, 350, 'Village', 'A thriving rural settlement', '#10b981'),
(6, 500, 'Town', 'A bustling center of activity', '#3b82f6'),
(7, 700, 'Market Town', 'A hub of commerce and trade', '#3b82f6'),
(8, 950, 'Port Town', 'A coastal trading center', '#3b82f6'),
(9, 1250, 'Mining Town', 'A settlement built on resources', '#3b82f6'),
(10, 1600, 'Farming Town', 'A settlement sustained by agriculture', '#3b82f6'),

-- Mid Levels (11-25): Development and Prosperity
(11, 2000, 'Trading Post', 'A center of regional commerce', '#8b5cf6'),
(12, 2500, 'Crossroads', 'A town at the intersection of trade routes', '#8b5cf6'),
(13, 3100, 'Fortress Town', 'A well-defended settlement', '#8b5cf6'),
(14, 3800, 'University Town', 'A center of learning and knowledge', '#8b5cf6'),
(15, 4600, 'Craftsmen Town', 'A settlement of skilled artisans', '#8b5cf6'),
(16, 5500, 'Merchant Town', 'A wealthy trading center', '#f59e0b'),
(17, 6500, 'Guild Town', 'A settlement of organized crafts', '#f59e0b'),
(18, 7600, 'Harbor Town', 'A major port settlement', '#f59e0b'),
(19, 8800, 'Frontier Town', 'A settlement on the edge of civilization', '#f59e0b'),
(20, 10200, 'Industrial Town', 'A center of manufacturing', '#f59e0b'),
(21, 11700, 'Cultural Town', 'A center of arts and culture', '#ef4444'),
(22, 13300, 'Religious Town', 'A center of faith and spirituality', '#ef4444'),
(23, 15000, 'Academic Town', 'A center of research and education', '#ef4444'),
(24, 16800, 'Military Town', 'A settlement with strong defenses', '#ef4444'),
(25, 18700, 'Diplomatic Town', 'A center of international relations', '#ef4444'),

-- High Levels (26-40): Prestige and Influence
(26, 20700, 'Regional Capital', 'The leading town of a region', '#ec4899'),
(27, 22800, 'Provincial Capital', 'A capital of great importance', '#ec4899'),
(28, 25000, 'Territorial Capital', 'A capital of vast territories', '#ec4899'),
(29, 27300, 'Federal Capital', 'A capital of federal significance', '#ec4899'),
(30, 29700, 'Imperial Capital', 'A capital of imperial might', '#ec4899'),
(31, 32200, 'Royal Capital', 'A capital of royal authority', '#6366f1'),
(32, 34800, 'Noble Capital', 'A capital of noble heritage', '#6366f1'),
(33, 37500, 'Ancient Capital', 'A capital with ancient roots', '#6366f1'),
(34, 40300, 'Sacred Capital', 'A capital of divine significance', '#6366f1'),
(35, 43200, 'Legendary Capital', 'A capital of legendary status', '#6366f1'),
(36, 46200, 'Mythical Capital', 'A capital of mythical proportions', '#dc2626'),
(37, 49300, 'Divine Capital', 'A capital touched by the divine', '#dc2626'),
(38, 52500, 'Celestial Capital', 'A capital of celestial significance', '#dc2626'),
(39, 55800, 'Ethereal Capital', 'A capital beyond mortal understanding', '#dc2626'),
(40, 59200, 'Transcendent Capital', 'A capital that transcends reality', '#dc2626'),

-- Elite Levels (41-50): Ultimate Achievement
(41, 62700, 'Cosmic Capital', 'A capital of cosmic significance', '#be185d'),
(42, 66300, 'Dimensional Capital', 'A capital spanning dimensions', '#be185d'),
(43, 70000, 'Temporal Capital', 'A capital beyond time', '#be185d'),
(44, 73800, 'Spatial Capital', 'A capital beyond space', '#be185d'),
(45, 77700, 'Quantum Capital', 'A capital of quantum existence', '#be185d'),
(46, 81700, 'Void Capital', 'A capital in the void', '#7c3aed'),
(47, 85800, 'Infinity Capital', 'A capital of infinite possibilities', '#7c3aed'),
(48, 90000, 'Eternal Capital', 'A capital that will last forever', '#7c3aed'),
(49, 94300, 'Omnipotent Capital', 'A capital of ultimate power', '#7c3aed'),
(50, 98700, 'Transcendent Nexus', 'The ultimate town - beyond all comprehension', '#dc2626');

-- Update the calculate_town_level_from_xp function to handle the new level structure
CREATE OR REPLACE FUNCTION public.calculate_town_level_from_xp(town_xp BIGINT)
RETURNS TABLE (
  level INTEGER,
  xp_in_current_level BIGINT,
  xp_for_next_level BIGINT,
  progress NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_level INTEGER := 1;
  current_level_xp BIGINT := 0;
  next_level_xp BIGINT;
  level_def RECORD;
BEGIN
  -- Find the current level
  SELECT * INTO level_def
  FROM public.town_level_definitions
  WHERE xp_required <= town_xp
  ORDER BY level DESC
  LIMIT 1;
  
  IF level_def IS NOT NULL THEN
    current_level := level_def.level;
    current_level_xp := level_def.xp_required;
  END IF;
  
  -- Find the next level XP requirement
  SELECT xp_required INTO next_level_xp
  FROM public.town_level_definitions
  WHERE level = current_level + 1
  LIMIT 1;
  
  IF next_level_xp IS NULL THEN
    -- Max level reached
    next_level_xp := current_level_xp + 100000;
  END IF;
  
  RETURN QUERY
  SELECT 
    current_level,
    town_xp - current_level_xp,
    next_level_xp - current_level_xp,
    CASE 
      WHEN next_level_xp > current_level_xp THEN 
        LEAST(100.0, ((town_xp - current_level_xp)::NUMERIC / (next_level_xp - current_level_xp)::NUMERIC) * 100.0)
      ELSE 100.0
    END;
END;
$$;

-- Update the sync function to handle the new level structure
CREATE OR REPLACE FUNCTION public.sync_town_achievements()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  town_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  town_stat_value NUMERIC;
  town_xp BIGINT := 0;
  new_level INTEGER;
BEGIN
  -- Loop through all towns
  FOR town_record IN 
    SELECT 
      id,
      name,
      residents_count,
      nation_name,
      is_capital,
      created_at,
      activity_score,
      balance,
      plots_count,
      total_xp,
      level
    FROM public.towns
  LOOP
    town_xp := COALESCE(town_record.total_xp, 0);
    
    -- Loop through all achievement definitions
    FOR achievement_record IN 
      SELECT * FROM public.town_achievement_definitions
    LOOP
      -- Get the appropriate stat value based on achievement type
      CASE achievement_record.stat
        WHEN 'population' THEN
          town_stat_value := COALESCE(town_record.residents_count, 0);
        WHEN 'nation_member' THEN
          town_stat_value := CASE WHEN town_record.nation_name IS NOT NULL AND town_record.nation_name != '' THEN 1 ELSE 0 END;
        WHEN 'independent' THEN
          town_stat_value := CASE WHEN town_record.nation_name IS NULL OR town_record.nation_name = '' THEN 1 ELSE 0 END;
        WHEN 'capital' THEN
          town_stat_value := CASE WHEN town_record.is_capital = true THEN 1 ELSE 0 END;
        WHEN 'age' THEN
          town_stat_value := EXTRACT(DAY FROM (NOW() - town_record.created_at));
        WHEN 'activity' THEN
          town_stat_value := COALESCE(town_record.activity_score, 0);
        WHEN 'wealth' THEN
          town_stat_value := COALESCE(town_record.balance, 0);
        WHEN 'plots' THEN
          town_stat_value := COALESCE(town_record.plots_count, 0);
        ELSE
          town_stat_value := 0;
      END CASE;
      
      -- Check all tiers for this achievement and award qualifying ones
      FOR tier_record IN 
        SELECT * FROM public.town_achievement_tiers 
        WHERE achievement_id = achievement_record.id 
        AND threshold <= town_stat_value
        ORDER BY tier ASC
      LOOP
        -- Insert achievement if not already unlocked
        INSERT INTO public.town_unlocked_achievements (town_id, tier_id, unlocked_at)
        VALUES (town_record.id::TEXT, tier_record.id, NOW())
        ON CONFLICT (town_id, tier_id) DO NOTHING;
        
        -- Add XP if not already claimed
        IF NOT EXISTS (
          SELECT 1 FROM public.town_unlocked_achievements 
          WHERE town_id = town_record.id::TEXT 
          AND tier_id = tier_record.id 
          AND is_claimed = true
        ) THEN
          town_xp := town_xp + tier_record.points;
        END IF;
      END LOOP;
    END LOOP;
    
    -- Calculate new level
    SELECT level INTO new_level
    FROM public.calculate_town_level_from_xp(town_xp);
    
    -- Update town with new XP and level
    UPDATE public.towns 
    SET total_xp = town_xp, level = new_level
    WHERE id = town_record.id;
  END LOOP;
END;
$$;

-- Provide a summary of the new system
SELECT 
  'Town Leveling System Expanded' as message,
  '50 levels total' as levels,
  'Better names without city implications' as improvement,
  'More gradual progression' as progression;

-- Show the new level structure
SELECT 
  level,
  title,
  xp_required,
  color
FROM public.town_level_definitions
ORDER BY level; 