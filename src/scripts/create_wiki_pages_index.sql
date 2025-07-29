-- Create table for indexing wiki and ai-docs markdown files
CREATE TABLE IF NOT EXISTS wiki_pages_index (
  id serial PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  path text NOT NULL UNIQUE,
  bucket text NOT NULL,
  type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookup by slug
CREATE INDEX IF NOT EXISTS idx_wiki_pages_index_slug ON wiki_pages_index (slug);
-- Index for fast lookup by path
CREATE INDEX IF NOT EXISTS idx_wiki_pages_index_path ON wiki_pages_index (path); 