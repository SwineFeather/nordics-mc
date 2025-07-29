-- Fix the ambiguous column reference error in calculate_town_level_from_xp function
-- Use table aliases to clearly distinguish between variable and column

DROP FUNCTION IF EXISTS public.calculate_town_level_from_xp(BIGINT);

CREATE OR REPLACE FUNCTION public.calculate_town_level_from_xp(town_xp BIGINT)
RETURNS TABLE (
  level INTEGER,
  xp_in_current_level BIGINT,
  xp_for_next_level BIGINT,
  progress NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_level_num INTEGER := 1;
  current_level_xp BIGINT := 0;
  next_level_xp BIGINT;
  level_def RECORD;
BEGIN
  -- Find the current level
  SELECT * INTO level_def
  FROM public.town_level_definitions tld
  WHERE tld.xp_required <= town_xp
  ORDER BY tld.level DESC
  LIMIT 1;
  
  IF level_def IS NOT NULL THEN
    current_level_num := level_def.level;
    current_level_xp := level_def.xp_required;
  END IF;
  
  -- Find the next level XP requirement
  SELECT tld.xp_required INTO next_level_xp
  FROM public.town_level_definitions tld
  WHERE tld.level = current_level_num + 1
  LIMIT 1;
  
  IF next_level_xp IS NULL THEN
    -- Max level reached
    next_level_xp := current_level_xp + 100000;
  END IF;
  
  RETURN QUERY
  SELECT 
    current_level_num,
    town_xp - current_level_xp,
    next_level_xp - current_level_xp,
    CASE 
      WHEN next_level_xp > current_level_xp THEN 
        LEAST(100.0, ((town_xp - current_level_xp)::NUMERIC / (next_level_xp - current_level_xp)::NUMERIC) * 100.0)
      ELSE 100.0
    END;
END;
$$;

-- Test the function
SELECT 
  'Function fixed successfully' as status,
  level,
  xp_in_current_level,
  xp_for_next_level,
  progress
FROM public.calculate_town_level_from_xp(1000); 