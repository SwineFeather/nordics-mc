-- Add hierarchical and customization fields to wiki_categories
ALTER TABLE wiki_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES wiki_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_expanded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subcategory_count INTEGER DEFAULT 0;

-- Add hierarchical and customization fields to wiki_pages
ALTER TABLE wiki_pages 
ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES wiki_pages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_expanded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_editing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_categories_parent_id ON wiki_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_depth ON wiki_categories(depth);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_parent_page_id ON wiki_pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_depth ON wiki_pages(depth);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_tags ON wiki_pages USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_keywords ON wiki_pages USING GIN(keywords);

-- Update existing categories to have proper depth calculation
UPDATE wiki_categories SET depth = 0 WHERE parent_id IS NULL;

-- Function to calculate depth recursively
CREATE OR REPLACE FUNCTION calculate_category_depth()
RETURNS void AS $$
DECLARE
    cat RECORD;
    parent_depth INTEGER;
BEGIN
    FOR cat IN SELECT id, parent_id FROM wiki_categories WHERE parent_id IS NOT NULL LOOP
        SELECT depth INTO parent_depth FROM wiki_categories WHERE id = cat.parent_id;
        UPDATE wiki_categories SET depth = parent_depth + 1 WHERE id = cat.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate page depth recursively
CREATE OR REPLACE FUNCTION calculate_page_depth()
RETURNS void AS $$
DECLARE
    page RECORD;
    parent_depth INTEGER;
BEGIN
    FOR page IN SELECT id, parent_page_id FROM wiki_pages WHERE parent_page_id IS NOT NULL LOOP
        SELECT depth INTO parent_depth FROM wiki_pages WHERE id = page.parent_page_id;
        UPDATE wiki_pages SET depth = parent_depth + 1 WHERE id = page.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update category counts
CREATE OR REPLACE FUNCTION update_category_counts()
RETURNS void AS $$
DECLARE
    cat RECORD;
BEGIN
    FOR cat IN SELECT id FROM wiki_categories LOOP
        UPDATE wiki_categories 
        SET 
            page_count = (SELECT COUNT(*) FROM wiki_pages WHERE category_id = cat.id),
            subcategory_count = (SELECT COUNT(*) FROM wiki_categories WHERE parent_id = cat.id)
        WHERE id = cat.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the functions to update existing data
SELECT calculate_category_depth();
SELECT calculate_page_depth();
SELECT update_category_counts();

-- Create trigger to automatically update depth when parent changes
CREATE OR REPLACE FUNCTION update_category_depth_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.depth = 0;
    ELSE
        SELECT depth + 1 INTO NEW.depth FROM wiki_categories WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_depth
    BEFORE INSERT OR UPDATE ON wiki_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_depth_trigger();

-- Create trigger to automatically update page depth when parent changes
CREATE OR REPLACE FUNCTION update_page_depth_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_page_id IS NULL THEN
        NEW.depth = 0;
    ELSE
        SELECT depth + 1 INTO NEW.depth FROM wiki_pages WHERE id = NEW.parent_page_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_page_depth
    BEFORE INSERT OR UPDATE ON wiki_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_page_depth_trigger();

-- Create trigger to update category counts when pages change
CREATE OR REPLACE FUNCTION update_category_page_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE wiki_categories 
        SET page_count = page_count + 1 
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE wiki_categories 
        SET page_count = page_count - 1 
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
        UPDATE wiki_categories 
        SET page_count = page_count - 1 
        WHERE id = OLD.category_id;
        UPDATE wiki_categories 
        SET page_count = page_count + 1 
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_page_count
    AFTER INSERT OR DELETE OR UPDATE ON wiki_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_category_page_count_trigger();

-- Create trigger to update category subcategory count when categories change
CREATE OR REPLACE FUNCTION update_category_subcategory_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE wiki_categories 
        SET subcategory_count = subcategory_count + 1 
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE wiki_categories 
        SET subcategory_count = subcategory_count - 1 
        WHERE id = OLD.parent_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.parent_id != OLD.parent_id THEN
        UPDATE wiki_categories 
        SET subcategory_count = subcategory_count - 1 
        WHERE id = OLD.parent_id;
        UPDATE wiki_categories 
        SET subcategory_count = subcategory_count + 1 
        WHERE id = NEW.parent_id;
        RETURN NEW;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_subcategory_count
    AFTER INSERT OR DELETE OR UPDATE ON wiki_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_subcategory_count_trigger(); 