
-- Create level_definitions table for configurable leveling system
CREATE TABLE public.level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required BIGINT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on level_definitions
ALTER TABLE public.level_definitions ENABLE ROW LEVEL SECURITY;

-- Create policy for level_definitions (public read, admin write)
CREATE POLICY "Anyone can view level definitions" 
  ON public.level_definitions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage level definitions" 
  ON public.level_definitions 
  FOR ALL 
  USING (has_role_or_higher('admin'::app_role));

-- Populate level_definitions with initial data (levels 1-100)
INSERT INTO public.level_definitions (level, xp_required, title, description, color) VALUES
(1, 0, 'Newcomer', 'Welcome to the server!', '#10b981'),
(2, 100, 'Explorer', 'Starting your journey', '#10b981'),
(3, 250, 'Adventurer', 'Getting the hang of things', '#10b981'),
(4, 450, 'Builder', 'Creating your first structures', '#10b981'),
(5, 700, 'Settler', 'Making your mark', '#10b981'),
(6, 1000, 'Crafter', 'Mastering the basics', '#3b82f6'),
(7, 1350, 'Miner', 'Delving deeper', '#3b82f6'),
(8, 1750, 'Warrior', 'Battle tested', '#3b82f6'),
(9, 2200, 'Architect', 'Building with purpose', '#3b82f6'),
(10, 2700, 'Veteran', 'A seasoned player', '#3b82f6'),
(11, 3250, 'Expert', 'Highly skilled', '#8b5cf6'),
(12, 3850, 'Master', 'True mastery', '#8b5cf6'),
(13, 4500, 'Champion', 'Among the best', '#8b5cf6'),
(14, 5200, 'Elite', 'Elite status', '#8b5cf6'),
(15, 5950, 'Legend', 'Legendary player', '#8b5cf6'),
(16, 6750, 'Mythic', 'Mythical status', '#f59e0b'),
(17, 7600, 'Divine', 'Divine powers', '#f59e0b'),
(18, 8500, 'Immortal', 'Immortal being', '#f59e0b'),
(19, 9450, 'Transcendent', 'Beyond mortal limits', '#f59e0b'),
(20, 10450, 'Godlike', 'Godlike abilities', '#f59e0b'),
(25, 15000, 'Titan', 'Titan of the realm', '#ef4444'),
(30, 25000, 'Overlord', 'Overlord status', '#ef4444'),
(35, 40000, 'Emperor', 'Imperial power', '#ef4444'),
(40, 60000, 'Cosmic', 'Cosmic entity', '#ef4444'),
(45, 85000, 'Universal', 'Universal force', '#ef4444'),
(50, 115000, 'Omnipotent', 'All-powerful being', '#dc2626'),
(60, 200000, 'Infinite', 'Beyond comprehension', '#dc2626'),
(70, 350000, 'Eternal', 'Eternal existence', '#dc2626'),
(80, 550000, 'Absolute', 'Absolute power', '#dc2626'),
(90, 800000, 'Supreme', 'Supreme being', '#dc2626'),
(100, 1200000, 'Transcendent God', 'The ultimate achievement', '#7c2d12');

-- Fill in intermediate levels with exponential growth
DO $$
DECLARE
  i INTEGER;
  base_xp BIGINT;
  growth_factor NUMERIC := 1.15;
BEGIN
  -- Fill levels 21-24
  FOR i IN 21..24 LOOP
    base_xp := 10450 + (i - 20) * 1200;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Godlike', 'Ascending to greatness', '#f59e0b');
  END LOOP;
  
  -- Fill levels 26-29
  FOR i IN 26..29 LOOP
    base_xp := 15000 + (i - 25) * 2500;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Titan', 'Titanium strength', '#ef4444');
  END LOOP;
  
  -- Fill levels 31-34
  FOR i IN 31..34 LOOP
    base_xp := 25000 + (i - 30) * 3750;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Overlord', 'Commanding presence', '#ef4444');
  END LOOP;
  
  -- Fill levels 36-39
  FOR i IN 36..39 LOOP
    base_xp := 40000 + (i - 35) * 5000;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Emperor', 'Imperial might', '#ef4444');
  END LOOP;
  
  -- Fill levels 41-44
  FOR i IN 41..44 LOOP
    base_xp := 60000 + (i - 40) * 6250;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Cosmic', 'Cosmic power', '#ef4444');
  END LOOP;
  
  -- Fill levels 46-49
  FOR i IN 46..49 LOOP
    base_xp := 85000 + (i - 45) * 7500;
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Universal', 'Universal dominion', '#ef4444');
  END LOOP;
  
  -- Fill remaining levels with exponential growth
  FOR i IN 51..59 LOOP
    base_xp := 115000 + FLOOR(POWER(growth_factor, i - 50) * 10000);
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Omnipotent', 'Beyond mortal understanding', '#dc2626');
  END LOOP;
  
  FOR i IN 61..69 LOOP
    base_xp := 200000 + FLOOR(POWER(growth_factor, i - 60) * 15000);
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Infinite', 'Infinite potential', '#dc2626');
  END LOOP;
  
  FOR i IN 71..79 LOOP
    base_xp := 350000 + FLOOR(POWER(growth_factor, i - 70) * 25000);
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Eternal', 'Eternal existence', '#dc2626');
  END LOOP;
  
  FOR i IN 81..89 LOOP
    base_xp := 550000 + FLOOR(POWER(growth_factor, i - 80) * 35000);
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Absolute', 'Absolute dominance', '#dc2626');
  END LOOP;
  
  FOR i IN 91..99 LOOP
    base_xp := 800000 + FLOOR(POWER(growth_factor, i - 90) * 50000);
    INSERT INTO public.level_definitions (level, xp_required, title, description, color) 
    VALUES (i, base_xp, 'Supreme', 'Supreme mastery', '#dc2626');
  END LOOP;
