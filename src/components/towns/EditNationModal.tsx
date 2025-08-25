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
import { useAuth } from '@/hooks/useAuth';

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
    'Regent': 'Temporary ruler while monarch is unable to rule',
    'Jarl': 'Norse noble ruler, equivalent to earl or duke',
    'Hersir': 'Norse military leader and landowner',
    'Lendmann': 'Norwegian royal official and landowner',
    'Stallare': 'Swedish royal official and commander',
    'Hirdmann': 'Member of Norwegian royal household',
    'Skutilsvein': 'Norse royal servant and official'
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
    'Mayor': 'Elected leader of a city',
    'Storting Representative': 'Member of Norwegian parliament',
    'Riksdag Member': 'Member of Swedish parliament',
    'Folketing Member': 'Member of Danish parliament',
    'Althing Member': 'Member of Icelandic parliament',
    'Eduskunta Member': 'Member of Finnish parliament'
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
    'Knesset': 'Israeli parliament',
    'Thing': 'Ancient Norse assembly and court',
    'Althing': 'Icelandic parliament, oldest in the world',
    'Storting': 'Norwegian parliament',
    'Riksdag': 'Swedish parliament',
    'Folketing': 'Danish parliament',
    'Eduskunta': 'Finnish parliament',
    'Lagting': 'Norwegian upper house (1814-2009)',
    'Odelsting': 'Norwegian lower house (1814-2009)',
    'Landsting': 'Swedish upper house (1866-1970)',
    'Andra Kammaren': 'Swedish lower house (1866-1970)',
    'Första Kammaren': 'Swedish upper house (1866-1970)'
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
    'Caesar': 'Roman military and political leader',
    'Hersir': 'Norse military leader and landowner',
    'Stallare': 'Swedish royal official and commander',
    'Hirdmann': 'Member of Norwegian royal household',
    'Skutilsvein': 'Norse royal servant and official',
    'Jarl': 'Norse noble ruler and military leader',
    'Viking Captain': 'Norse sea captain and raider',
    'Berserker Chief': 'Norse warrior leader',
    'Shield Maiden': 'Norse female warrior leader',
    'Valkyrie': 'Norse female warrior and chooser of the slain',
    'Einherjar': 'Norse warrior chosen for Valhalla'
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
    'Guru': 'Spiritual teacher who rules',
    'Gothi': 'Norse pagan priest and chieftain',
    'Völva': 'Norse female seer and prophetess',
    'Seiðkona': 'Norse female practitioner of magic',
    'Runemaster': 'Norse master of runic magic',
    'Thing Priest': 'Norse priest who presides over assemblies',
    'Temple Guardian': 'Guardian of Norse temples and sacred sites'
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
    'Saint': 'A holy figure who rules through divine favor',
    'Skald': 'Norse poet and storyteller who rules through words',
    'Runemaster': 'Norse master of runic magic and divination',
    'Völva': 'Norse female seer and prophetess',
    'Gothi': 'Norse pagan priest and chieftain',
    'Seiðkona': 'Norse female practitioner of magic',
    'Berserker': 'Norse warrior who fights in a trance-like state',
    'Valkyrie': 'Norse female warrior and chooser of the slain',
    'Einherjar': 'Norse warrior chosen for Valhalla',
    'Dís': 'Norse female spirit or goddess',
    'Norn': 'Norse fate goddess who weaves destiny',
    'Vættir': 'Norse nature spirits and guardians'
  }
};

