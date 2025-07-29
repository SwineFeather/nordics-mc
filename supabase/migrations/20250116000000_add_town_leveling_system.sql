-- Create town level definitions table for configurable town progression
CREATE TABLE IF NOT EXISTS public.town_level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required BIGINT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create town achievements definitions table
CREATE TABLE IF NOT EXISTS public.town_achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stat TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create town achievement tiers table
CREATE TABLE IF NOT EXISTS public.town_achievement_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id TEXT REFERENCES public.town_achievement_definitions(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT 'trophy',
  color TEXT DEFAULT 'from-blue-500 to-purple-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(achievement_id, tier)
);

-- Create town unlocked achievements table with flexible town_id type
CREATE TABLE IF NOT EXISTS public.town_unlocked_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id TEXT NOT NULL, -- Use TEXT to handle both UUID and INTEGER
  tier_id UUID NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  is_claimed BOOLEAN DEFAULT false,
  UNIQUE(town_id, tier_id)
);

-- Add foreign key constraint for tier_id
ALTER TABLE public.town_unlocked_achievements 
ADD CONSTRAINT fk_town_unlocked_achievements_tier_id 
FOREIGN KEY (tier_id) REFERENCES public.town_achievement_tiers(id) ON DELETE CASCADE;

-- Add level and XP columns to towns table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'towns' AND column_name = 'level') THEN
    ALTER TABLE public.towns ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'towns' AND column_name = 'total_xp') THEN
    ALTER TABLE public.towns ADD COLUMN total_xp BIGINT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.town_level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_unlocked_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view town level definitions" ON public.town_level_definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view town achievement definitions" ON public.town_achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view town achievement tiers" ON public.town_achievement_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view town unlocked achievements" ON public.town_unlocked_achievements FOR SELECT USING (true);

-- Staff can manage town achievements and levels
CREATE POLICY "Staff can manage town level definitions" ON public.town_level_definitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Staff can manage town achievement definitions" ON public.town_achievement_definitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Staff can manage town achievement tiers" ON public.town_achievement_tiers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Staff can manage town unlocked achievements" ON public.town_unlocked_achievements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Insert town level definitions (similar to player levels but themed for towns)
INSERT INTO public.town_level_definitions (level, xp_required, title, description, color) VALUES
(1, 0, 'Settlement', 'A small gathering of people', '#10b981'),
(2, 100, 'Hamlet', 'Growing into a proper community', '#10b981'),
(3, 250, 'Village', 'A thriving small settlement', '#10b981'),
(4, 500, 'Town', 'A bustling center of activity', '#3b82f6'),
(5, 1000, 'City', 'A major urban center', '#3b82f6'),
(6, 1750, 'Metropolis', 'A grand city of great importance', '#8b5cf6'),
(7, 2750, 'Capital', 'A city of national significance', '#8b5cf6'),
(8, 4000, 'Empire City', 'A city of imperial might', '#f59e0b'),
(9, 6000, 'Legendary City', 'A city of legends', '#f59e0b'),
(10, 8500, 'Mythical Metropolis', 'A city of mythical proportions', '#ef4444'),
(11, 12000, 'Divine City', 'A city touched by the divine', '#ef4444'),
(12, 16500, 'Transcendent City', 'A city beyond mortal understanding', '#ec4899'),
(13, 22500, 'Cosmic City', 'A city of cosmic significance', '#ec4899'),
(14, 30000, 'Eternal City', 'A city that will last forever', '#6366f1'),
(15, 40000, 'Omnipotent City', 'The ultimate city', '#dc2626');

-- Insert town achievement definitions
INSERT INTO public.town_achievement_definitions (id, name, description, stat) VALUES
('population', 'Population Growth', 'Grow your town population', 'population'),
('nation_member', 'Nation Member', 'Join a nation', 'nation_member'),
('independent', 'Independent Spirit', 'Remain independent', 'independent'),
('capital', 'Capital Status', 'Become a nation capital', 'capital'),
('age', 'Town Age', 'Survive and thrive over time', 'age'),
('activity', 'Town Activity', 'Maintain active status', 'activity');

-- Insert town achievement tiers
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
-- Population Growth achievements
('population', 1, 'Small Settlement', 'Reach 3 residents', 3, 50, 'users', 'from-green-500 to-emerald-600'),
('population', 2, 'Growing Community', 'Reach 5 residents', 5, 100, 'users', 'from-green-500 to-emerald-600'),
('population', 3, 'Thriving Town', 'Reach 10 residents', 10, 200, 'users', 'from-green-500 to-emerald-600'),
('population', 4, 'Bustling City', 'Reach 15 residents', 15, 350, 'users', 'from-blue-500 to-cyan-600'),
('population', 5, 'Major Metropolis', 'Reach 20 residents', 20, 500, 'users', 'from-blue-500 to-cyan-600'),
('population', 6, 'Grand Capital', 'Reach 30 residents', 30, 750, 'users', 'from-purple-500 to-violet-600'),
('population', 7, 'Imperial City', 'Reach 40 residents', 40, 1000, 'users', 'from-orange-500 to-amber-600'),
('population', 8, 'Legendary Metropolis', 'Reach 50 residents', 50, 1500, 'users', 'from-red-500 to-pink-600'),

