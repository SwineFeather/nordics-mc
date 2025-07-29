-- Sample towns data for testing
-- Run this in your Supabase SQL Editor if the towns table is empty

-- First, ensure the towns table exists with the correct structure
CREATE TABLE IF NOT EXISTS towns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  mayor_uuid VARCHAR(255) NOT NULL,
  mayor_name VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 0,
  world_name VARCHAR(255) DEFAULT 'world',
  location_x INTEGER DEFAULT 0,
  location_z INTEGER DEFAULT 0,
  spawn_x INTEGER DEFAULT 1000,
  spawn_y INTEGER DEFAULT 64,
  spawn_z INTEGER DEFAULT 1000,
  spawn_yaw DECIMAL(5,2) DEFAULT 0,
  spawn_pitch DECIMAL(5,2) DEFAULT 0,
  board TEXT,
  tag VARCHAR(255),
  is_public BOOLEAN DEFAULT true,
  is_open BOOLEAN DEFAULT true,
  max_residents INTEGER DEFAULT 50,
  min_residents INTEGER DEFAULT 1,
  max_plots INTEGER DEFAULT 100,
  min_plots INTEGER DEFAULT 1,
  taxes DECIMAL(5,2) DEFAULT 0,
  plot_tax DECIMAL(5,2) DEFAULT 0,
  shop_tax DECIMAL(5,2) DEFAULT 0,
  embassy_tax DECIMAL(5,2) DEFAULT 0,
  plot_price DECIMAL(15,2) DEFAULT 0,
  nation_id INTEGER,
  nation_name VARCHAR(255),
  nation_uuid VARCHAR(255),
  is_capital BOOLEAN DEFAULT false,
  residents_count INTEGER DEFAULT 0,
  plots_count INTEGER DEFAULT 0,
  home_block_count INTEGER DEFAULT 0,
  shop_plot_count INTEGER DEFAULT 0,
  embassy_plot_count INTEGER DEFAULT 0,
  wild_plot_count INTEGER DEFAULT 0,
  residents JSONB,
  last_activity TIMESTAMP DEFAULT NOW(),
  activity_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(5,2) DEFAULT 0,
  market_value DECIMAL(15,2) DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert sample towns data
INSERT INTO towns (name, mayor_uuid, mayor_name, balance, world_name, location_x, location_z, spawn_x, spawn_y, spawn_z, board, tag, is_public, is_open, max_residents, max_plots, taxes, plot_tax, nation_id, nation_name, is_capital, residents_count, plots_count, level, total_xp, created_at) VALUES
('Garvia', '550e8400-e29b-41d4-a716-446655440001', 'GarviaMayor', 15000.00, 'world', 1000, 1000, 1000, 64, 1000, 'Welcome to Garvia! A peaceful town in the northern regions.', 'Garvia', true, true, 50, 100, 5.00, 2.00, 1, 'Nordic Empire', true, 15, 25, 3, 1500, '2024-01-15 10:00:00'),
('Rivendell', '550e8400-e29b-41d4-a716-446655440002', 'Elrond', 25000.00, 'world', 2000, 2000, 2000, 64, 2000, 'The Last Homely House East of the Sea', 'Rivendell', true, true, 75, 150, 3.00, 1.50, 1, 'Nordic Empire', false, 25, 40, 4, 2500, '2024-02-01 12:00:00'),
('Stormwind', '550e8400-e29b-41d4-a716-446655440003', 'Anduin', 50000.00, 'world', 3000, 3000, 3000, 64, 3000, 'For the Alliance!', 'Stormwind', true, true, 100, 200, 4.00, 2.50, 2, 'Alliance', true, 45, 80, 5, 5000, '2024-01-10 08:00:00'),
('Ironforge', '550e8400-e29b-41d4-a716-446655440004', 'Magni', 35000.00, 'world', 4000, 4000, 4000, 64, 4000, 'Ironforge - City of the Dwarves', 'Ironforge', true, true, 60, 120, 3.50, 2.00, 2, 'Alliance', false, 30, 50, 4, 3000, '2024-02-15 14:00:00'),
('Orgrimmar', '550e8400-e29b-41d4-a716-446655440005', 'Thrall', 40000.00, 'world', 5000, 5000, 5000, 64, 5000, 'Lok-tar ogar!', 'Orgrimmar', true, true, 80, 160, 4.50, 2.75, 3, 'Horde', true, 35, 65, 4, 3500, '2024-01-20 16:00:00'),
('Thunder Bluff', '550e8400-e29b-41d4-a716-446655440006', 'Cairne', 20000.00, 'world', 6000, 6000, 6000, 64, 6000, 'Home of the Tauren people', 'Thunder Bluff', true, true, 40, 80, 2.50, 1.25, 3, 'Horde', false, 20, 35, 3, 2000, '2024-03-01 09:00:00'),
('Dalaran', '550e8400-e29b-41d4-a716-446655440007', 'Jaina', 60000.00, 'world', 7000, 7000, 7000, 64, 7000, 'City of Magic and Learning', 'Dalaran', true, true, 90, 180, 6.00, 3.00, NULL, NULL, false, 50, 90, 6, 6000, '2024-01-05 11:00:00'),
('Shattrath', '550e8400-e29b-41d4-a716-446655440008', 'A''dal', 30000.00, 'world', 8000, 8000, 8000, 64, 8000, 'City of Light', 'Shattrath', true, true, 70, 140, 3.75, 2.25, NULL, NULL, false, 40, 70, 4, 4000, '2024-02-10 13:00:00'),
('Valhalla', '550e8400-e29b-41d4-a716-446655440009', 'Odin', 75000.00, 'world', 9000, 9000, 9000, 64, 9000, 'Hall of the Slain', 'Valhalla', true, true, 120, 240, 7.00, 3.50, 1, 'Nordic Empire', false, 60, 110, 7, 7500, '2024-01-01 00:00:00'),
('Asgard', '550e8400-e29b-41d4-a716-446655440010', 'Thor', 80000.00, 'world', 10000, 10000, 10000, 64, 10000, 'Realm of the Gods', 'Asgard', true, true, 150, 300, 8.00, 4.00, 1, 'Nordic Empire', false, 75, 140, 8, 8000, '2024-01-25 15:00:00')
ON CONFLICT (name) DO NOTHING;