interface EditNationModalProps {
  nation: SupabaseNationData;
  onNationUpdated: (updatedNation: SupabaseNationData) => void;
}

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
    'Kalmar Union': 'Medieval union of Denmark, Norway, and Sweden',
    'Swedish Empire': 'Swedish imperial expansion in the Baltic',
    'Danish Empire': 'Danish imperial expansion in the North Sea',
    'Norwegian Empire': 'Norwegian imperial expansion in the Atlantic',
    'Finnish Grand Duchy': 'Finnish autonomy under Russian rule',
    'Icelandic Commonwealth': 'Medieval Icelandic republic and assembly'
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
    'Educational Democracy': 'Democratic governance of education',
    'Nordic Democracy': 'Democratic system based on Nordic welfare model',
    'Scandinavian Democracy': 'Democratic system emphasizing social equality',
    'Nordic Council Democracy': 'Democratic cooperation between Nordic countries',
    'Baltic Democracy': 'Democratic system in Baltic Sea region',
    'Arctic Democracy': 'Democratic governance in Arctic regions'
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
    'Digital Republic': 'Republic using digital governance',
    'Nordic Republic': 'Republican system based on Nordic values',
    'Scandinavian Republic': 'Republican system emphasizing equality and welfare',
    'Baltic Republic': 'Republican system in Baltic Sea region',
    'Arctic Republic': 'Republican governance in Arctic regions',
    'Nordic Union Republic': 'Republican system uniting Nordic countries'
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
    'Offensive Alliance': 'Countries that agree to attack together',
    'Nordic Union': 'Union of Nordic countries with shared governance',
    'Scandinavian Union': 'Union of Scandinavian countries',
    'Baltic Union': 'Union of Baltic Sea countries',
    'Arctic Union': 'Union of Arctic region countries',
    'Kalmar Union': 'Historical union of Denmark, Norway, and Sweden',
    'Nordic Council': 'Cooperation organization of Nordic countries',
    'Baltic Assembly': 'Cooperation organization of Baltic countries',
    'Arctic Council': 'Cooperation organization of Arctic countries'
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
    'Protectorate': 'State protected by another state',
    'Nordic City-State': 'Independent Nordic city with its own government',
    'Scandinavian City-State': 'Independent Scandinavian city with its own government',
    'Baltic City-State': 'Independent Baltic city with its own government',
    'Arctic City-State': 'Independent Arctic city with its own government',
    'Nordic Microstate': 'Very small independent Nordic state',
    'Scandinavian Microstate': 'Very small independent Scandinavian state',
    'Baltic Microstate': 'Very small independent Baltic state',
    'Arctic Microstate': 'Very small independent Arctic state'
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
    'Security State': 'The government focuses on security and watching people',
    'Nordic Defense Union': 'Military alliance of Nordic countries',
    'Scandinavian Defense Union': 'Military alliance of Scandinavian countries',
    'Baltic Defense Union': 'Military alliance of Baltic countries',
    'Arctic Defense Union': 'Military alliance of Arctic countries',
    'Nordic Security Council': 'Security cooperation of Nordic countries',
    'Scandinavian Security Council': 'Security cooperation of Scandinavian countries',
    'Baltic Security Council': 'Security cooperation of Baltic countries',
    'Arctic Security Council': 'Security cooperation of Arctic countries'
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
    'Technocracy': 'Technical experts rule the country',
    'Nordic Oligarchy': 'Small group of Nordic elites rule the country',
    'Scandinavian Oligarchy': 'Small group of Scandinavian elites rule the country',
    'Baltic Oligarchy': 'Small group of Baltic elites rule the country',
    'Arctic Oligarchy': 'Small group of Arctic elites rule the country',
    'Nordic Meritocracy': 'Nordic people with best skills rule the country',
    'Scandinavian Meritocracy': 'Scandinavian people with best skills rule the country',
    'Baltic Meritocracy': 'Baltic people with best skills rule the country',
    'Arctic Meritocracy': 'Arctic people with best skills rule the country'
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
    'Utopian State': 'A state based on an ideal social model',
    'Thing System': 'Ancient Norse assembly-based governance',
    'Althing System': 'Icelandic assembly-based governance',
    'Storting System': 'Norwegian parliamentary governance',
    'Riksdag System': 'Swedish parliamentary governance',
    'Folketing System': 'Danish parliamentary governance',
    'Eduskunta System': 'Finnish parliamentary governance',
    'Nordic Tribal Confederation': 'Confederation of Nordic tribes',
    'Scandinavian Tribal Confederation': 'Confederation of Scandinavian tribes',
    'Baltic Tribal Confederation': 'Confederation of Baltic tribes',
    'Arctic Tribal Confederation': 'Confederation of Arctic tribes',
    'Nordic Guild System': 'Nordic society organized by professional groups',
    'Scandinavian Guild System': 'Scandinavian society organized by professional groups',
    'Baltic Guild System': 'Baltic society organized by professional groups',
    'Arctic Guild System': 'Arctic society organized by professional groups'
  }
};