-- Nation Member achievements
('nation_member', 1, 'Alliance Forged', 'Join a nation', 1, 200, 'flag', 'from-blue-500 to-indigo-600'),

-- Independent Spirit achievements
('independent', 1, 'Independent Spirit', 'Remain independent for 30 days', 30, 150, 'shield', 'from-gray-500 to-slate-600'),

-- Capital Status achievements
('capital', 1, 'Capital City', 'Become a nation capital', 1, 500, 'crown', 'from-yellow-500 to-amber-600'),

-- Town Age achievements
('age', 1, 'Established', 'Town exists for 30 days', 30, 100, 'calendar', 'from-green-500 to-emerald-600'),
('age', 2, 'Veteran', 'Town exists for 90 days', 90, 250, 'calendar', 'from-blue-500 to-cyan-600'),
('age', 3, 'Ancient', 'Town exists for 180 days', 180, 500, 'calendar', 'from-purple-500 to-violet-600'),
('age', 4, 'Timeless', 'Town exists for 365 days', 365, 1000, 'calendar', 'from-orange-500 to-amber-600'),

-- Town Activity achievements
('activity', 1, 'Active Community', 'Maintain active status for 7 days', 7, 50, 'activity', 'from-green-500 to-emerald-600'),
('activity', 2, 'Thriving Hub', 'Maintain active status for 30 days', 30, 150, 'activity', 'from-blue-500 to-cyan-600'),
('activity', 3, 'Eternal Flame', 'Maintain active status for 90 days', 90, 300, 'activity', 'from-purple-500 to-violet-600');

-- Create function to calculate town level from XP
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
BEGIN
  -- Find the highest level the town has reached
  SELECT tld.level, tld.xp_required
  INTO current_level, current_level_xp
  FROM public.town_level_definitions tld
  WHERE tld.xp_required <= town_xp
  ORDER BY tld.level DESC
  LIMIT 1;
  
  -- Get XP required for next level
  SELECT tld.xp_required
  INTO next_level_xp
  FROM public.town_level_definitions tld
  WHERE tld.level = current_level + 1;
  
  -- If no next level exists, use current level XP + 100000
  IF next_level_xp IS NULL THEN
    next_level_xp := current_level_xp + 100000;
  END IF;
  
  -- Return the calculated values
  RETURN QUERY SELECT 
    current_level,
    town_xp - current_level_xp,
    next_level_xp - current_level_xp,
    CASE 
      WHEN next_level_xp - current_level_xp > 0 
      THEN ROUND(((town_xp - current_level_xp) * 100.0) / (next_level_xp - current_level_xp), 2)
      ELSE 100.0
    END;
END;
$$;

-- Create function to claim town achievement and award XP
CREATE OR REPLACE FUNCTION public.claim_town_achievement(
  p_town_id UUID,
  p_tier_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  xp_amount INTEGER;
  new_total_xp BIGINT;
  calculated_level INTEGER;
  achievement_name TEXT;
  tier_name TEXT;
BEGIN
  -- Check if achievement exists and is not already claimed
  SELECT COUNT(*) INTO xp_amount
  FROM public.town_unlocked_achievements
  WHERE town_id = p_town_id 
    AND tier_id = p_tier_id 
    AND (is_claimed = false OR is_claimed IS NULL);
  
  IF xp_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Achievement not found or already claimed');
  END IF;
  
  -- Get the XP points and achievement info
  SELECT tat.points, tad.name, tat.name
  INTO xp_amount, achievement_name, tier_name
  FROM public.town_achievement_tiers tat
  JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
  WHERE tat.id = p_tier_id;
  
  -- Mark achievement as claimed
  UPDATE public.town_unlocked_achievements
  SET is_claimed = true, claimed_at = NOW()
  WHERE town_id = p_town_id AND tier_id = p_tier_id;
  
  -- Update town's total XP
  UPDATE public.towns
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE id = p_town_id
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_town_level_from_xp(new_total_xp);
  
  -- Update town's level
  UPDATE public.towns
  SET level = calculated_level
  WHERE id = p_town_id;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', xp_amount,
    'new_total_xp', new_total_xp,
    'new_level', calculated_level,
    'achievement_name', achievement_name,
    'tier_name', tier_name
  );
END;
$$;

-- Create function to sync all town achievements and recalculate XP/levels
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
  -- Loop through all towns
  FOR town_record IN SELECT * FROM public.towns LOOP
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

-- Create indexes for better performance
CREATE INDEX idx_town_level_definitions_level ON public.town_level_definitions(level);
CREATE INDEX idx_town_achievement_tiers_achievement_id ON public.town_achievement_tiers(achievement_id);
CREATE INDEX idx_town_unlocked_achievements_town_id ON public.town_unlocked_achievements(town_id);
CREATE INDEX idx_town_unlocked_achievements_tier_id ON public.town_unlocked_achievements(tier_id);
CREATE INDEX idx_towns_level ON public.towns(level);
CREATE INDEX idx_towns_total_xp ON public.towns(total_xp);

-- Initial sync of town achievements
SELECT public.sync_all_town_achievements(); 