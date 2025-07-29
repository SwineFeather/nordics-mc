-- Create level definitions table for configurable player progression
CREATE TABLE public.level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required BIGINT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.level_definitions ENABLE ROW LEVEL SECURITY;

-- RLS policies for level definitions
CREATE POLICY "Anyone can view level definitions" ON public.level_definitions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage level definitions" ON public.level_definitions
  FOR ALL USING (has_role_or_higher('admin'));

-- Insert default level definitions
INSERT INTO public.level_definitions (level, xp_required, title, description, color) VALUES
  (1, 0, 'Newcomer', 'Welcome to the server!', '#10b981'),
  (2, 100, 'Novice', 'You''re getting started', '#10b981'),
  (3, 250, 'Apprentice', 'Learning the ropes', '#10b981'),
  (4, 500, 'Journeyman', 'Making progress', '#3b82f6'),
  (5, 1000, 'Adventurer', 'Ready for challenges', '#3b82f6'),
  (6, 1750, 'Explorer', 'Discovering new things', '#3b82f6'),
  (7, 2750, 'Veteran', 'Experienced player', '#8b5cf6'),
  (8, 4000, 'Expert', 'Skilled in many areas', '#8b5cf6'),
  (9, 6000, 'Master', 'Exceptional abilities', '#f59e0b'),
  (10, 8500, 'Champion', 'Among the best', '#f59e0b'),
  (11, 12000, 'Legend', 'Legendary status achieved', '#ef4444'),
  (12, 16500, 'Mythic', 'Mythical powers unlocked', '#ef4444'),
  (13, 22500, 'Ascended', 'Beyond mortal limits', '#ec4899'),
  (14, 30000, 'Divine', 'Divine essence attained', '#ec4899'),
  (15, 40000, 'Transcendent', 'Transcended all boundaries', '#6366f1');

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(player_xp BIGINT)
RETURNS TABLE(level INTEGER, xp_in_current_level BIGINT, xp_for_next_level BIGINT, progress NUMERIC)
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

-- Trigger function to award XP when achievements are unlocked
CREATE OR REPLACE FUNCTION public.award_achievement_xp()
RETURNS TRIGGER
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

-- Create trigger for automatic XP awarding
DROP TRIGGER IF EXISTS trigger_award_achievement_xp ON public.unlocked_achievements;
CREATE TRIGGER trigger_award_achievement_xp
  AFTER INSERT ON public.unlocked_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.award_achievement_xp();

-- Function to sync all achievements and recalculate XP/levels
CREATE OR REPLACE FUNCTION public.sync_all_achievements()
RETURNS VOID
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
  SET level = (
    SELECT level 
    FROM public.calculate_level_from_xp(players.total_xp) 
    LIMIT 1
  );
  
END;
$$;