// Economic systems
const ECONOMIC_SYSTEMS = {
  'Anarchy': 'No centralized authority, individuals manage their own resources',
  'Capitalism': 'Private ownership of means of production, free market competition',
  'Colonialism': 'Economic system based on extracting resources from controlled territories',
  'Communism': 'Collective ownership of means of production, planned economy',
  'Corporatism': 'Economic system organized by corporate groups representing economic interests',
  'Dirigisme': 'State-directed capitalism with government intervention in the economy',
  'Distributism': 'Widespread ownership of property and means of production',
  'Feudalism': 'Land-based economy with hierarchical social structure',
  'Hydraulic despotism': 'Centralized control of water resources and agriculture',
  'Inclusive democracy': 'Economic democracy with worker and community control',
  'Keynesian economics': 'Government intervention to manage economic cycles',
  'Market economy': 'Decentralized economic decisions through supply and demand',
  'Mercantilism': 'State-controlled trade to accumulate wealth and power',
  'Mutualism': 'Voluntary cooperation and mutual aid in economic relations',
  'National syndicalism': 'Nationalist form of syndicalism with worker control',
  'Network economy': 'Economic activity organized through digital networks',
  'Non-property system': 'Resources shared without individual ownership',
  'Palace economy': 'Centralized redistribution of goods and services',
  'Participatory economy': 'Democratic economic planning and decision-making',
  'Potlatch': 'Gift-giving economy based on social status and reciprocity',
  'Progressive utilization theory (PROUTist economy)': 'Economic system based on maximum utilization of resources',
  'Proprietism': 'Private property rights with social responsibility',
  'Resource-based economy': 'Economy based on natural resource availability',
  'Social democracy': 'Mixed economy with strong social welfare programs',
  'Social Credit': 'Economic theory focusing on consumer purchasing power',
  'Socialism': 'Social ownership of means of production and distribution',
  'Statism': 'Strong state control over economic activity',
  'Workers\' self-management': 'Workers control and manage their workplaces'
};

