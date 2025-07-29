-- SQL for Nordics AI Knowledgebase Table and Initial Data

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.ai_knowledgebase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  section text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Insert knowledgebase entries
INSERT INTO public.ai_knowledgebase (title, section, content, tags) VALUES

-- Overview
('Overview', 'Instructions',
'Thor the Bot (the Nordics AI) has full read access to the Supabase storage wiki bucket only. Thor the Bot can read the following Supabase tables and views, but must not access any other tables or sensitive columns. For each table, a description is provided to help Thor quickly find the right information for user questions. Use this document as a reference for answering questions about the Nordics Minecraft server, its achievements, towns, nations, companies, forums, and player stats.',
ARRAY['overview']),

-- Storage
('wiki bucket', 'Storage',
'Contains wiki pages and documents for the Nordics community. Use this for in-depth guides, rules, and player-written content.',
ARRAY['wiki', 'storage']),

-- award_leaderboard
('award_leaderboard', 'Supabase Table',
'Shows the top players for each award, including their points, medals, and rank. Use this to answer questions about who leads in specific awards or achievements.',
ARRAY['award', 'leaderboard']),

-- achievement_tiers
('achievement_tiers', 'Supabase Table',
'Lists the different tiers for each achievement, including thresholds, names, descriptions, and points. Use this to explain what is required for each achievement tier.',
ARRAY['achievement', 'tiers']),

-- achievement_definitions
('achievement_definitions', 'Supabase Table',
'Defines all achievements, their names, descriptions, and the stat they track. Use this to explain what achievements exist and what they mean.',
ARRAY['achievement', 'definitions']),

-- companies
('companies', 'Supabase Table',
'Contains information about player-created companies, including name, description, members, revenue, and more. Use this to answer questions about companies, their stats, and their members. Do not access sensitive columns like emails.',
ARRAY['companies', 'business', 'members']),

-- forum_categories
('forum_categories', 'Supabase Table',
'Lists all forum categories, their names, descriptions, and organization. Use this to help users find the right forum section.',
ARRAY['forum', 'categories']),

-- forum_posts
('forum_posts', 'Supabase Table',
'Contains forum posts, including title, content, author, and category. Use this to answer questions about forum discussions, but do not access sensitive author information.',
ARRAY['forum', 'posts']),

-- level_definitions
('level_definitions', 'Supabase Table',
'Defines player and town levels, including XP required and level titles. Use this to explain leveling systems.',
ARRAY['level', 'xp', 'definitions']),

-- nations
('nations', 'Supabase Table',
'Contains all nations on the server, including their name, leader, capital, and balance. Use this to answer questions about nations, their leaders, and their balances. Users may ask about nation balances.',
ARRAY['nations', 'balance', 'leaders']),

-- towns
('towns', 'Supabase Table',
'Contains all towns on the server, including name, mayor, balance, location, and residents. Use this to answer questions about towns, their balances, and their mayors. Users may ask about town balances.',
ARRAY['towns', 'balance', 'mayor', 'residents']),

-- trail_paths
('trail_paths', 'Supabase Table',
'Lists paths and trails around the world, with descriptions of where they go. Use this to help users find or learn about trails.',
ARRAY['trails', 'paths', 'world']),

-- player_stats
('player_stats', 'Supabase Table',
'Contains player statistics in JSON format. Use this to answer questions about individual player stats.',
ARRAY['player', 'stats']),

-- players
('players', 'Supabase Table',
'Contains basic player info, including name, level, and XP. Use this to answer questions about players, but do not access sensitive data.',
ARRAY['players', 'level', 'xp']),

-- residents
('residents', 'Supabase Table',
'Contains information about residents, their town/nation, roles, and balances. Use this to answer questions about residents, their roles, and their balances.',
ARRAY['residents', 'town', 'nation', 'balance']),

-- shops
('shops', 'Supabase Table',
'Contains information about player shops, including items for sale, prices, and owners. Use this to answer questions about shops and the marketplace.',
ARRAY['shops', 'marketplace', 'items']),

-- town_unlocked_achievements
('town_unlocked_achievements', 'Supabase Table',
'Tracks which achievements have been unlocked by towns. Use this to answer questions about town achievements.',
ARRAY['town', 'achievements', 'unlocked']),

-- town_level_definitions
('town_level_definitions', 'Supabase Table',
'Defines town levels and XP requirements. Use this to explain how towns level up.',
ARRAY['town', 'level', 'xp']),

-- unlocked_achievements
('unlocked_achievements', 'Supabase Table',
'Tracks which achievements have been unlocked by players. Use this to answer questions about player achievements.',
ARRAY['player', 'achievements', 'unlocked']),

-- player_leaderboard
('player_leaderboard', 'Supabase Table',
'Shows the top players by points and medals. Use this to answer questions about the best players on the server.',
ARRAY['player', 'leaderboard', 'points', 'medals']),

-- Usage Notes
('Usage Notes', 'Instructions',
'Only use the tables and storage listed above. Do not access any other tables or columns not described here. Be quick and efficient in finding information. Use the table descriptions to match user questions to the right data source. If a user asks about something not covered by these tables or the wiki bucket, politely explain that the information is not available.',
ARRAY['usage', 'notes']); 