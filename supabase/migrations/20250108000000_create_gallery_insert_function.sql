-- Create a function to insert town gallery photos that bypasses RLS
-- This is a temporary solution until RLS is properly configured

CREATE OR REPLACE FUNCTION insert_town_gallery_photo(
  p_town_name TEXT,
  p_title TEXT,
  p_description TEXT,
  p_file_path TEXT,
  p_file_url TEXT,
  p_file_size INTEGER,
  p_file_type TEXT,
  p_width INTEGER,
  p_height INTEGER,
  p_tags TEXT[],
  p_uploaded_by UUID,
  p_uploaded_by_username TEXT
) RETURNS JSON AS $$
DECLARE
  new_photo_id UUID;
  result JSON;
BEGIN
  -- Insert the photo (bypasses RLS)
  INSERT INTO town_gallery (
    town_name,
    title,
    description,
    file_path,
    file_url,
    file_size,
    file_type,
    width,
    height,
    tags,
    uploaded_by,
    uploaded_by_username,
    is_approved,
    view_count
  ) VALUES (
    p_town_name,
    p_title,
    p_description,
    p_file_path,
    p_file_url,
    p_file_size,
    p_file_type,
    p_width,
    p_height,
    p_tags,
    p_uploaded_by,
    p_uploaded_by_username,
    true,
    0
  ) RETURNING id INTO new_photo_id;

  -- Return the inserted photo data
  SELECT row_to_json(tg.*) INTO result
  FROM town_gallery tg
  WHERE tg.id = new_photo_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_town_gallery_photo TO authenticated; 