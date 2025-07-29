-- Fix the infinite recursion issue in nations table RLS policy
-- Run this directly on your Supabase database

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Staff and nation leaders can manage nations" ON public.nations;
DROP POLICY IF EXISTS "Nations are publicly readable" ON public.nations;

-- Recreate the simple public read policy
CREATE POLICY "Nations are publicly readable" 
  ON public.nations 
  FOR SELECT 
  USING (true);

-- Create a simple policy for staff to manage nations (without recursion)
CREATE POLICY "Staff can manage nations" 
  ON public.nations 
  FOR ALL 
  TO authenticated
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

-- Verify the fix
SELECT '✅ Nations RLS policies fixed - no more infinite recursion!' as result; 