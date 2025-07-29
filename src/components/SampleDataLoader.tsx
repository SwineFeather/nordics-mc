
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SampleDataLoader = () => {
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // Check if pages already exist
        const { data: existingPages } = await supabase
          .from('wiki_pages')
          .select('id')
          .limit(1);

        if (existingPages && existingPages.length > 0) {
          return; // Sample data already loaded
        }

        // Insert sample pages
        const welcomeContent = `# Welcome to Nordics

## The Nordic Realm Awaits

Welcome to the **Nordics Minecraft Server**! We're excited to have you join our thriving community of players who love adventure, building, and exploring together in our custom Nordic-themed world.

### What Makes Nordics Special?

- **🏰 Towny Survival**: Build and manage your own town or join an existing kingdom
- **🗺️ Custom Nordic Map**: Explore our detailed map based on Northern Europe with additional continents  
- **💰 Vibrant Economy**: Trade, craft, and build wealth in our player-driven economy
- **👑 Nations & Kingdoms**: Join one of five established nations or create your own legacy
- **⚔️ Fair Play**: Strong anti-cheat and moderation systems
- **🎉 Regular Events**: Weekly competitions and seasonal celebrations

### Getting Started

1. **Join our Discord**: \`discord.gg/nordics\`
2. **Connect to the server**: \`nordics.world\`
3. **Read the server rules**
4. **Choose your path**: Start your own settlement or join an existing nation
5. **Begin your Nordic adventure!**

*Welcome to your new home in the Nordic realm!*`;

        const rulesContent = `# Server Rules

## General Conduct

### 1. Be Respectful
- No harassment, bullying, or toxic behavior
- Respect all players regardless of background  
- Keep chat family-friendly
- Use appropriate language at all times

### 2. No Cheating or Exploiting
- **Zero tolerance** for hacks, exploits, or unfair advantages
- X-ray, fly hacks, speed hacks, and auto-clickers are strictly prohibited
- Duplication glitches and economy exploits are forbidden
- Report suspected cheaters to staff immediately

### 3. Building & Griefing Rules
- **No griefing** - Do not destroy or steal from other players' builds
- Ask permission before building near others
- Keep builds appropriate and tasteful
- Respect town and nation boundaries

*Rules are subject to change. Players will be notified of major updates.*`;

        const loreContent = `# The Saga of Nyrvalos – "The Crossing"

## The Journey Begins

*They say the sea gives and the sea takes. But there comes a tide once in an age, when the sea does neither. It simply... opens.*

From the north they came—eight ships adrift in fog. Their hulls battered, their sails torn, yet their banners still flew. These were no warbands or raiders. These were townsmen, traders, farmers, hunters.

## The New Lands

Now, they plant new banners in lands like:
- **Ashendell** - Where ash trees grow as tall as mountains
- **Brigantia** - Rolling hills dotted with ancient stones  
- **Shadowmere** - Mystical wetlands where magic flows freely
- **Goldenvale** - Fertile plains perfect for new settlements

*This lore forms the foundation of our world.*`;

        await supabase.from('wiki_pages').insert([
          {
            title: 'Welcome to Nordics',
            slug: 'welcome',
            content: welcomeContent,
            status: 'published',
            category_id: '550e8400-e29b-41d4-a716-446655440001',
            order_index: 1
          },
          {
            title: 'Server Rules',
            slug: 'server-rules',
            content: rulesContent,
            status: 'published',
            category_id: '550e8400-e29b-41d4-a716-446655440001',
            order_index: 2
          },
          {
            title: 'The Saga of Nyrvalos',
            slug: 'saga-of-nyrvalos',
            content: loreContent,
            status: 'published',
            category_id: '550e8400-e29b-41d4-a716-446655440002',
            order_index: 1
          }
        ]);

        console.log('Sample wiki data loaded successfully');
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    };

    loadSampleData();
  }, []);

  return null;
};

export default SampleDataLoader;
