
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'editor', 'member');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki categories table
CREATE TABLE public.wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki pages table
CREATE TABLE public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  category_id UUID REFERENCES public.wiki_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create page revisions table for history
CREATE TABLE public.page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revision_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create site settings table for admin-editable content
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has specific role or higher
CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role app_role)
RETURNS BOOLEAN AS $$
  SELECT CASE 
    WHEN get_current_user_role() = 'admin' THEN true
    WHEN get_current_user_role() = 'moderator' AND required_role IN ('moderator', 'editor', 'member') THEN true
    WHEN get_current_user_role() = 'editor' AND required_role IN ('editor', 'member') THEN true
    WHEN get_current_user_role() = 'member' AND required_role = 'member' THEN true
    ELSE false
  END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (has_role_or_higher('admin'));
CREATE POLICY "Only admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (has_role_or_higher('admin'));

-- Wiki categories policies
CREATE POLICY "Anyone can view published categories" ON public.wiki_categories FOR SELECT USING (true);
CREATE POLICY "Moderators can manage categories" ON public.wiki_categories FOR ALL TO authenticated USING (has_role_or_higher('moderator'));

-- Wiki pages policies
CREATE POLICY "Anyone can view published pages" ON public.wiki_pages FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Editors can create pages" ON public.wiki_pages FOR INSERT TO authenticated WITH CHECK (has_role_or_higher('editor'));
CREATE POLICY "Authors can edit own pages" ON public.wiki_pages FOR UPDATE TO authenticated USING (author_id = auth.uid() OR has_role_or_higher('moderator'));
CREATE POLICY "Moderators can delete pages" ON public.wiki_pages FOR DELETE TO authenticated USING (has_role_or_higher('moderator'));

-- Page revisions policies
CREATE POLICY "Anyone can view revisions of accessible pages" ON public.page_revisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create revisions" ON public.page_revisions FOR INSERT TO authenticated WITH CHECK (true);

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (has_role_or_higher('admin'));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update page revisions
CREATE OR REPLACE FUNCTION public.create_page_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revision if content actually changed
  IF OLD.title != NEW.title OR OLD.content != NEW.content THEN
    INSERT INTO public.page_revisions (page_id, title, content, author_id, revision_note)
    VALUES (NEW.id, OLD.title, OLD.content, OLD.author_id, 'Auto-saved revision');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for page revisions
DROP TRIGGER IF EXISTS on_page_updated ON public.wiki_pages;
CREATE TRIGGER on_page_updated
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW EXECUTE FUNCTION public.create_page_revision();

-- Insert default categories and pages
INSERT INTO public.wiki_categories (id, title, slug, description, order_index) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Getting Started', 'getting-started', 'Everything you need to know to begin your journey', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Lore & History', 'lore-history', 'The rich history and mythology of our world', 2);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('server_info', '{"ip": "nordics.world", "discord": "discord.gg/nordics", "description": "The Nordics Minecraft server is a Towny-survival with a vibrant economy and a custom map based on Northern Europe, featuring additional continents. Establish your town or kingdom and explore our server & community!"}'),
  ('nations', '["Constellation", "North Sea League", "Kesko Corporation", "Aqua Union", "Skyward Sanctum"]'),
  ('hero_title', '"Welcome to Nordics"'),
  ('hero_subtitle', '"The Nordic Realm Awaits"');

-- Enable realtime for collaborative editing
ALTER PUBLICATION supabase_realtime ADD TABLE public.wiki_pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_revisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
