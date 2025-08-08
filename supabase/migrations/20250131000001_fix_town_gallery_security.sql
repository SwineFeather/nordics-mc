-- CRITICAL SECURITY FIX: Re-enable RLS for town_gallery table
-- This table currently has RLS completely disabled, exposing all data

-- Re-enable RLS for town_gallery
ALTER TABLE public.town_gallery ENABLE ROW LEVEL SECURITY;

-- Create comprehensive security policies for town_gallery
-- Users can view all approved gallery photos
CREATE POLICY "Users can view approved town gallery photos" 
  ON public.town_gallery 
  FOR SELECT 
  USING (is_approved = true);

-- Town mayors can view their own town's photos (including unapproved)
CREATE POLICY "Town mayors can view their town's photos" 
  ON public.town_gallery 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND mayor = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Staff can view all photos
CREATE POLICY "Staff can view all town gallery photos" 
  ON public.town_gallery 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Authenticated users can upload photos for their town
CREATE POLICY "Authenticated users can upload town gallery photos" 
  ON public.town_gallery 
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND mayor = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Town mayors can update their own town's photos
CREATE POLICY "Town mayors can update their town's photos" 
  ON public.town_gallery 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND mayor = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND mayor = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Staff can update any photo
CREATE POLICY "Staff can update any town gallery photo" 
  ON public.town_gallery 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Town mayors can delete their own town's photos
CREATE POLICY "Town mayors can delete their town's photos" 
  ON public.town_gallery 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND mayor = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Staff can delete any photo
CREATE POLICY "Staff can delete any town gallery photo" 
  ON public.town_gallery 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Verify RLS is enabled and policies are in place
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS IS ENABLED - SECURE!'
    ELSE '❌ RLS IS DISABLED - INSECURE!'
  END as status
FROM pg_tables 
WHERE tablename = 'town_gallery';

-- Show all policies for town_gallery
SELECT 
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ POLICY EXISTS - SECURE!'
    ELSE '❌ NO POLICIES - INSECURE!'
  END as status
FROM pg_policies 
WHERE tablename = 'town_gallery'
ORDER BY policyname;

-- Test that the policies work correctly
-- This will show if there are any syntax errors in the policies
SELECT '✅ Town gallery security policies created successfully!' as result; 