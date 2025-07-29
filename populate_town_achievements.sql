-- Manually populate town achievements

-- 1. Insert town achievement definitions
INSERT INTO public.town_achievement_definitions (id, name, description, stat) VALUES
('population', 'Population Growth', 'Grow your town population', 'population'),
('nation_member', 'Nation Member', 'Join a nation', 'nation_member'),
('independent', 'Independent Spirit', 'Remain independent', 'independent'),
('capital', 'Capital Status', 'Become a nation capital', 'capital')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert town achievement tiers
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
-- Population Growth achievements
('population', 1, 'Small Settlement', 'Reach 3 residents', 3, 50, 'trophy', 'from-green-500 to-emerald-600'),
('population', 2, 'Growing Community', 'Reach 5 residents', 5, 100, 'trophy', 'from-green-500 to-emerald-600'),
('population', 3, 'Thriving Town', 'Reach 10 residents', 10, 200, 'trophy', 'from-green-500 to-emerald-600'),
('population', 4, 'Bustling City', 'Reach 15 residents', 15, 350, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 5, 'Major Metropolis', 'Reach 20 residents', 20, 500, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 6, 'Grand Capital', 'Reach 30 residents', 30, 750, 'trophy', 'from-purple-500 to-violet-600'),
('population', 7, 'Imperial City', 'Reach 40 residents', 40, 1000, 'trophy', 'from-orange-500 to-amber-600'),
('population', 8, 'Legendary Metropolis', 'Reach 50 residents', 50, 1500, 'trophy', 'from-red-500 to-pink-600'),

-- Nation Member achievements
('nation_member', 1, 'Alliance Forged', 'Join a nation', 1, 200, 'trophy', 'from-blue-500 to-indigo-600'),

-- Independent Spirit achievements
('independent', 1, 'Independent Spirit', 'Remain independent', 1, 150, 'trophy', 'from-gray-500 to-slate-600'),

-- Capital Status achievements
('capital', 1, 'Capital City', 'Become a nation capital', 1, 500, 'trophy', 'from-yellow-500 to-amber-600')
ON CONFLICT (achievement_id, tier) DO NOTHING;

-- 3. Run the sync function to unlock achievements for existing towns
SELECT public.sync_all_town_achievements();

-- 4. Check results
SELECT 'Achievement definitions' as type, COUNT(*) as count FROM public.town_achievement_definitions
UNION ALL
SELECT 'Achievement tiers' as type, COUNT(*) as count FROM public.town_achievement_tiers
UNION ALL
SELECT 'Unlocked achievements' as type, COUNT(*) as count FROM public.town_unlocked_achievements; 