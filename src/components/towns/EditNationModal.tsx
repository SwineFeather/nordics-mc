import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Save, Loader2, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupabaseNationData } from '@/services/supabaseTownService';

// Ruling entities organized by categories
const RULING_ENTITY_CATEGORIES = {
  'Traditional Nobility': {
    'Monarch': 'A king, queen, emperor, or other royal ruler',
    'Emperor': 'Supreme ruler of an empire',
    'King': 'Male ruler of a kingdom',
    'Queen': 'Female ruler of a kingdom',
    'Prince': 'Son of a monarch, may rule a principality',
    'Princess': 'Daughter of a monarch, may rule a principality',
    'Duke': 'Noble ruler of a duchy',
    'Duchess': 'Female noble ruler of a duchy',
    'Count': 'Noble ruler of a county',
    'Countess': 'Female noble ruler of a county',
    'Baron': 'Noble ruler of a barony',
    'Baroness': 'Female noble ruler of a barony',
    'Archduke': 'High-ranking noble ruler',
    'Archduchess': 'High-ranking female noble ruler',
    'Viceroy': 'Representative ruler for a monarch',
    'Regent': 'Temporary ruler while monarch is unable to rule'
  },
  'Elected Leaders': {
    'President': 'An elected head of state',
    'Prime Minister': 'The head of government, usually from the majority party',
    'Chancellor': 'A high-ranking government official or head of government',
    'Consul': 'Elected official in ancient or modern republics',
    'Tribune': 'Elected representative of the people',
    'Senator': 'Elected member of a senate',
    'Representative': 'Elected member of a legislative body',
    'Governor': 'Elected or appointed leader of a region',
    'Mayor': 'Elected leader of a city'
  },
  'Council & Assembly': {
    'Council': 'A group of people who rule together',
    'Assembly': 'A body of elected representatives',
    'Parliament': 'A legislative body that also governs',
    'Senate': 'An upper house of government',
    'Congress': 'A legislative body with governing powers',
    'Diet': 'Legislative assembly in some countries',
    'Cortes': 'Parliament in Spanish-speaking countries',
    'Reichstag': 'German parliament or legislative body',
    'Duma': 'Russian legislative assembly',
    'Knesset': 'Israeli parliament'
  },
  'Military Leaders': {
    'General': 'Military leader who rules',
    'Admiral': 'Naval leader who rules',
    'Commander': 'Military commander who rules',
    'Warlord': 'Military leader who controls territory',
    'Captain': 'Military or naval officer who rules',
    'Colonel': 'Military officer who rules',
    'Marshal': 'High-ranking military officer who rules',
    'Strategos': 'Ancient Greek military leader who rules',
    'Shogun': 'Japanese military dictator',
    'Caesar': 'Roman military and political leader'
  },
  'Religious Leaders': {
    'Pope': 'Head of the Catholic Church who rules',
    'Patriarch': 'Eastern Orthodox Church leader who rules',
    'Caliph': 'Islamic religious and political leader',
    'Sultan': 'Islamic ruler with religious authority',
    'Emir': 'Islamic ruler or commander',
    'Khan': 'Central Asian ruler, often nomadic',
    'Pharaoh': 'Ancient Egyptian divine ruler',
    'High Priest': 'Religious leader who rules',
    'Archbishop': 'High-ranking church official who rules',
    'Bishop': 'Church official who rules',
    'Imam': 'Islamic religious leader who rules',
    'Rabbi': 'Jewish religious leader who rules',
    'Lama': 'Tibetan Buddhist leader who rules',
    'Guru': 'Spiritual teacher who rules'
  },
  'Fantasy & Mythical': {
    'Dragon': 'A powerful dragon who rules the land',
    'Phoenix': 'A mythical bird who rules through rebirth',
    'Unicorn': 'A magical unicorn who rules with purity',
    'Griffin': 'A mythical creature who rules with strength',
    'Kraken': 'A sea monster who rules the oceans',
    'Titan': 'A giant being who rules with ancient power',
    'Elemental': 'A being of pure elemental energy who rules',
    'Spirit': 'A supernatural being who rules',
    'Deity': 'A god or goddess who rules directly',
    'Avatar': 'A divine incarnation who rules',
    'Oracle': 'A mystical seer who rules through prophecy',
    'Wizard': 'A powerful magic user who rules',
    'Witch': 'A magical practitioner who rules',
    'Sorcerer': 'A wielder of dark magic who rules',
    'Necromancer': 'A master of death magic who rules',
    'Druid': 'A nature priest who rules',
    'Bard': 'A magical musician who rules through song',
    'Paladin': 'A holy warrior who rules with divine authority',
    'Ranger': 'A wilderness guardian who rules',
    'Rogue': 'A cunning thief who rules through stealth'
  },
  'Special & Unique': {
    'Dictator': 'A single ruler with absolute power',
    'Oligarch': 'A member of a small ruling group',
    'Technocrat': 'A technical expert who rules',
    'Meritocrat': 'Someone chosen for their abilities',
    'Aristocrat': 'A noble or privileged person who rules',
    'Bureaucrat': 'A government official who rules',
    'Scholar': 'An academic who rules through knowledge',
    'Merchant': 'A wealthy trader who rules',
    'Artisan': 'A skilled craftsman who rules',
    'Farmer': 'A landowner who rules through agriculture',
    'Hunter': 'A skilled hunter who rules',
    'Fisher': 'A master of the seas who rules',
    'Miner': 'A resource controller who rules',
    'Blacksmith': 'A master craftsman who rules',
    'Alchemist': 'A master of transformation who rules',
    'Astronomer': 'A stargazer who rules through celestial knowledge',
    'Historian': 'A keeper of knowledge who rules',
    'Philosopher': 'A thinker who rules through wisdom',
    'Prophet': 'A seer who rules through divine insight',
    'Champion': 'A victorious warrior who rules',
    'Hero': 'A legendary figure who rules',
    'Villain': 'A dark figure who rules through fear',
    'Outlaw': 'A rebel who rules outside the law',
    'Pirate': 'A sea robber who rules the waves',
    'Nomad': 'A wanderer who rules through movement',
    'Hermit': 'A solitary figure who rules alone',
    'Sage': 'A wise elder who rules through knowledge',
    'Mystic': 'A spiritual seeker who rules',
    'Shaman': 'A spiritual healer who rules',
    'Monk': 'A religious ascetic who rules',
    'Nun': 'A religious woman who rules',
    'Priest': 'A religious man who rules',
    'Priestess': 'A religious woman who rules',
    'Cultist': 'A follower of a dark religion who rules',
    'Heretic': 'A religious rebel who rules',
    'Zealot': 'A religious fanatic who rules',
    'Martyr': 'A sacrificial figure who rules through death',
    'Saint': 'A holy figure who rules through divine favor'
  },
  'Supernatural & Otherworldly': {
    'Demon': 'A supernatural evil being who rules',
    'Angel': 'A divine messenger who rules',
    'Ghost': 'A spirit of the dead who rules',
    'Vampire': 'An undead blood drinker who rules',
    'Werewolf': 'A shape-shifting beast who rules',
    'Zombie': 'An undead being who rules',
    'Skeleton': 'An animated skeleton who rules',
    'Golem': 'A magical construct who rules',
    'Automaton': 'A mechanical being who rules',
    'Cyborg': 'A part-human, part-machine who rules',
    'Robot': 'A mechanical being who rules',
    'AI': 'An artificial intelligence who rules',
    'Hologram': 'A projected image who rules',
    'Clone': 'A genetic copy who rules',
    'Mutant': 'A genetically altered being who rules',
    'Alien': 'A being from another world who rules',
    'Time Traveler': 'A being from another time who rules',
    'Dimension Walker': 'A being from another dimension who rules',
    'Reality Bender': 'A being who can change reality who rules',
    'Dream Walker': 'A being who rules through dreams',
    'Mind Reader': 'A being who rules through mental powers',
    'Telepath': 'A being who rules through thought',
    'Psychic': 'A being with mental powers who rules',
    'Empath': 'A being who feels others emotions who rules',
    'Telekinetic': 'A being who moves objects with mind who rules',
    'Shapeshifter': 'A being who changes form who rules',
    'Invisible': 'A being who cannot be seen who rules',
    'Flying': 'A being who can fly who rules',
    'Underwater': 'A being who lives underwater who rules',
    'Underground': 'A being who lives underground who rules',
    'Space': 'A being from space who rules',
    'Interdimensional': 'A being from another dimension who rules',
    'Ethereal': 'A being of pure energy who rules',
    'Corporeal': 'A being with a physical body who rules',
    'Incorporeal': 'A being without a physical body who rules',
    'Mortal': 'A being who can die who rules',
    'Immortal': 'A being who cannot die who rules',
    'Eternal': 'A being who exists forever who rules',
    'Temporal': 'A being who exists in time who rules',
    'Spatial': 'A being who exists in space who rules',
    'Abstract': 'A being of pure concept who rules',
    'Concrete': 'A being of physical reality who rules',
    'Virtual': 'A being who exists in digital space who rules',
    'Quantum': 'A being who exists in quantum states who rules',
    'Chaos': 'A being of pure disorder who rules',
    'Order': 'A being of pure structure who rules',
    'Light': 'A being of pure light who rules',
    'Darkness': 'A being of pure darkness who rules',
    'Fire': 'A being of pure fire who rules',
    'Water': 'A being of pure water who rules',
    'Earth': 'A being of pure earth who rules',
    'Air': 'A being of pure air who rules',
    'Ice': 'A being of pure ice who rules',
    'Lightning': 'A being of pure electricity who rules',
    'Shadow': 'A being of pure shadow who rules',
    'Crystal': 'A being of pure crystal who rules',
    'Metal': 'A being of pure metal who rules',
    'Wood': 'A being of pure wood who rules',
    'Stone': 'A being of pure stone who rules',
    'Glass': 'A being of pure glass who rules',
    'Plastic': 'A being of pure plastic who rules',
    'Fabric': 'A being of pure fabric who rules',
    'Paper': 'A being of pure paper who rules',
    'Ink': 'A being of pure ink who rules',
    'Sound': 'A being of pure sound who rules',
    'Silence': 'A being of pure silence who rules',
    'Color': 'A being of pure color who rules',
    'Grayscale': 'A being of pure grayscale who rules',
    'Rainbow': 'A being of pure rainbow who rules',
    'Monochrome': 'A being of pure monochrome who rules',
    'Holographic': 'A being of pure hologram who rules',
    'Neon': 'A being of pure neon who rules',
    'Pastel': 'A being of pure pastel who rules',
    'Metallic': 'A being of pure metal who rules',
    'Matte': 'A being of pure matte who rules',
    'Glossy': 'A being of pure gloss who rules',
    'Transparent': 'A being of pure transparency who rules',
    'Opaque': 'A being of pure opacity who rules',
    'Reflective': 'A being of pure reflection who rules',
    'Absorptive': 'A being of pure absorption who rules',
    'Emissive': 'A being of pure emission who rules',
    'Conductive': 'A being of pure conduction who rules',
    'Insulative': 'A being of pure insulation who rules',
    'Magnetic': 'A being of pure magnetism who rules',
    'Electric': 'A being of pure electricity who rules',
    'Nuclear': 'A being of pure nuclear energy who rules',
    'Chemical': 'A being of pure chemistry who rules',
    'Biological': 'A being of pure biology who rules',
    'Mechanical': 'A being of pure mechanics who rules',
    'Digital': 'A being of pure digital technology who rules',
    'Analog': 'A being of pure analog technology who rules',
    'Binary': 'A being of pure binary who rules',
    'Hexadecimal': 'A being of pure hexadecimal who rules',
    'Decimal': 'A being of pure decimal who rules',
    'Octal': 'A being of pure octal who rules',
    'Roman': 'A being of pure Roman numerals who rules',
    'Greek': 'A being of pure Greek letters who rules',
    'Cyrillic': 'A being of pure Cyrillic letters who rules',
    'Arabic': 'A being of pure Arabic letters who rules',
    'Chinese': 'A being of pure Chinese characters who rules',
    'Japanese': 'A being of pure Japanese characters who rules',
    'Korean': 'A being of pure Korean characters who rules',
    'Hindi': 'A being of pure Hindi characters who rules',
    'Hebrew': 'A being of pure Hebrew letters who rules',
    'Latin': 'A being of pure Latin letters who rules',
    'Sanskrit': 'A being of pure Sanskrit who rules',
    'Hieroglyphic': 'A being of pure hieroglyphics who rules',
    'Cuneiform': 'A being of pure cuneiform who rules',
    'Runes': 'A being of pure runes who rules',
    'Ogham': 'A being of pure Ogham who rules',
    'Braille': 'A being of pure Braille who rules',
    'Morse': 'A being of pure Morse code who rules',
    'Semaphore': 'A being of pure semaphore who rules',
    'Flag': 'A being of pure flag signals who rules',
    'Smoke': 'A being of pure smoke signals who rules',
    'Mirror': 'A being of pure mirror signals who rules',
    'Laser': 'A being of pure laser who rules',
    'Radio': 'A being of pure radio waves who rules',
    'Microwave': 'A being of pure microwaves who rules',
    'Infrared': 'A being of pure infrared who rules',
    'Ultraviolet': 'A being of pure ultraviolet who rules',
    'X-Ray': 'A being of pure X-rays who rules',
    'Gamma': 'A being of pure gamma rays who rules',
    'Cosmic': 'A being of pure cosmic rays who rules',
    'Solar': 'A being of pure solar energy who rules',
    'Lunar': 'A being of pure lunar energy who rules',
    'Stellar': 'A being of pure stellar energy who rules',
    'Planetary': 'A being of pure planetary energy who rules',
    'Galactic': 'A being of pure galactic energy who rules',
    'Universal': 'A being of pure universal energy who rules',
    'Multiversal': 'A being of pure multiversal energy who rules',
    'Omniversal': 'A being of pure omniversal energy who rules',
    'Infinite': 'A being of pure infinity who rules',
    'Finite': 'A being of pure finiteness who rules',
    'Zero': 'A being of pure nothingness who rules',
    'One': 'A being of pure oneness who rules',
    'Pi': 'A being of pure mathematical pi who rules',
    'E': 'A being of pure mathematical e who rules',
    'Golden Ratio': 'A being of pure golden ratio who rules',
    'Fibonacci': 'A being of pure Fibonacci sequence who rules',
    'Prime': 'A being of pure prime numbers who rules',
    'Perfect': 'A being of pure perfection who rules',
    'Imperfect': 'A being of pure imperfection who rules',
    'Random': 'A being of pure randomness who rules',
    'Deterministic': 'A being of pure determinism who rules',
    'Probabilistic': 'A being of pure probability who rules',
    'Statistical': 'A being of pure statistics who rules',
    'Analytical': 'A being of pure analysis who rules',
    'Synthetic': 'A being of pure synthesis who rules',
    'Organic': 'A being of pure organic matter who rules',
    'Inorganic': 'A being of pure inorganic matter who rules',
    'Living': 'A being of pure life who rules',
    'Dead': 'A being of pure death who rules',
    'Undead': 'A being between life and death who rules',
    'Reborn': 'A being who has been reborn who rules',
    'Reincarnated': 'A being who has been reincarnated who rules',
    'Transformed': 'A being who has been transformed who rules',
    'Evolved': 'A being who has evolved who rules',
    'Devolved': 'A being who has devolved who rules',
    'Ascended': 'A being who has ascended to higher power who rules',
    'Descended': 'A being who has descended to lower power who rules',
    'Transcended': 'A being who has transcended normal existence who rules',
    'Immanent': 'A being who exists within creation who rules',
    'Transcendent': 'A being who exists beyond creation who rules',
    'Immanent-Transcendent': 'A being who exists both within and beyond creation who rules',
    'Omnipresent': 'A being who exists everywhere who rules',
    'Omniscient': 'A being who knows everything who rules',
    'Omnipotent': 'A being who can do anything who rules',
    'Omnibenevolent': 'A being who is purely good who rules',
    'Omnimalevolent': 'A being who is purely evil who rules',
    'Neutral': 'A being who is neither good nor evil who rules',
    'Chaotic': 'A being who is purely chaotic who rules',
    'Lawful': 'A being who is purely lawful who rules',
    'True Neutral': 'A being who is perfectly balanced who rules',
    'Chaotic Good': 'A being who is chaotically good who rules',
    'Chaotic Evil': 'A being who is chaotically evil who rules',
    'Lawful Good': 'A being who is lawfully good who rules',
    'Lawful Evil': 'A being who is lawfully evil who rules',
    'Neutral Good': 'A being who is neutrally good who rules',
    'Neutral Evil': 'A being who is neutrally evil who rules',
    'Chaotic Neutral': 'A being who is chaotically neutral who rules',
    'Lawful Neutral': 'A being who is lawfully neutral who rules'
  }
};

