
-- Update the existing function to handle nested JSONB paths
DROP FUNCTION IF EXISTS get_top_players_by_stat(text, integer);
CREATE OR REPLACE FUNCTION public.get_top_players_by_stat(stat_path_param text, limit_count integer DEFAULT 10)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
DECLARE
    path_parts text[];
    category text;
    stat_name text;
BEGIN
    -- Split the stat path (e.g., "custom.play_time" -> ["custom", "play_time"])
    path_parts := string_to_array(stat_path_param, '.');
    
    IF array_length(path_parts, 1) = 2 THEN
        category := path_parts[1];
        stat_name := path_parts[2];
        
        RETURN QUERY
        SELECT 
            p.uuid::text as player_uuid,
            p.name::text as player_name,
            COALESCE((ps.stats->category->>stat_name)::bigint, 0) as stat_value
        FROM players p
        JOIN player_stats ps ON p.uuid = ps.player_uuid
        WHERE ps.stats ? category 
          AND ps.stats->category ? stat_name
          AND (ps.stats->category->>stat_name)::bigint > 0
        ORDER BY (ps.stats->category->>stat_name)::bigint DESC
        LIMIT limit_count;
    ELSE
        -- Handle legacy flat structure or invalid paths
        RETURN QUERY
        SELECT 
            p.uuid::text as player_uuid,
            p.name::text as player_name,
            COALESCE((ps.stats->>stat_path_param)::bigint, 0) as stat_value
        FROM players p
        JOIN player_stats ps ON p.uuid = ps.player_uuid
        WHERE ps.stats ? stat_path_param
          AND (ps.stats->>stat_path_param)::bigint > 0
        ORDER BY (ps.stats->>stat_path_param)::bigint DESC
        LIMIT limit_count;
    END IF;
END;
$function$;

-- Create specialized functions for different stat categories
DROP FUNCTION IF EXISTS get_custom_stat_leaderboard(text, integer);
CREATE OR REPLACE FUNCTION public.get_custom_stat_leaderboard(stat_name_param text, limit_count integer DEFAULT 100)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.uuid::text as player_uuid,
        p.name::text as player_name,
        COALESCE((ps.stats->'custom'->>stat_name_param)::bigint, 0) as stat_value
    FROM players p
    JOIN player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats ? 'custom' 
      AND ps.stats->'custom' ? stat_name_param
      AND (ps.stats->'custom'->>stat_name_param)::bigint > 0
    ORDER BY (ps.stats->'custom'->>stat_name_param)::bigint DESC
    LIMIT limit_count;
END;
$function$;

DROP FUNCTION IF EXISTS get_mining_stat_leaderboard(text, integer);
CREATE OR REPLACE FUNCTION public.get_mining_stat_leaderboard(stat_name_param text, limit_count integer DEFAULT 100)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.uuid::text as player_uuid,
        p.name::text as player_name,
        COALESCE((ps.stats->'mined'->>stat_name_param)::bigint, 0) as stat_value
    FROM players p
    JOIN player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats ? 'mined' 
      AND ps.stats->'mined' ? stat_name_param
      AND (ps.stats->'mined'->>stat_name_param)::bigint > 0
    ORDER BY (ps.stats->'mined'->>stat_name_param)::bigint DESC
    LIMIT limit_count;
END;
$function$;

DROP FUNCTION IF EXISTS get_combat_stat_leaderboard(text, integer);
CREATE OR REPLACE FUNCTION public.get_combat_stat_leaderboard(stat_name_param text, limit_count integer DEFAULT 100)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.uuid::text as player_uuid,
        p.name::text as player_name,
        COALESCE((ps.stats->'killed'->>stat_name_param)::bigint, 0) as stat_value
    FROM players p
    JOIN player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats ? 'killed' 
      AND ps.stats->'killed' ? stat_name_param
      AND (ps.stats->'killed'->>stat_name_param)::bigint > 0
    ORDER BY (ps.stats->'killed'->>stat_name_param)::bigint DESC
    LIMIT limit_count;
END;
$function$;

DROP FUNCTION IF EXISTS get_crafting_stat_leaderboard(text, integer);
CREATE OR REPLACE FUNCTION public.get_crafting_stat_leaderboard(stat_name_param text, limit_count integer DEFAULT 100)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.uuid::text as player_uuid,
        p.name::text as player_name,
        COALESCE((ps.stats->'crafted'->>stat_name_param)::bigint, 0) as stat_value
    FROM players p
    JOIN player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats ? 'crafted' 
      AND ps.stats->'crafted' ? stat_name_param
      AND (ps.stats->'crafted'->>stat_name_param)::bigint > 0
    ORDER BY (ps.stats->'crafted'->>stat_name_param)::bigint DESC
    LIMIT limit_count;
END;
$function$;

-- Create a general purpose function that can handle any category
DROP FUNCTION IF EXISTS get_stat_by_category(text, text, integer);
CREATE OR REPLACE FUNCTION public.get_stat_by_category(category_param text, stat_name_param text, limit_count integer DEFAULT 100)
RETURNS TABLE(player_uuid text, player_name text, stat_value bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    EXECUTE format('
        SELECT 
            p.uuid::text as player_uuid,
            p.name::text as player_name,
            COALESCE((ps.stats->%L->>%L)::bigint, 0) as stat_value
        FROM players p
        JOIN player_stats ps ON p.uuid = ps.player_uuid
        WHERE ps.stats ? %L 
          AND ps.stats->%L ? %L
          AND (ps.stats->%L->>%L)::bigint > 0
        ORDER BY (ps.stats->%L->>%L)::bigint DESC
        LIMIT %L',
        category_param, stat_name_param, 
        category_param, category_param, stat_name_param,
        category_param, stat_name_param,
        category_param, stat_name_param,
        limit_count
    );
END;
$function$;