const EditNationModal: React.FC<EditNationModalProps> = ({ nation, onNationUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();

  const [availableNations, setAvailableNations] = useState<string[]>([]);
  const [selectedRulingCategory, setSelectedRulingCategory] = useState<string>('');
  const [selectedGovernmentCategory, setSelectedGovernmentCategory] = useState<string>('');

  // Initialize selected categories based on current values
  useEffect(() => {
    if (nation.ruling_entity) {
      // Find which category contains the current ruling entity
      for (const [category, entities] of Object.entries(RULING_ENTITY_CATEGORIES)) {
        if (Object.keys(entities).includes(nation.ruling_entity)) {
          setSelectedRulingCategory(category);
          break;
        }
      }
    }
    
    if (nation.government_system) {
      // Find which category contains the current government system
      for (const [category, systems] of Object.entries(GOVERNMENT_SYSTEM_CATEGORIES)) {
        if (Object.keys(systems).includes(nation.government_system)) {
          setSelectedGovernmentCategory(category);
          break;
        }
      }
    }
  }, [nation.ruling_entity, nation.government_system]);

  const [formData, setFormData] = useState({
    rulingEntity: nation.ruling_entity || 'Monarch',
    governmentSystem: nation.government_system || 'Monarchy',
    economicSystem: nation.economic_system || 'Capitalism',
    vassalOf: nation.vassal_of || 'independent',
    subordinateType: 'vassal',
    lore: nation.lore || '',
    themeColor: nation.theme_color || '#3b82f6',
    bannerUrl: nation.banner_image_url || '',
    bannerColor: nation.color || '#1e40af',
    bannerText: nation.banner_text || '',
    bannerTextColor: nation.banner_text_color || '#ffffff',
    bannerTextSize: nation.banner_text_size || 16
  });

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);
  const { toast } = useToast();

  // Add debugging for authentication
  useEffect(() => {
    if (isOpen) {
      console.log('EditNationModal opened for nation:', nation);
      console.log('Current user profile:', profile);
      console.log('Nation leader_name:', nation.leader_name);
      console.log('User full_name:', profile?.full_name);
      console.log('User role:', profile?.role);
      console.log('Can user edit this nation?', 
        profile?.role === 'admin' || 
        profile?.role === 'moderator' || 
        profile?.full_name === nation.leader_name
      );
    }
  }, [isOpen, nation, profile]);

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
      // Test database connection first
      console.log('Testing database connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('nations')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('Database connection failed:', connectionError);
        toast({
          title: "Database Connection Error",
          description: `Cannot connect to database: ${connectionError.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Database connection successful');

      // Check if user has permission to edit this nation
      const canEdit = profile?.role === 'admin' || 
                     profile?.role === 'moderator' || 
                     profile?.full_name === nation.leader_name;
      
      if (!canEdit) {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to edit this nation. Only nation leaders and staff can edit nation information.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!profile) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to edit nation information.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('User authentication check passed:', {
        userId: profile.id,
        userRole: profile.role,
        userFullName: profile.full_name,
        nationLeaderName: nation.leader_name,
        canEdit: canEdit
      });

      console.log('Submitting form data:', {
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        lore: formData.lore,
        theme_color: formData.themeColor,
        color: formData.bannerColor
      });

      console.log('Attempting to update nation:', nation.name);
      console.log('Update data:', {
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        lore: formData.lore,
        theme_color: formData.themeColor,
        updated_at: new Date().toISOString()
      });

      // Validate that required fields are set
      if (!formData.rulingEntity || !formData.governmentSystem || !formData.economicSystem) {
        console.error('Missing required fields:', {
          rulingEntity: formData.rulingEntity,
          governmentSystem: formData.governmentSystem,
          economicSystem: formData.economicSystem
        });
        toast({
          title: "Validation Error",
          description: "Please select all required fields (Ruling Entity, Government System, Economic System).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // All fields exist in the database, so we can update everything
      const updateData = {
        lore: formData.lore,
        color: formData.bannerColor,
        theme_color: formData.themeColor,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        banner_image_url: formData.bannerUrl || null,
        banner_style: 'solid',
        banner_pattern: 'none',
        banner_gradient: 'none',
        banner_gradient_colors: [],
        banner_opacity: 1.0,
        banner_height: 128,
        banner_text: formData.bannerText || null,
        banner_text_color: formData.bannerTextColor || '#ffffff',
        banner_text_size: formData.bannerTextSize || 16,
        banner_text_position: 'center',
        banner_text_style: 'normal',
        last_updated: new Date().toISOString()
      };

      console.log('Final update data being sent to database:', updateData);
      console.log('Form data values:', {
        rulingEntity: formData.rulingEntity,
        governmentSystem: formData.governmentSystem,
        economicSystem: formData.economicSystem,
        themeColor: formData.themeColor
      });
      console.log('Theme color being sent:', formData.themeColor);
      console.log('Original nation theme color:', nation.theme_color);
      console.log('Nation ID being used for update:', nation.id);
      console.log('Parsed nation ID:', parseInt(nation.id));

      // Use nation ID for the update query since that's the primary key
      console.log('About to execute database update...');
      
      // First, let's check if the fields exist in the database
      try {
        const { data: testData, error: testError } = await supabase
          .from('nations')
          .select('id, name, ruling_entity, government_system, economic_system, theme_color, color, lore')
          .eq('id', parseInt(nation.id))
          .single();
        
        console.log('Test query result:', { testData, testError });
        
        if (testError) {
          console.error('Test query failed:', testError);
          toast({
            title: "Database Error",
            description: `Failed to verify database fields: ${testError.message}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (!testData) {
          console.error('Nation not found in database');
          toast({
            title: "Database Error",
            description: "Nation not found in database",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log('Current database values:', testData);
        console.log('Fields being updated:', {
          ruling_entity: formData.rulingEntity,
          government_system: formData.governmentSystem,
          economic_system: formData.economicSystem,
          theme_color: formData.themeColor,
          lore: formData.lore,
          color: formData.bannerColor
        });
        
        // Check if the fields actually exist in the database
        console.log('Field existence check:', {
          has_ruling_entity: 'ruling_entity' in testData,
          has_government_system: 'government_system' in testData,
          has_economic_system: 'economic_system' in testData,
          has_theme_color: 'theme_color' in testData,
          has_lore: 'lore' in testData
        });
      } catch (testError) {
        console.error('Error during test query:', testError);
        toast({
          title: "Database Error",
          description: `Error during database test: ${testError}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('nations')
        .update(updateData as any)
        .eq('id', parseInt(nation.id))
        .select();

      console.log('Supabase response:', { data, error });
      console.log('Update query details:', {
        table: 'nations',
        id: parseInt(nation.id),
        updateData: updateData
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Log what was actually returned from the database
      if (data && data.length > 0) {
        console.log('Database returned updated nation:', data[0]);
        const updatedData = data[0] as any; // Type assertion since the fields are newly added
        console.log('Updated fields in database:', {
          ruling_entity: updatedData.ruling_entity,
          government_system: updatedData.government_system,
          economic_system: updatedData.economic_system,
          theme_color: updatedData.theme_color,
          lore: updatedData.lore,
          color: updatedData.color
        });
        
        // Check if the update actually changed the values
        console.log('Update verification:', {
          ruling_entity_changed: updatedData.ruling_entity === formData.rulingEntity,
          government_system_changed: updatedData.government_system === formData.governmentSystem,
          economic_system_changed: updatedData.economic_system === formData.economicSystem,
          theme_color_changed: updatedData.theme_color === formData.themeColor,
          lore_changed: updatedData.lore === formData.lore,
          color_changed: updatedData.color === formData.bannerColor
        });
      } else {
        console.error('No data returned from update query');
      }

      // Update the local nation object with all the new fields
      const updatedNation = {
        ...nation,
        lore: formData.lore,
        color: formData.bannerColor,
        theme_color: formData.themeColor,
        economic_system: formData.economicSystem,
        vassal_of: formData.vassalOf === 'independent' ? null : formData.vassalOf,
        ruling_entity: formData.rulingEntity,
        government_system: formData.governmentSystem,
        banner_image_url: formData.bannerUrl || null,
        banner_text: formData.bannerText || null,
        banner_text_color: formData.bannerTextColor || '#ffffff',
        banner_text_size: formData.bannerTextSize || 16
      };

      console.log('Updated nation object:', updatedNation);
      console.log('Theme color in updated nation:', updatedNation.theme_color);

      onNationUpdated(updatedNation);
      
      // Don't close the modal immediately - let the user see the changes
      // Only close if they explicitly want to
      console.log('Update successful, keeping modal open to show changes');
      
      // Update the local nation object to reflect changes in the current form
      Object.assign(nation, updatedNation);
      
      // Force a re-render of the form with the new values
      setFormData({
        rulingEntity: updatedNation.ruling_entity || 'Monarch',
        governmentSystem: updatedNation.government_system || 'Monarchy',
        economicSystem: updatedNation.economic_system || 'Capitalism',
        vassalOf: updatedNation.vassal_of || 'independent',
        subordinateType: 'vassal',
        lore: updatedNation.lore || '',
        themeColor: updatedNation.theme_color || '#3b82f6',
        bannerUrl: updatedNation.banner_image_url || '',
        bannerColor: updatedNation.color || '#1e40af',
        bannerText: updatedNation.banner_text || '',
        bannerTextColor: updatedNation.banner_text_color || '#ffffff',
        bannerTextSize: updatedNation.banner_text_size || 16
      });
      
      // Update the selected categories to match the new values
      if (updatedNation.ruling_entity) {
        for (const [category, entities] of Object.entries(RULING_ENTITY_CATEGORIES)) {
          if (Object.keys(entities).includes(updatedNation.ruling_entity)) {
            setSelectedRulingCategory(category);
            break;
          }
        }
      }
      
      if (updatedNation.government_system) {
        for (const [category, systems] of Object.entries(GOVERNMENT_SYSTEM_CATEGORIES)) {
          if (Object.keys(systems).includes(updatedNation.government_system)) {
            setSelectedGovernmentCategory(category);
            break;
          }
        }
      }
      
      // Don't close the modal - let user see the changes
      // setIsOpen(false);
      
      // Show a success message in the form
      toast({
        title: "Success!",
        description: "Your changes have been saved. The nation information has been updated successfully.",
      });
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
        rulingEntity: nation.ruling_entity || 'Monarch',
        governmentSystem: nation.government_system || 'Monarchy',
        economicSystem: nation.economic_system || 'Capitalism',
        vassalOf: nation.vassal_of || 'independent',
        subordinateType: 'vassal',
        lore: nation.lore || '',
        themeColor: nation.theme_color || '#3b82f6',
        bannerUrl: nation.banner_image_url || '',
        bannerColor: nation.color || '#1e40af',
        bannerText: nation.banner_text || '',
        bannerTextColor: nation.banner_text_color || '#ffffff',
        bannerTextSize: nation.banner_text_size || 16
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
            Modify your nation's economic system, vassal status, and lore. The description is automatically set by the game and cannot be edited.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Note:</p>
              <p>The nation description is automatically set by the game and cannot be edited. You can only modify the economic system, vassal status, and lore.</p>
              <p className="mt-2 text-orange-600 dark:text-orange-400"><strong>Required Fields:</strong> Ruling Entity, Government System, and Economic System must be selected.</p>
            </div>
          </div>

          {/* Ruling Entity Selection */}
          <div className="space-y-2">
            <Label htmlFor="rulingEntity">Ruling Entity *</Label>
            
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
                            <TooltipContent side="right" align="start" className="max-w-xs">
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
            <p className="text-sm text-muted-foreground">
              Current: {nation.ruling_entity || 'Not set'}
            </p>
          </div>

          {/* Government System Selection */}
          <div className="space-y-2">
            <Label htmlFor="governmentSystem">Government System *</Label>
            
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
                            <TooltipContent side="right" align="start" className="max-w-xs">
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
            <p className="text-sm text-muted-foreground">
              Current: {nation.government_system || 'Not set'}
            </p>
          </div>

          {/* Economic System Selection */}
          <div className="space-y-2">
            <Label htmlFor="economicSystem">Economic System *</Label>
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
                                                      <TooltipContent side="right" align="start" className="max-w-xs">
                              <p className="text-sm">{description}</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Current: {nation.economic_system || 'Not set'}
            </p>
          </div>

          {/* Theme Color Selection */}
          <div className="space-y-2">
            <Label htmlFor="themeColor">Theme Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="themeColor"
                type="color"
                value={formData.themeColor}
                onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                className="w-16 h-12 p-1 border-2 border-border rounded-lg cursor-pointer"
                title="Click to open color picker"
              />
              <div className="flex-1">
                <Input
                  type="text"
                  value={formData.themeColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                  placeholder="#3b82f6"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose any color from the full spectrum. This will be used for crown icons and decorative elements.
                </p>
              </div>
            </div>
            {/* Color Preview */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-border" 
                  style={{ backgroundColor: formData.themeColor }}
                />
                <span className="text-sm font-medium">Crown Icon Preview:</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center"
                  style={{ backgroundColor: formData.themeColor }}
                >
                  <span className="text-white text-xs">👑</span>
                </div>
                <span className="text-sm text-muted-foreground">This is how your crown will look</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current theme color: <span className="font-mono">{nation.theme_color || 'Not set'}</span>
            </p>
          </div>

          {/* Banner Customization */}
          <div className="space-y-4">
            <Label htmlFor="bannerColor">Banner Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="bannerColor"
                type="color"
                value={formData.bannerColor}
                onChange={(e) => setFormData(prev => ({ ...prev, bannerColor: e.target.value }))}
                className="w-16 h-12 p-1 border-2 border-border rounded-lg cursor-pointer"
                title="Click to open color picker"
              />
              <div className="flex-1">
                <Input
                  type="text"
                  value={formData.bannerColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, bannerColor: e.target.value }))}
                  placeholder="#1e40af"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose any color from the full spectrum. This will be used as the background color for the banner area.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current banner color: <span className="font-mono">{nation.color || 'Not set'}</span>
            </p>
            {/* Banner Color Preview */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded border border-border" 
                  style={{ backgroundColor: formData.bannerColor }}
                />
                <span className="text-sm font-medium">Banner Preview:</span>
              </div>
              <div 
                className="w-full h-16 rounded-lg border-2 border-border flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: formData.bannerColor }}
              >
                {formData.bannerText || 'Your Nation Banner'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This shows how your banner will look with the selected color
              </p>
            </div>
          </div>

          {/* Banner Image URL */}
          <div className="space-y-2">
            <Label htmlFor="bannerUrl">Banner Image URL (Optional)</Label>
            <Input
              id="bannerUrl"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={formData.bannerUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Provide a URL to a banner image for your nation. This will be displayed above the nation information on your nation card.
            </p>
            
            {/* Banner Preview */}
            {formData.bannerUrl && (
              <div className="mt-3 p-3 border rounded-lg bg-muted">
                <Label className="text-sm font-medium mb-2 block">Banner Preview:</Label>
                <div 
                  className="w-full h-20 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ 
                    backgroundColor: formData.bannerColor,
                    backgroundImage: `url(${formData.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!formData.bannerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                    <span className="text-center">Invalid image URL</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Banner Text Customization */}
          <div className="space-y-4">
            <Label htmlFor="bannerText">Banner Text (Optional)</Label>
            <Input
              id="bannerText"
              type="text"
              placeholder="Enter text to display on your banner"
              value={formData.bannerText}
              onChange={(e) => setFormData(prev => ({ ...prev, bannerText: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Add custom text to display on your nation banner. This will appear overlaid on the banner image or color.
            </p>
            
            {/* Banner Text Color */}
            <div className="space-y-2">
              <Label htmlFor="bannerTextColor">Banner Text Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="bannerTextColor"
                  type="color"
                  value={formData.bannerTextColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, bannerTextColor: e.target.value }))}
                  className="w-16 h-12 p-1 border-2 border-border rounded-lg cursor-pointer"
                  title="Click to open color picker"
                />
                <div className="flex-1">
                  <Input
                    type="text"
                    value={formData.bannerTextColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerTextColor: e.target.value }))}
                    placeholder="#ffffff"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose any color for your banner text. Make sure it contrasts well with your banner color.
                  </p>
                </div>
              </div>
              {/* Text Color Preview */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded border border-border" 
                    style={{ backgroundColor: formData.bannerTextColor }}
                  />
                  <span className="text-sm font-medium">Text Preview:</span>
                </div>
                <div 
                  className="w-full h-12 rounded-lg border-2 border-border flex items-center justify-center font-medium"
                  style={{ 
                    backgroundColor: formData.bannerColor,
                    color: formData.bannerTextColor
                  }}
                >
                  {formData.bannerText || 'Sample Text'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This shows how your text will look on the banner
                </p>
              </div>
            </div>
            
            {/* Banner Text Size */}
            <div className="space-y-2">
              <Label htmlFor="bannerTextSize">Banner Text Size</Label>
              <Select 
                value={formData.bannerTextSize.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bannerTextSize: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select text size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Small (12px)</SelectItem>
                  <SelectItem value="14">Medium (14px)</SelectItem>
                  <SelectItem value="16">Large (16px)</SelectItem>
                  <SelectItem value="18">Extra Large (18px)</SelectItem>
                  <SelectItem value="20">Huge (20px)</SelectItem>
                  <SelectItem value="24">Giant (24px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Values Display */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-sm">Current Nation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Ruling Entity:</span>
                <span className="ml-2 text-foreground">{nation.ruling_entity || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Government System:</span>
                <span className="ml-2 text-foreground">{nation.government_system || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Economic System:</span>
                <span className="ml-2 text-foreground">{nation.economic_system || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Vassal Status:</span>
                <span className="ml-2 text-foreground">{nation.vassal_of ? `Vassal of ${nation.vassal_of}` : 'Independent'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Theme Color:</span>
                <span className="ml-2 text-foreground">{nation.theme_color || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Banner Color:</span>
                <span className="ml-2 text-foreground">{nation.color || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Nation Emblem:</span>
                <span className="ml-2 text-foreground">{nation.image_url ? 'Set' : 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Banner Image:</span>
                <span className="ml-2 text-foreground">{nation.banner_image_url ? 'Set' : 'Not set'}</span>
              </div>
            </div>
            

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
            
            {/* Subordinate Type Selection - Only show when subordinate */}
            {formData.vassalOf !== 'independent' && (
              <div className="space-y-2">
                <Label htmlFor="subordinateType">Subordinate Type</Label>
                <Select 
                  value={formData.subordinateType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subordinateType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subordinate type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vassal">Vassal - Semi-independent under protection</SelectItem>
                    <SelectItem value="puppet">Puppet - Controlled by superior nation</SelectItem>
                    <SelectItem value="protectorate">Protectorate - Protected by superior nation</SelectItem>
                    <SelectItem value="union">Union - Part of a larger political union</SelectItem>
                    <SelectItem value="confederation">Confederation - Loose alliance with superior</SelectItem>
                    <SelectItem value="tributary">Tributary - Pays tribute to superior nation</SelectItem>
                    <SelectItem value="satellite">Satellite - Politically dependent on superior</SelectItem>
                    <SelectItem value="client">Client State - Economically dependent on superior</SelectItem>
                    <SelectItem value="march">March - Border territory under protection</SelectItem>
                    <SelectItem value="fief">Fief - Territory granted by superior nation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Define the nature of your subordinate relationship with {formData.vassalOf}.
                </p>
              </div>
            )}
            
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
              Close
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
