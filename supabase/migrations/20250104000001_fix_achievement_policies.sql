-- Fix for existing achievement policies
-- This migration handles the case where policies already exist from previous migrations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.achievement_definitions;
DROP POLICY IF EXISTS "Allow public read access" ON public.achievement_tiers;
DROP POLICY IF EXISTS "Allow public read access" ON public.level_definitions;
DROP POLICY IF EXISTS "Allow public read access" ON public.unlocked_achievements;
DROP POLICY IF EXISTS "Allow users to insert their own achievements" ON public.unlocked_achievements;
DROP POLICY IF EXISTS "Allow users to update their own achievements" ON public.unlocked_achievements;

-- Recreate policies
CREATE POLICY "Allow public read access" ON public.achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.achievement_tiers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.level_definitions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.unlocked_achievements FOR SELECT USING (true);

-- Create policies for authenticated users to insert their own achievements
CREATE POLICY "Allow users to insert their own achievements" ON public.unlocked_achievements 
FOR INSERT WITH CHECK (auth.uid()::text = player_uuid);

-- Create policies for authenticated users to update their own achievements
CREATE POLICY "Allow users to update their own achievements" ON public.unlocked_achievements 
FOR UPDATE USING (auth.uid()::text = player_uuid); 