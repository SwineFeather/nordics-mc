-- Add visibility fields to wiki tables for SUMMARY.md sync
ALTER TABLE wiki_categories 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

ALTER TABLE wiki_pages 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create indexes for better performance on visibility queries
CREATE INDEX IF NOT EXISTS idx_wiki_categories_visible ON wiki_categories(is_visible);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_visible ON wiki_pages(is_visible);

-- Update existing records to be visible by default
UPDATE wiki_categories SET is_visible = true WHERE is_visible IS NULL;
UPDATE wiki_pages SET is_visible = true WHERE is_visible IS NULL; 