END $$;

-- Create function to calculate level from XP using database values
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(player_xp BIGINT)
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
BEGIN
  -- Find the highest level the player has reached
  SELECT ld.level, ld.xp_required
  INTO current_level, current_level_xp
  FROM public.level_definitions ld
  WHERE ld.xp_required <= player_xp
  ORDER BY ld.level DESC
  LIMIT 1;
  
  -- Get XP required for next level
  SELECT ld.xp_required
  INTO next_level_xp
  FROM public.level_definitions ld
  WHERE ld.level = current_level + 1;
  
  -- If no next level exists, use current level XP + 100000
  IF next_level_xp IS NULL THEN
    next_level_xp := current_level_xp + 100000;
  END IF;
  
  -- Return the calculated values
  RETURN QUERY SELECT 
    current_level,
    player_xp - current_level_xp,
    next_level_xp - current_level_xp,
    CASE 
      WHEN next_level_xp - current_level_xp > 0 
      THEN ROUND(((player_xp - current_level_xp) * 100.0) / (next_level_xp - current_level_xp), 2)
      ELSE 100.0
    END;
END;
$$;

-- Update the award_achievement_xp function to properly calculate levels
CREATE OR REPLACE FUNCTION public.award_achievement_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  xp_amount INTEGER;
  new_total_xp BIGINT;
  calculated_level INTEGER;
BEGIN
  -- Get the XP points for this achievement tier
  SELECT points INTO xp_amount
  FROM public.achievement_tiers
  WHERE id = NEW.tier_id;
  
  -- Update player's total XP
  UPDATE public.players
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE uuid = NEW.player_uuid
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_level_from_xp(new_total_xp);
  
  -- Update player's level
  UPDATE public.players
  SET level = calculated_level
  WHERE uuid = NEW.player_uuid;
  
  RETURN NEW;
END;
$$;

-- Create function to sync all achievements for all players
CREATE OR REPLACE FUNCTION public.sync_all_achievements()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  player_stat_value NUMERIC;
  highest_tier_id UUID;
  existing_achievement_count INTEGER;
BEGIN
  -- Loop through all players
  FOR player_record IN (
    SELECT p.uuid, ps.stats
    FROM public.players p
    LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats IS NOT NULL
  ) LOOP
    
    -- Loop through all achievement definitions
    FOR achievement_record IN (
      SELECT * FROM public.achievement_definitions
    ) LOOP
      
      -- Get the player's stat value for this achievement
      player_stat_value := COALESCE(
        (player_record.stats ->> achievement_record.stat)::NUMERIC,
        0
      );
      
      -- Skip if player has no progress in this stat
      CONTINUE WHEN player_stat_value <= 0;
      
      -- Find the highest tier this player qualifies for
      highest_tier_id := NULL;
      
      -- Special handling for 'death' stat (lower is better)
      IF achievement_record.id = 'survivor' THEN
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND player_stat_value <= threshold
        ORDER BY tier DESC
        LIMIT 1;
      ELSE
        -- Normal achievements (higher is better)
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND player_stat_value >= threshold
        ORDER BY tier DESC
        LIMIT 1;
      END IF;
      
      -- If player qualifies for a tier, check if they already have it
      IF highest_tier_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.unlocked_achievements
        WHERE player_uuid = player_record.uuid
          AND tier_id = highest_tier_id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.unlocked_achievements (player_uuid, tier_id)
          VALUES (player_record.uuid, highest_tier_id);
        END IF;
      END IF;
      
    END LOOP;
  END LOOP;
  
  -- Recalculate all player levels based on their total XP
  UPDATE public.players
  SET level = calculate_level.level
  FROM public.calculate_level_from_xp(players.total_xp) AS calculate_level
  WHERE players.uuid = players.uuid;
  
END;
$$;

-- Create trigger to award XP when achievements are unlocked
DROP TRIGGER IF EXISTS award_xp_on_achievement ON public.unlocked_achievements;
CREATE TRIGGER award_xp_on_achievement
  AFTER INSERT ON public.unlocked_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.award_achievement_xp();
