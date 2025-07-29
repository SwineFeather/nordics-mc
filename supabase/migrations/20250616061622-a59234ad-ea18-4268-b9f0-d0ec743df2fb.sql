
-- Add INSERT policies for the migration to work
CREATE POLICY "Allow public insert access" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.player_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON public.unlocked_achievements FOR INSERT WITH CHECK (true);

-- Add UPDATE policies for the migration to work
CREATE POLICY "Allow public update access" ON public.players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.player_stats FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.unlocked_achievements FOR UPDATE USING (true) WITH CHECK (true);

-- Add DELETE policies for completeness (though not needed for migration)
CREATE POLICY "Allow public delete access" ON public.players FOR DELETE USING (true);
CREATE POLICY "Allow public delete access" ON public.player_stats FOR DELETE USING (true);
CREATE POLICY "Allow public delete access" ON public.unlocked_achievements FOR DELETE USING (true);
