-- Update town level definitions to reduce XP requirements by 50%
UPDATE public.town_level_definitions 
SET xp_required = xp_required / 2
WHERE level > 1;

-- Add balance achievements to town achievement definitions
INSERT INTO public.town_achievement_definitions (id, name, description, stat) VALUES
('balance', 'Town Wealth', 'Accumulate wealth in your town', 'balance')
ON CONFLICT (id) DO NOTHING;

-- Add balance achievement tiers
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
-- Balance achievements
('balance', 1, 'Small Fortune', 'Reach €500 balance', 500, 100, 'coins', 'from-yellow-500 to-amber-600'),
('balance', 2, 'Growing Wealth', 'Reach €1,000 balance', 1000, 200, 'coins', 'from-yellow-500 to-amber-600'),
('balance', 3, 'Prosperous Town', 'Reach €2,500 balance', 2500, 400, 'coins', 'from-green-500 to-emerald-600'),
('balance', 4, 'Wealthy City', 'Reach €5,000 balance', 5000, 600, 'coins', 'from-blue-500 to-cyan-600'),
('balance', 5, 'Rich Metropolis', 'Reach €10,000 balance', 10000, 800, 'coins', 'from-purple-500 to-violet-600'),
('balance', 6, 'Imperial Treasury', 'Reach €25,000 balance', 25000, 1200, 'coins', 'from-orange-500 to-amber-600'),
('balance', 7, 'Legendary Wealth', 'Reach €50,000 balance', 50000, 2000, 'coins', 'from-red-500 to-pink-600')
ON CONFLICT (achievement_id, tier) DO NOTHING;

-- Add 2-year age tier
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
('age', 5, 'Century Town', 'Town exists for 730 days (2 years)', 730, 2000, 'calendar', 'from-red-500 to-pink-600')
ON CONFLICT (achievement_id, tier) DO NOTHING;

-- Add balance column to towns table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'towns' AND column_name = 'balance') THEN
    ALTER TABLE public.towns ADD COLUMN balance NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Update the sync function to include balance calculations
CREATE OR REPLACE FUNCTION public.sync_all_town_achievements()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  town_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  town_stat_value NUMERIC;
  highest_tier_id UUID;
  existing_achievement_count INTEGER;
  town_age_days INTEGER;
  is_active_days INTEGER;
BEGIN
  -- Loop through all towns with explicit field selection
  FOR town_record IN SELECT id, name, population, nation_id, is_independent, created_at, balance FROM public.towns LOOP
    -- Loop through all achievement definitions
    FOR achievement_record IN SELECT * FROM public.town_achievement_definitions LOOP
      -- Calculate town-specific stats
      CASE achievement_record.stat
        WHEN 'population' THEN
          town_stat_value := town_record.population;
        WHEN 'nation_member' THEN
          town_stat_value := CASE WHEN town_record.nation_id IS NOT NULL THEN 1 ELSE 0 END;
        WHEN 'independent' THEN
          town_stat_value := CASE WHEN town_record.is_independent THEN 1 ELSE 0 END;
        WHEN 'capital' THEN
          -- Check if this town is a capital of any nation
          SELECT COUNT(*) INTO town_stat_value
          FROM public.nations
          WHERE capital = town_record.name;
        WHEN 'age' THEN
          -- Calculate town age in days
          town_age_days := EXTRACT(EPOCH FROM (NOW() - town_record.created_at)) / 86400;
          town_stat_value := town_age_days;
        WHEN 'activity' THEN
          -- For now, assume active if population > 0
          town_stat_value := CASE WHEN town_record.population > 0 THEN 1 ELSE 0 END;
        WHEN 'balance' THEN
          -- Use town balance (default to 0 if not set)
          town_stat_value := COALESCE(town_record.balance, 0);
        ELSE
          town_stat_value := 0;
      END CASE;
      
      -- Find the highest tier this town qualifies for
      SELECT tat.id INTO highest_tier_id
      FROM public.town_achievement_tiers tat
      WHERE tat.achievement_id = achievement_record.id
        AND tat.threshold <= town_stat_value
      ORDER BY tat.tier DESC
      LIMIT 1;
      
      -- If town qualifies for a tier, check if they already have it
      IF highest_tier_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.town_unlocked_achievements
        WHERE town_id = town_record.id
          AND tier_id = highest_tier_id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.town_unlocked_achievements (town_id, tier_id)
          VALUES (town_record.id, highest_tier_id);
        END IF;
      END IF;
      
    END LOOP;
  END LOOP;
  
  -- Recalculate all town levels based on their total XP
  UPDATE public.towns
  SET level = (
    SELECT level 
    FROM public.calculate_town_level_from_xp(towns.total_xp) 
    LIMIT 1
  );
  
END;
$$;

-- Run the sync to populate achievements and recalculate levels
SELECT public.sync_all_town_achievements(); 