-- Create nations table if it doesn't exist
CREATE TABLE IF NOT EXISTS nations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  leader_uuid VARCHAR(255) NOT NULL,
  king_uuid VARCHAR(255),
  king_name VARCHAR(255),
  leader_name VARCHAR(255),
  capital_town_id INTEGER,
  capital_town_name VARCHAR(255),
  capital_name VARCHAR(255),
  capital_uuid VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 0,
  board TEXT,
  tag VARCHAR(255),
  taxes DECIMAL(5,2) DEFAULT 0,
  town_tax DECIMAL(5,2) DEFAULT 0,
  max_towns INTEGER DEFAULT 10,
  is_open BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  towns_count INTEGER DEFAULT 0,
  residents_count INTEGER DEFAULT 0,
  ally_count INTEGER DEFAULT 0,
  enemy_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  activity_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert sample nations data
INSERT INTO nations (name, leader_uuid, king_uuid, king_name, leader_name, capital_town_name, balance, board, tag, taxes, town_tax, max_towns, is_open, is_public, towns_count, residents_count, created_at) VALUES
('Nordic Empire', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 'Odin', 'Odin', 'Garvia', 150000.00, 'The mighty Nordic Empire spans across the northern lands.', 'Nordic', 5.00, 2.00, 15, true, true, 4, 175, '2024-01-01 00:00:00'),
('Alliance', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 'Anduin', 'Anduin', 'Stormwind', 200000.00, 'For the Alliance! United we stand.', 'Alliance', 4.00, 2.50, 20, true, true, 2, 75, '2024-01-10 08:00:00'),
('Horde', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', 'Thrall', 'Thrall', 'Orgrimmar', 180000.00, 'Lok-tar ogar! Victory or death!', 'Horde', 4.50, 2.75, 18, true, true, 2, 55, '2024-01-20 16:00:00')
ON CONFLICT (name) DO NOTHING;

-- Update town counts in nations
UPDATE nations SET 
  towns_count = (SELECT COUNT(*) FROM towns WHERE nation_name = nations.name),
  residents_count = (SELECT COALESCE(SUM(residents_count), 0) FROM towns WHERE nation_name = nations.name)
WHERE name IN ('Nordic Empire', 'Alliance', 'Horde');

-- Show the results
SELECT 'Towns created:' as info, COUNT(*) as count FROM towns
UNION ALL
SELECT 'Nations created:', COUNT(*) FROM nations; 