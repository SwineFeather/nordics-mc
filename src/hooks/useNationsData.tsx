
import { LucideIcon } from 'lucide-react';

export interface Town {
  name: string;
  mayor: string | 'Unknown';
  population: number;
  type: string;
  status: string;
  founded: string;
}

export interface NationAchievement {
  icon: string; // emoji or icon name
  label: string;
  description: string;
}

export interface Nation {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  capital: string;
  leader: string;
  population: number;
  bank: string;
  dailyUpkeep: string;
  founded: string;
  lore: string;
  government: string;
  motto: string;
  specialties: string[];
  towns: Town[];
  history?: string;
  achievements?: NationAchievement[];
}

// Enhanced nations data with extensive lore (moved from Towns.tsx)
const nationsData: Nation[] = [
  {
    id: 'skyward-sanctum',
    name: 'Skyward Sanctum',
    type: 'Kingdom',
    color: 'text-primary',
    description: 'Communism at its finest',
    capital: 'Normannburg',
    leader: 'President Golli1432',
    population: 53,
    bank: '€198,42',
    dailyUpkeep: '€8,56',
    founded: 'Mar 2 2025',
    lore: 'The Kingdom of Skyward Sanctum stands as a beacon of communal prosperity, where resources are shared and collective growth is prioritized above individual gain. This communist paradise operates on principles of equality and mutual aid.',
    government: 'Communist Republic',
    motto: 'Together We Rise',
    specialties: ['Resource Sharing', 'Collective Agriculture', 'Social Programs'],
    towns: [
      { name: 'Normannburg', mayor: 'Golli1432', population: 36, type: 'Metropolis (Capital)', status: 'Royal City', founded: 'Mar 2 2025' },
      { name: 'Stockholm', mayor: 'Unknown', population: 7, type: 'Town', status: 'Active', founded: 'Unknown' },
      { name: 'Preußen', mayor: 'Unknown', population: 3, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'SuoKylä', mayor: 'Unknown', population: 2, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'Onion', mayor: 'Unknown', population: 4, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'Oulu', mayor: 'Unknown', population: 8, type: 'Town', status: 'Active', founded: 'Unknown' }
    ],
    achievements: [
      { icon: '🏆', label: 'Oldest Nation', description: 'Founded earliest on the server' },
      { icon: '🏙️', label: 'Most Towns', description: 'Has the most towns' },
      { icon: '👑', label: 'Largest Population', description: 'Most citizens' }
    ]
  },
  {
    id: 'north-sea-league',
    name: 'North Sea League',
    type: 'Principality',
    color: 'text-secondary',
    description: 'Unity through cooperation',
    capital: 'Kingdom Of Albion',
    leader: 'King of Albion Danny_boy95',
    population: 46,
    bank: '€987,17',
    dailyUpkeep: '€15,45',
    founded: 'Jan 6 2025',
    lore: 'Born from a desire for unity and collaboration among the towns around the North Sea. Founded on principles of transparency, mutual aid, and collective effort, standing in contrast to the secretive and individualistic older nations.',
    history: 'The Birth of North Sea League: As the server continued to grow and evolve, new towns began to emerge across southern Sweden, Denmark, and the areas surrounding the North Sea. On August 25th, the nation was officially formed with a ceremony held at the Altes Museum in Copenhagen, marking the birth of the North Sea League—a union built on community, collaboration, and mutual support.',
    government: 'Cooperative League',
    motto: 'Strength in Unity',
    specialties: ['Maritime Trade', 'Cooperative Governance', 'Cultural Exchange'],
    towns: [
      { name: 'Kingdom Of Albion', mayor: 'Danny_boy95', population: 14, type: 'Large Town (Capital)', status: 'Open', founded: 'Jan 6 2025' },
      { name: 'Kållandsö', mayor: 'Unknown', population: 10, type: 'Town', status: 'Active', founded: 'Unknown' },
      { name: 'Herrehus', mayor: 'Unknown', population: 8, type: 'Town', status: 'Active', founded: 'Unknown' },
      { name: 'Småstan', mayor: 'Unknown', population: 3, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'Söderhamn', mayor: 'Unknown', population: 3, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'Verenigde Provinciën', mayor: 'Unknown', population: 3, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'C.C.F.N', mayor: 'Unknown', population: 1, type: 'Settlement', status: 'Active', founded: 'Jan 7 2025' },
      { name: 'Tegridy Farms', mayor: 'Unknown', population: 1, type: 'Settlement', status: 'Active', founded: 'Unknown' },
      { name: 'Wavecrest', mayor: 'Unknown', population: 1, type: 'Settlement', status: 'Active', founded: 'Unknown' }
    ],
    achievements: [
      { icon: '🏅', label: 'Event Winner', description: 'Summer Build-Off Champion' }
    ]
  },
  {
    id: 'constellation',
    name: 'Constellation',
    type: 'County',
    color: 'text-accent',
    description: 'Bright Stars Await',
    capital: 'Northstar',
    leader: 'Leader Svardmastaren',
    population: 28,
    bank: '€499,28',
    dailyUpkeep: '€9,32',
    founded: 'Oct 10 2023',
    lore: 'The Constellation Empire was established following Garvia\'s departure from the nation of Kala due to disloyalty. The nation features an eagle and stars on its flag, symbolizing all the towns within the nation.',
    history: 'The Birth of the Constellation nation: The Constellation Empire was established on October 10th, 2023, following Garvia\'s departure from the nation of Kala due to disloyalty. Seeking alliances elsewhere, Garvia swiftly received a response from Northstar, leading to the agreement to form a new nation to gain various bonuses, including more town plots and better connectivity between towns.',
    government: 'Imperial Federation',
    motto: 'Per Aspera Ad Astra',
    specialties: ['Railroad Infrastructure', 'Industrial Development', 'Architectural Excellence'],
    towns: [
      { name: 'Northstar', mayor: 'Svardmastaren', population: 15, type: 'City (Capital)', status: 'Active', founded: 'Oct 9 2023' },
      { name: 'Garvia', mayor: 'Unknown', population: 5, type: 'Settlement', status: 'Active', founded: 'Oct 2023' },
      { name: 'Neko No Kuni', mayor: 'Unknown', population: 8, type: 'Town', status: 'Active', founded: 'Unknown' }
    ],
    achievements: [
      { icon: '💬', label: 'Most Active', description: 'Most online members' }
    ]
  },
  {
    id: 'kesko-corp',
    name: 'Kesko Corporation',
    type: 'Corporation',
    color: 'text-orange-500',
    description: 'Exiles, rebels, and adventurers united',
    capital: 'SuperAlko',
    leader: 'Occypolojee',
    population: 21,
    bank: 'Private',
    dailyUpkeep: 'N/A',
    founded: 'Unknown',
    lore: 'The Federation of Kesko Corp is a nation made up of exiles, rebels, and adventurers. Founded by the town of Superalko, which was expelled from Finland by the nation of Kala for unknown reasons. The nation values freedom, friendship, and fun.',
    history: 'Kesko Corp expanded its territory and influence by trading with other nations and colonizing new lands. Helsinki was a town that was established around Superalko, becoming a hub of commerce and culture. The Federation of Kesko Corp is a nation of diversity, creativity, and ambition that has overcome many challenges.',
    government: 'Corporate Federation',
    motto: 'Freedom Through Enterprise',
    specialties: ['Trade Networks', 'Colonial Expansion', 'Commercial Innovation'],
    towns: [
      { name: 'SuperAlko', mayor: 'Occypolojee', population: 6, type: 'Town (Capital)', status: 'Active', founded: 'Unknown' },
      { name: 'Hiiumaa', mayor: 'Unknown', population: 9, type: 'Town', status: 'Active', founded: 'Unknown' },
      { name: 'Helsinki', mayor: 'Unknown', population: 4, type: 'Settlement', status: 'Rebuilding', founded: 'Unknown' },
      { name: 'Siwa', mayor: 'Unknown', population: 2, type: 'Settlement', status: 'Active', founded: 'Unknown' }
    ],
    achievements: [
      { icon: '🏅', label: 'Event Winner', description: 'Spring Festival Champion' }
    ]
  },
  {
    id: 'aqua-union',
    name: 'Aqua Union',
    type: 'Union',
    color: 'text-blue-500',
    description: 'Harmony with the waters',
    capital: 'Aqua Commune',
    leader: 'Unknown',
    population: 10,
    bank: 'Public',
    dailyUpkeep: 'Shared',
    founded: 'Unknown',
    lore: 'A peaceful alliance focused on aquatic development and sustainable living by the water. The Aqua Union represents harmony between civilization and nature, particularly the seas and rivers.',
    government: 'Democratic Union',
    motto: 'Flow with Nature',
    specialties: ['Aquaculture', 'Sustainable Development', 'Environmental Protection'],
    towns: [
      { name: 'Aqua Commune', mayor: 'Unknown', population: 10, type: 'Commune (Capital)', status: 'Open', founded: 'Unknown' }
    ],
    achievements: [
      { icon: '🌊', label: 'Eco Nation', description: 'Best environmental practices' }
    ]
  }
];

export const useNationsData = () => {
  return { nations: nationsData };
};