interface EditNationModalProps {
  nation: SupabaseNationData;
  onNationUpdated: (updatedNation: SupabaseNationData) => void;

// Government systems organized by categories
const GOVERNMENT_SYSTEM_CATEGORIES = {
  'Monarchy Systems': {
    'Monarchy': 'Rule by a single monarch or royal family',
    'Traditional Monarchy': 'Monarch has complete power over the state',
    'Constitutional Monarchy': 'Monarch with limited powers, constitution-based',
    'Limited Monarchy': 'Monarch\'s power is restricted by laws or constitution',
    'Elective Monarchy': 'Monarch chosen by election rather than inheritance',
    'Hereditary Monarchy': 'Monarch position passed down through family',
    'Dual Monarchy': 'Two monarchs ruling together or over separate territories',
    'Crowned Republic': 'Monarchy in name but republic in practice',
    'Grand Duchy': 'Territory ruled by a grand duke or duchess',
    'Principality': 'Territory ruled by a prince or princess',
    'Archduchy': 'Territory ruled by an archduke or archduchess',
    'Viceroyalty': 'Territory ruled by a viceroy on behalf of a monarch',
    'Imperial Monarchy': 'Monarchy ruling over an empire',
    'Holy Roman Empire': 'Multi-ethnic empire with complex governance',
    'Byzantine Empire': 'Eastern Roman Empire with imperial structure',
    'Ottoman Empire': 'Islamic empire with sultanate system',
    'Austro-Hungarian Empire': 'Dual monarchy with complex federal structure',
    'Russian Empire': 'Tsarist autocracy with imperial expansion',
    'British Empire': 'Constitutional monarchy with colonial empire',
    'French Empire': 'Napoleonic imperial system',
    'German Empire': 'Federal monarchy with imperial structure'
  },
  'Democratic Systems': {
    'Democracy': 'Rule by the people through voting and participation',
    'Direct Democracy': 'Citizens vote directly on laws and policies',
    'Athenian Democracy': 'Classical Greek direct democracy',
    'Swiss Democracy': 'Modern direct democracy with referendums',
    'Participatory Democracy': 'Citizens actively participate in decision-making',
    'Deliberative Democracy': 'Decisions made through reasoned discussion',
    'Consensus Democracy': 'Decisions made by consensus',
    'Liquid Democracy': 'Delegable voting system',
    'E-Democracy': 'Electronic democracy using internet',
    'Digital Democracy': 'Democracy using digital technology',
    'Virtual Democracy': 'Democracy conducted in virtual spaces',
    'Liberal Democracy': 'Democracy with protection of individual rights',
    'Social Democracy': 'Democracy with social welfare programs',
    'Constitutional Democracy': 'Democracy limited by a constitution',
    'Parliamentary Democracy': 'Democracy with parliamentary system',
    'Presidential Democracy': 'Democracy with powerful president',
    'Semi-Presidential Democracy': 'Democracy with both president and prime minister',
    'Majoritarian Democracy': 'Majority rule democracy',
    'Proportional Democracy': 'Representation proportional to votes',
    'Mixed Democracy': 'Combination of different democratic systems',
    'Workers Democracy': 'Workers control the means of production',
    'Market Democracy': 'Democracy with free market economy',
    'Green Democracy': 'Democracy focused on environmental issues',
    'Council Democracy': 'Decisions made by elected councils',
    'Industrial Democracy': 'Democracy in workplace and industry',
    'Economic Democracy': 'Democratic control of economic decisions',
    'Cultural Democracy': 'Democracy in cultural and artistic matters',
    'Scientific Democracy': 'Democratic decision-making in science',
    'Technological Democracy': 'Democratic control of technology',
    'Educational Democracy': 'Democratic governance of education'
  },
  'Republican Systems': {
    'Republic': 'Rule by elected officials and representatives',
    'Classical Republic': 'State without a monarch, ruled by elected officials',
    'Roman Republic': 'Ancient Roman republican system',
    'Venetian Republic': 'Maritime republic with complex governance',
    'Florentine Republic': 'Renaissance city-state republic',
    'Dutch Republic': 'Early modern federal republic',
    'Swiss Confederation': 'Federal republic with direct democracy',
    'Icelandic Commonwealth': 'Medieval republican system',
    'Novgorod Republic': 'Medieval Russian city republic',
    'Pskov Republic': 'Medieval Russian city republic',
    'Carthaginian Republic': 'Ancient Phoenician republic',
    'Constitutional Republic': 'A republic that follows rules in a constitution',
    'Federal Republic': 'A republic with many states that share power',
    'Unitary Republic': 'A republic with one central government',
    'Parliamentary Republic': 'A republic where a parliament makes decisions',
    'Semi-Presidential Republic': 'A republic with both a president and prime minister',
    'Presidential Republic': 'A republic where a president has a lot of power',
    'People\'s Republic': 'A republic that claims to represent the people',
    'Islamic Republic': 'Republic based on Islamic principles',
    'Socialist Republic': 'Republic with socialist economy',
    'Democratic Republic': 'Republic emphasizing democratic principles',
    'Merchant Republic': 'Republic controlled by rich merchants',
    'Military Republic': 'Republic with strong military influence',
    'Corporate Republic': 'Republic run like a big company',
    'Technocratic Republic': 'Republic ruled by technical experts',
    'Academic Republic': 'Republic with academic governance',
    'Religious Republic': 'Republic based on religious principles',
    'Secular Republic': 'Republic with separation of church and state',
    'Multicultural Republic': 'Republic embracing cultural diversity',
    'Environmental Republic': 'Republic focused on environmental protection',
    'Digital Republic': 'Republic using digital governance'
  },
  'Federal & Union Systems': {
    'Federation': 'Power shared between central and regional governments',
    'Federal Monarchy': 'Monarchy with federal structure',
    'Federal Republic': 'Republic with federal structure',
    'Federal Democracy': 'Democracy with federal structure',
    'Asymmetric Federation': 'Federation with unequal member states',
    'Symmetric Federation': 'Federation with equal member states',
    'Federacy': 'Asymmetric federal relationship',
    'Associated State': 'State in free association with another',
    'Commonwealth': 'Voluntary association of independent states',
    'Confederation': 'Loose alliance of independent states',
    'Union': 'Political union of multiple entities',
    'Personal Union': 'Two countries ruled by the same king or queen',
    'Real Union': 'Two countries that share some government institutions',
    'Political Union': 'Countries that work together politically',
    'Economic Union': 'Countries that work together economically',
    'Monetary Union': 'Countries that use the same money',
    'Customs Union': 'Countries that have the same trade rules',
    'Alliance': 'Countries that agree to help each other',
    'Defensive Alliance': 'Countries that agree to defend each other',
    'Offensive Alliance': 'Countries that agree to attack together'
  },
  'Regional & Special Systems': {
    'City-State': 'Independent city with its own government',
    'Regional State': 'State with areas that have some independence',
    'Autonomous Region': 'Area that can make some of its own decisions',
    'Special Administrative Region': 'Area with special rules and independence',
    'Free City': 'City that has special independence',
    'Microstate': 'Very small independent state',
    'Enclave': 'Territory completely surrounded by another state',
    'Exclave': 'Territory separated from main state',
    'Condominium': 'Territory jointly ruled by multiple states',
    'Protectorate': 'State protected by another state'
  },
  'Military & Security Systems': {
    'Military': 'Government controlled by military institutions',
    'Military Junta': 'A group of military leaders rules the country',
    'Military Dictatorship': 'One military leader has all the power',
    'Stratocracy': 'The military class controls the government',
    'Martial Law': 'The military temporarily takes control during emergencies',
    'Military Occupation': 'The military controls a territory',
    'Warlord State': 'Military leaders control different parts of the country',
    'Praetorian State': 'The military controls politics',
    'Garrison State': 'The country is organized around military defense',
    'Barracks State': 'The military has a lot of influence everywhere',
    'Security State': 'The government focuses on security and watching people'
  },
  'Authoritarian Systems': {
    'Dictatorship': 'Rule by a single leader with absolute power',
    'Autocracy': 'Rule by a single person with unlimited power',
    'Despotism': 'Rule by a despot with absolute power',
    'Tyranny': 'Rule by a tyrant with oppressive power',
    'Caesarism': 'A dictator who has popular support',
    'Bonapartism': 'Authoritarian rule that comes from a revolution',
    'Personal Rule': 'Rule based on one person\'s authority',
    'Cult of Personality': 'Rule based on people worshipping the leader',
    'Supreme Leadership': 'Rule by a supreme leader',
    'Oligarchy': 'Rule by a small group of powerful people',
    'Plutocracy': 'Rule by the wealthy',
    'Timocracy': 'Rule by property owners',
    'Gerontocracy': 'Rule by the elderly',
    'Kleptocracy': 'Rule by corrupt leaders',
    'Nepotocracy': 'Family members rule the country',
    'Bureaucracy': 'Government officials rule the country',
    'Meritocracy': 'People with the best skills rule the country',
    'Technocracy': 'Technical experts rule the country'
  },
  'Economic & Modern Systems': {
    'Socialist State': 'State with socialist economy',
    'Communist State': 'State based on communist ideology',
    'Capitalist State': 'State with capitalist economy',
    'Mixed Economy': 'State combining different economic systems',
    'Welfare State': 'State providing social welfare',
    'Developmental State': 'State actively promoting development',
    'Rentier State': 'State dependent on resource rents',
    'Petrostate': 'State dependent on petroleum exports',
    'Resource State': 'State dependent on natural resources',
    'Trading State': 'State focused on trade and commerce',
    'Corporate State': 'State controlled by corporations',
    'Virtual State': 'State existing primarily online',
    'Crypto State': 'State using cryptocurrency',
    'AI State': 'State using artificial intelligence',
    'Smart State': 'State using smart technology',
    'Green State': 'State focused on environmental protection',
    'Sustainable State': 'State emphasizing sustainability',
    'Resilient State': 'State designed for resilience'
  },
  'Alternative & Minimal Systems': {
    'Anarchy': 'No government or authority at all',
    'Minarchism': 'Very small government that only provides basic services',
    'Libertarian State': 'State with maximum individual freedom',
    'Night Watchman State': 'State that only provides basic security',
    'Voluntary Society': 'Society based on people choosing to work together',
    'Stateless Society': 'Society without a formal state',
    'Self-Governing': 'Society that governs itself without a state',
    'Decentralized': 'Society with power spread out instead of centralized',
    'Autonomous': 'Self-governing with minimal external control',
    'Caste System': 'Society organized by hereditary social classes',
    'Tribal': 'Government based on tribal structures and customs',
    'Tribal Confederation': 'A group of tribes working together',
    'Feudal': 'Hierarchical system based on land ownership',
    'Feudal System': 'A system where landowners control resources and people work for them',
    'Corporate': 'Government run like a business corporation',
    'Guild': 'Government organized around professional associations',
    'Guild System': 'A society organized by professional groups',
    'Commune': 'Government based on community cooperation',
    'Monastic State': 'A state ruled by a religious order',
    'Utopian State': 'A state based on an ideal social model'
  },
  'Fantasy & Sci-Fi Systems': {
    'Magical Monarchy': 'Monarchy with magical powers',
    'Arcane Republic': 'Republic ruled by magic users',
    'Dragon Empire': 'Empire ruled by dragons',
    'Elemental Federation': 'Federation of elemental beings',
    'Spirit Theocracy': 'Theocracy ruled by spirits',
    'Crystal Oligarchy': 'Oligarchy of crystal beings',
    'Shadow Democracy': 'Democracy in the realm of shadows',
    'Light Republic': 'Republic of pure light beings',
    'Chaos Confederation': 'Confederation of chaotic beings',
    'Order Empire': 'Empire of pure order',
    'Void State': 'State existing in the void',
    'Dream Realm': 'Realm ruled through dreams',
    'Nightmare Kingdom': 'Kingdom of nightmares',
    'Fairy Court': 'Court of fairy beings',
    'Goblin Horde': 'Horde of goblin tribes',
    'Orc Warlords': 'Warlords of orc tribes',
    'Elf Council': 'Council of elven elders',
    'Dwarf Guild': 'Guild of dwarf craftsmen',
    'Halfling Shire': 'Shire of halfling communities',
    'Gnome Workshop': 'Workshop of gnome inventors',
    'Troll Bridge': 'Bridge ruled by trolls',
    'Giant Mountain': 'Mountain ruled by giants',
    'Centaur Plains': 'Plains ruled by centaurs',
    'Mermaid Kingdom': 'Underwater kingdom of mermaids',
    'Siren Isle': 'Island ruled by sirens',
    'Harpy Peak': 'Mountain peak ruled by harpies',
    'Griffin Aerie': 'Aerie ruled by griffins',
    'Phoenix Nest': 'Nest ruled by phoenixes',
    'Unicorn Forest': 'Forest ruled by unicorns',
    'Dragon Lair': 'Lair ruled by dragons',
    'Kraken Deep': 'Deep sea ruled by krakens',
    'Leviathan Ocean': 'Ocean ruled by leviathans',
    'Behemoth Land': 'Land ruled by behemoths',
    'Titan Peak': 'Mountain peak ruled by titans',
    'God Realm': 'Realm ruled by gods',
    'Demon Realm': 'Realm ruled by demons',
    'Angel Heaven': 'Heaven ruled by angels',
    'Devil Hell': 'Hell ruled by devils',
    'Undead Kingdom': 'Kingdom of the undead',
    'Vampire Court': 'Court of vampires',
    'Werewolf Pack': 'Pack of werewolves',
    'Zombie Horde': 'Horde of zombies',
    'Skeleton Army': 'Army of skeletons',
    'Ghost Realm': 'Realm of ghosts',
    'Spirit World': 'World of spirits',
    'Elemental Plane': 'Plane of elemental beings',
    'Astral Plane': 'Plane of astral beings',
    'Ethereal Plane': 'Plane of ethereal beings',
    'Material Plane': 'Plane of material beings',
    'Shadow Plane': 'Plane of shadows',
    'Fey Realm': 'Realm of fey beings',
    'Underdark': 'Underground realm of dark beings',
    'Floating Islands': 'Islands floating in the sky',
    'Underwater City': 'City under the sea',
    'Underground Kingdom': 'Kingdom beneath the earth',
    'Space Station': 'Station in space',
    'Moon Base': 'Base on the moon',
    'Mars Colony': 'Colony on Mars',
    'Asteroid Mine': 'Mine on an asteroid',
    'Comet Ship': 'Ship traveling on a comet',
    'Black Hole': 'Realm near a black hole',
    'Wormhole': 'Realm connected by wormholes',
    'Parallel Universe': 'Universe parallel to our own',
    'Mirror World': 'World that mirrors our own',
    'Upside Down': 'World that is upside down',
    'Inside Out': 'World where inside is outside',
    'Backwards': 'World where time flows backwards',
    'Sideways': 'World where gravity is sideways',
    'Diagonal': 'World where everything is diagonal',
    'Spiral': 'World that spirals through space',
    'Fractal': 'World with infinite detail',
    'Holographic': 'World that is a hologram',
    'Neon': 'World of pure neon',
    'Pastel': 'World of pure pastel',
    'Metallic': 'World of pure metal',
    'Matte': 'World of pure matte',
    'Glossy': 'World of pure gloss',
    'Transparent': 'World of pure transparency',
    'Opaque': 'World of pure opacity',
    'Reflective': 'World of pure reflection',
    'Absorptive': 'World of pure absorption',
    'Emissive': 'World of pure emission',
    'Conductive': 'World of pure conduction',
    'Insulative': 'World of pure insulation',
    'Magnetic': 'World of pure magnetism',
    'Electric': 'World of pure electricity',
    'Nuclear': 'World of pure nuclear energy',
    'Chemical': 'World of pure chemistry',
    'Biological': 'World of pure biology',
    'Mechanical': 'World of pure mechanics',
    'Digital': 'World of pure digital technology',
    'Analog': 'World of pure analog technology',
    'Binary': 'World of pure binary',
    'Hexadecimal': 'World of pure hexadecimal',
    'Decimal': 'World of pure decimal',
    'Octal': 'World of pure octal',
    'Roman': 'World of pure Roman numerals',
    'Greek': 'World of pure Greek letters',
    'Cyrillic': 'World of pure Cyrillic letters',
    'Arabic': 'World of pure Arabic letters',
    'Chinese': 'World of pure Chinese characters',
    'Japanese': 'World of pure Japanese characters',
    'Korean': 'World of pure Korean characters',
    'Hindi': 'World of pure Hindi characters',
    'Hebrew': 'World of pure Hebrew letters',
    'Latin': 'World of pure Latin letters',
    'Sanskrit': 'World of pure Sanskrit',
    'Hieroglyphic': 'World of pure hieroglyphics',
    'Cuneiform': 'World of pure cuneiform',
    'Runes': 'World of pure runes',
    'Ogham': 'World of pure Ogham',
    'Braille': 'World of pure Braille',
    'Morse': 'World of pure Morse code',
    'Semaphore': 'World of pure semaphore',
    'Flag': 'World of pure flag signals',
    'Smoke': 'World of pure smoke signals',
    'Mirror': 'World of pure mirror signals',
    'Laser': 'World of pure laser',
    'Radio': 'World of pure radio waves',
    'Microwave': 'World of pure microwaves',
    'Infrared': 'World of pure infrared',
    'Ultraviolet': 'World of pure ultraviolet',
    'X-Ray': 'World of pure X-rays',
    'Gamma': 'World of pure gamma rays',
    'Cosmic': 'World of pure cosmic rays',
    'Solar': 'World of pure solar energy',
    'Lunar': 'World of pure lunar energy',
    'Stellar': 'World of pure stellar energy',
    'Planetary': 'World of pure planetary energy',
    'Galactic': 'World of pure galactic energy',
    'Universal': 'World of pure universal energy',
    'Multiversal': 'World of pure multiversal energy',
    'Omniversal': 'World of pure omniversal energy',
    'Infinite': 'World of pure infinity',
    'Finite': 'World of pure finiteness',
    'Zero': 'World of pure nothingness',
    'One': 'World of pure oneness',
    'Pi': 'World of pure mathematical pi',
    'E': 'World of pure mathematical e',
    'Golden Ratio': 'World of pure golden ratio',
    'Fibonacci': 'World of pure Fibonacci sequence',
    'Prime': 'World of pure prime numbers',
    'Perfect': 'World of pure perfection',
    'Imperfect': 'World of pure imperfection',
    'Random': 'World of pure randomness',
    'Deterministic': 'World of pure determinism',
    'Probabilistic': 'World of pure probability',
    'Statistical': 'World of pure statistics',
    'Analytical': 'World of pure analysis',
    'Synthetic': 'World of pure synthesis',
    'Organic': 'World of pure organic matter',
    'Inorganic': 'World of pure inorganic matter',
    'Living': 'World of pure life',
    'Dead': 'World of pure death',
    'Undead': 'World between life and death',
    'Reborn': 'World that has been reborn',
    'Reincarnated': 'World that has been reincarnated',
    'Transformed': 'World that has been transformed',
    'Evolved': 'World that has evolved',
    'Devolved': 'World that has devolved',
    'Ascended': 'World that has ascended to higher power',
    'Descended': 'World that has descended to lower power',
    'Transcended': 'World that has transcended normal existence',
    'Immanent': 'World that exists within creation',
    'Transcendent': 'World that exists beyond creation',
    'Immanent-Transcendent': 'World that exists both within and beyond creation',
    'Omnipresent': 'World that exists everywhere',
    'Omniscient': 'World that knows everything',
    'Omnipotent': 'World that can do anything',
    'Omnibenevolent': 'World that is purely good',
    'Omnimalevolent': 'World that is purely evil',
    'Neutral': 'World that is neither good nor evil',
    'Chaotic': 'World that is purely chaotic',
    'Lawful': 'World that is purely lawful',
    'True Neutral': 'World that is perfectly balanced',
    'Chaotic Good': 'World that is chaotically good',
    'Chaotic Evil': 'World that is chaotically evil',
    'Lawful Good': 'World that is lawfully good',
    'Lawful Evil': 'World that is lawfully evil',
    'Neutral Good': 'World that is neutrally good',
    'Neutral Evil': 'World that is neutrally evil',
    'Chaotic Neutral': 'World that is chaotically neutral',
    'Lawful Neutral': 'World that is lawfully neutral'
  }
};

// Economic systems
const ECONOMIC_SYSTEMS = {
  'Capitalist': 'People own businesses and trade freely to make money',
  'Socialist': 'The government helps share resources and wealth fairly',
  'Mixed Economy': 'Combines both private business and government help',
  'Communist': 'The government owns everything and shares it equally',
  'Mercantilist': 'Focuses on trade and building up money through exports',
  'Feudal': 'Landowners control resources and people work for them',
  'Tribal': 'Resources are shared within family and tribal groups',
  'Agrarian': 'Mostly farming and agriculture-based economy',
  'Industrial': 'Focuses on making things in factories',
  'Service-Based': 'Mostly provides services like shops and offices',
  'Resource-Based': 'Makes money from natural resources like oil or minerals',
  'Tourism-Based': 'Makes money from visitors and travelers',
  'Fishing-Based': 'Makes money from fishing and sea resources',
  'Mining-Based': 'Makes money from digging up valuable minerals',
  'Forestry-Based': 'Makes money from cutting down trees and wood products'
};

const EditNationModal: React.FC<EditNationModalProps> = ({ nation, onNationUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [availableNations, setAvailableNations] = useState<string[]>([]);
  const [selectedRulingCategory, setSelectedRulingCategory] = useState<string>('');
  const [selectedGovernmentCategory, setSelectedGovernmentCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    government: nation.government || 'Monarchy',
    customGovernment: '',
    rulingEntity: 'Monarch',
    governmentSystem: 'Monarchy',
    economicSystem: 'Capitalist',
    vassalOf: nation.vassal_of || 'independent',
    lore: nation.lore || '',
    themeColor: nation.theme_color || 'text-blue-500'
  });
  const { toast } = useToast();

  // Fetch available nations for subordinate selection
  useEffect(() => {
    const fetchNations = async () => {
      try {
        const { data: nations, error } = await supabase
          .from('nations')
          .select('name')
          .order('name');
        
        if (error) {
          console.error('Error fetching nations:', error);
          return;
        }
        
        if (nations) {
          const nationNames = nations
            .map(n => n.name)
            .filter(name => name !== nation.name); // Exclude current nation
          setAvailableNations(nationNames);
        }
      } catch (error) {
        console.error('Error fetching nations:', error);
      }
    };

    if (isOpen) {
      fetchNations();
    }
  }, [isOpen, nation.name]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const governmentValue = formData.government === 'Custom' 
        ? formData.customGovernment 
        : formData.government;

      // Validate custom government input
      if (formData.government === 'Custom' && !formData.customGovernment.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a custom government type.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('Submitting form data:', {
        government: governmentValue,
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        lore: formData.lore,
        theme_color: formData.themeColor
      });

      const { error } = await supabase
        .from('nations')
        .update({
          government: governmentValue,
          ruling_entity: formData.rulingEntity,
          government_system: formData.governmentSystem,
          economic_system: formData.economicSystem,
          vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
          lore: formData.lore,
          theme_color: formData.themeColor,
          updated_at: new Date().toISOString()
        } as any)
        .eq('name', nation.name);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update the local nation object
      const updatedNation = {
        ...nation,
        government: governmentValue,
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        lore: formData.lore,
        theme_color: formData.themeColor
      };

      console.log('Updated nation object:', updatedNation);

      onNationUpdated(updatedNation);
      toast({
        title: "Success",
        description: "Nation information updated successfully!",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating nation:', error);
      toast({
        title: "Error",
        description: "Failed to update nation information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setFormData({
        government: nation.government || 'Monarchy',
        customGovernment: '',
        rulingEntity: 'Monarch',
        governmentSystem: 'Monarchy',
        economicSystem: 'Capitalist',
        vassalOf: nation.vassal_of || 'independent',
        lore: nation.lore || '',
        themeColor: nation.theme_color || 'text-blue-500' // Reset theme color
      });

    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Nation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit {nation.name}
          </DialogTitle>
          <DialogDescription>
            Modify your nation's government type, economic system, vassal status, and lore. The description is automatically set by the game and cannot be edited.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Note:</p>
              <p>The nation description is automatically set by the game and cannot be edited. You can only modify the government type, economic system, vassal status, and lore.</p>
            </div>
          </div>

          {/* Ruling Entity Selection */}
          <div className="space-y-2">
            <Label htmlFor="rulingEntity">Ruling Entity</Label>
            
            {/* Category Selection */}
            <Select 
              value={selectedRulingCategory} 
              onValueChange={(value) => {
                setSelectedRulingCategory(value);
                setFormData(prev => ({ ...prev, rulingEntity: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ruling entity category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(RULING_ENTITY_CATEGORIES).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity Selection within Category */}
            {selectedRulingCategory && (
              <Select 
                value={formData.rulingEntity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, rulingEntity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific ruling entity" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RULING_ENTITY_CATEGORIES[selectedRulingCategory as keyof typeof RULING_ENTITY_CATEGORIES]).map(([entity, description]) => (
                    <SelectItem key={entity} value={entity}>
                      <div className="flex items-center justify-between w-full">
                        <span>{entity}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={-1} className="focus:outline-none ml-2">
                                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Government System Selection */}
          <div className="space-y-2">
            <Label htmlFor="governmentSystem">Government System</Label>
            
            {/* Category Selection */}
            <Select 
              value={selectedGovernmentCategory} 
              onValueChange={(value) => {
                setSelectedGovernmentCategory(value);
                setFormData(prev => ({ ...prev, governmentSystem: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select government system category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(GOVERNMENT_SYSTEM_CATEGORIES).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* System Selection within Category */}
            {selectedGovernmentCategory && (
              <Select 
                value={formData.governmentSystem} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, governmentSystem: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific government system" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOVERNMENT_SYSTEM_CATEGORIES[selectedGovernmentCategory as keyof typeof GOVERNMENT_SYSTEM_CATEGORIES]).map(([system, description]) => (
                    <SelectItem key={system} value={system}>
                      <div className="flex items-center justify-between w-full">
                        <span>{system}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={-1} className="focus:outline-none ml-2">
                                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Economic System Selection */}
          <div className="space-y-2">
            <Label htmlFor="economicSystem">Economic System</Label>
            <Select 
              value={formData.economicSystem} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, economicSystem: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select economic system" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ECONOMIC_SYSTEMS).map(([system, description]) => (
                  <SelectItem key={system} value={system}>
                    <div className="flex items-center justify-between w-full">
                      <span>{system}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={-1} className="focus:outline-none ml-2">
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Color Selection */}
          <div className="space-y-2">
            <Label htmlFor="themeColor">Theme Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {[
                { name: 'Red', value: 'text-red-500', border: 'border-red-500' },
                { name: 'Orange', value: 'text-orange-500', border: 'border-orange-500' },
                { name: 'Yellow', value: 'text-yellow-500', border: 'border-yellow-500' },
                { name: 'Green', value: 'text-green-500', border: 'border-green-500' },
                { name: 'Blue', value: 'text-blue-500', border: 'border-blue-500' },
                { name: 'Purple', value: 'text-purple-500', border: 'border-purple-500' },
                { name: 'Pink', value: 'text-pink-500', border: 'border-pink-500' },
                { name: 'Gray', value: 'text-gray-500', border: 'border-gray-500' },
                { name: 'Indigo', value: 'text-indigo-500', border: 'border-indigo-500' },
                { name: 'Teal', value: 'text-teal-500', border: 'border-teal-500' },
                { name: 'Emerald', value: 'text-emerald-500', border: 'border-emerald-500' },
                { name: 'Rose', value: 'text-rose-500', border: 'border-rose-500' },
                { name: 'Amber', value: 'text-amber-500', border: 'border-amber-500' },
                { name: 'Lime', value: 'text-lime-500', border: 'border-lime-500' },
                { name: 'Cyan', value: 'text-cyan-500', border: 'border-cyan-500' },
                { name: 'Violet', value: 'text-violet-500', border: 'border-violet-500' }
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, themeColor: color.value }))}
                  className={`w-8 h-8 rounded-full ${color.border} border-2 flex items-center justify-center transition-all ${
                    formData.themeColor === color.value 
                      ? 'scale-110 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  title={color.name}
                >
                  <div className={`w-4 h-4 rounded-full ${color.value.replace('text-', 'bg-')}`}></div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a theme color for your nation. This will be used for the crown icon and other decorative elements.
            </p>
          </div>

          {/* Subordinate Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="vassalOf">Subordinate Status</Label>
            <Select 
              value={formData.vassalOf} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, vassalOf: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select if this nation is subordinate to another" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent Nation (Not subordinate)</SelectItem>
                {availableNations.map(nationName => (
                  <SelectItem key={nationName} value={nationName}>
                    Subordinate to {nationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              A subordinate nation is under the influence or control of a larger nation, while maintaining some independence.
            </p>
          </div>

          {/* Nation Lore */}
          <div className="space-y-2">
            <Label htmlFor="lore">Lore</Label>
            <Textarea
              id="lore"
              value={formData.lore}
              onChange={(e) => setFormData(prev => ({ ...prev, lore: e.target.value }))}
              placeholder="The story and history of your nation..."
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Share the rich history, traditions, and stories that make your nation unique.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNationModal;
