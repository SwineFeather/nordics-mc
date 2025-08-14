-- Create company ratings table for user reviews and ratings
-- Migration: 20250131000002_create_company_ratings.sql

-- Create company_ratings table
CREATE TABLE IF NOT EXISTS public.company_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT company_ratings_pkey PRIMARY KEY (id),
    CONSTRAINT company_ratings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT company_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT company_ratings_unique_user_company UNIQUE (company_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_ratings_company_id ON public.company_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_user_id ON public.company_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_rating ON public.company_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_company_ratings_created_at ON public.company_ratings(created_at DESC);

-- Add comments
COMMENT ON TABLE public.company_ratings IS 'User ratings and reviews for companies';
COMMENT ON COLUMN public.company_ratings.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.company_ratings.username IS 'Public username of the reviewer';
COMMENT ON COLUMN public.company_ratings.comment IS 'Review comment from the user';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_company_ratings_updated_at
    BEFORE UPDATE ON public.company_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_company_ratings_updated_at();

-- Enable Row Level Security
ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all ratings
CREATE POLICY "Users can view all company ratings" ON public.company_ratings
    FOR SELECT USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings" ON public.company_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings" ON public.company_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings" ON public.company_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Log the creation
DO $$
BEGIN
    RAISE NOTICE 'Created company_ratings table with RLS policies';
END $$;

