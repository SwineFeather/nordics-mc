
-- Drop the existing policy that restricts viewing to own profile
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- Allow admins to manage all profiles (keeping this if it exists and is desired)
-- If this policy was not in your 20250610 migration, you can omit this DROP/CREATE
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (get_current_user_role() = 'admin') -- Uses your existing get_current_user_role() function
  WITH CHECK (get_current_user_role() = 'admin');

-- Add a new policy to allow any authenticated user to read all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
