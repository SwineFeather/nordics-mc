import { 
  BookOpen, FileText, FolderOpen, Home, Settings, Users, MapPin, Crown, Building2,
  Globe, Flag, Shield, Sword, Heart, Star, Trophy, Award, Target, Zap, Flame,
  Leaf, Trees, Mountain, Droplets, Sun, Moon, Cloud, CloudRain, Snowflake, Wind,
  Code, Database, Server, Network, Lock, Key, Eye, EyeOff, Search, Filter,
  Plus, Minus, Edit, Trash, Copy, Link, ExternalLink, Download, Upload,
  Camera, Video, Music, Headphones, Gamepad2, Dice1, CreditCard,
  MessageSquare, Mail, Phone, Calendar, Clock, Timer,
  BarChart3, BarChart, PieChart, TrendingUp, TrendingDown, Activity,
  Compass, Navigation, Route, Map, Pin,
  Lightbulb, Brain, HelpCircle,
  Check, X, AlertTriangle, Info, CheckCircle, XCircle, Bug,
  Bot, Cpu, Binary,
  Palette, Brush,
  ShoppingCart, Store, ShoppingBag, Wallet, DollarSign, Coins,
  Utensils, Coffee, Cake, Candy, Wine, Beer,
  Car, Bike, Plane, Train, Ship, Rocket, Satellite, Ufo,
  GraduationCap, Building, Library, PenTool, Pencil, Ruler, Calculator,
  Stethoscope, UserCheck, Pill, Syringe,
  Factory, Warehouse,
  Sprout, Wheat, Flower, Seedling,
  Wrench, Hammer, Screwdriver, Drill, Saw, Nail,
  Sunrise, Sunset
} from 'lucide-react';

export const WIKI_ICONS: { [key: string]: any } = {
  // General
  'book-open': BookOpen,
  'file-text': FileText,
  'folder-open': FolderOpen,
  'home': Home,
  'settings': Settings,
  'users': Users,
  'map-pin': MapPin,
  'crown': Crown,
  'building': Building,
  'globe': Globe,
  'flag': Flag,
  'shield': Shield,
  'sword': Sword,
  'heart': Heart,
  'star': Star,
  'trophy': Trophy,
  'award': Award,
  'target': Target,
  'zap': Zap,
  'fire': Fire,
  
  // Nature
  'leaf': Leaf,
  'tree': Tree,
  'mountain': Mountain,
  'water': Water,
  'sun': Sun,
  'moon': Moon,
  'cloud': Cloud,
  'rain': Rain,
  'snow': Snow,
  'wind': Wind,
  
  // Technology
  'code': Code,
  'database': Database,
  'server': Server,
  'network': Network,
  'lock': Lock,
  'key': Key,
  'eye': Eye,
  'eye-off': EyeOff,
  'search': Search,
  'filter': Filter,
  
  // Actions
  'plus': Plus,
  'minus': Minus,
  'edit': Edit,
  'trash': Trash,
  'copy': Copy,
  'link': Link,
  'external-link': ExternalLink,
  'download': Download,
  'upload': Upload,
  
  // Media
  'camera': Camera,
  'video': Video,
  'music': Music,
  'headphones': Headphones,
  'gamepad': Gamepad,
  'dice': Dice,
  'cards': Cards,
  'chess': Chess,
  
  // Communication
  'message': Message,
  'mail': Mail,
  'phone': Phone,
  'video-call': VideoCall,
  'calendar': Calendar,
  'clock': Clock,
  'timer': Timer,
  'stopwatch': Stopwatch,
  
  // Analytics
  'chart': Chart,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'activity': Activity,
  
  // Navigation
  'compass': Compass,
  'navigation': Navigation,
  'route': Route,
  'map': Map,
  'location': Location,
  'pin': Pin,
  'marker': Marker,
  
  // Ideas
  'lightbulb': Lightbulb,
  'bulb': Bulb,
  'idea': Idea,
  'brain': Brain,
  'mind': Mind,
  'thought': Thought,
  'question': Question,
  'help': Help,
  
  // Status
  'check': Check,
  'x': X,
  'alert': Alert,
  'warning': Warning,
  'info': Info,
  'success': Success,
  'error': Error,
  'bug': Bug,
  
  // AI/Technology
  'robot': Robot,
  'ai': AI,
  'chip': Chip,
  'circuit': Circuit,
  'binary': Binary,
  'data': Data,
  'analytics': Analytics,
  
  // Creative
  'palette': Palette,
  'brush': Brush,
  'paint': Paint,
  'art': Art,
  'design': Design,
  'creative': Creative,
  'color': Color,
  
  // Commerce
  'shopping': Shopping,
  'store': Store,
  'cart': Cart,
  'bag': Bag,
  'wallet': Wallet,
  'money': Money,
  'coin': Coin,
  'dollar': Dollar,
  
  // Food
  'food': Food,
  'coffee': Coffee,
  'pizza': Pizza,
  'burger': Burger,
  'cake': Cake,
  'candy': Candy,
  'wine': Wine,
  'beer': Beer,
  
  // Sports
  'sport': Sport,
  'football': Football,
  'basketball': Basketball,
  'tennis': Tennis,
  'golf': Golf,
  'swimming': Swimming,
  'running': Running,
  
  // Transportation
  'car': Car,
  'bike': Bike,
  'plane': Plane,
  'train': Train,
  'ship': Ship,
  'rocket': Rocket,
  'satellite': Satellite,
  'ufo': UFO,
  
  // Education
  'school': School,
  'university': University,
  'library': Library,
  'book': Book,
  'pen': Pen,
  'pencil': Pencil,
  'ruler': Ruler,
  'calculator': Calculator,
  
  // Health
  'hospital': Hospital,
  'doctor': Doctor,
  'nurse': Nurse,
  'medicine': Medicine,
  'pill': Pill,
  'syringe': Syringe,
  'heartbeat': Heartbeat,
  
  // Buildings
  'house': House,
  'building': Building,
  'office': Office,
  'factory': Factory,
  'warehouse': Warehouse,
  'shop': Shop,
  'restaurant': Restaurant,
  
  // Agriculture
  'garden': Garden,
  'farm': Farm,
  'plant': Plant,
  'flower': Flower,
  'seed': Seed,
  'growth': Growth,
  'harvest': Harvest,
  
  // Tools
  'tool': Tool,
  'hammer': Hammer,
  'wrench': Wrench,
  'screwdriver': Screwdriver,
  'drill': Drill,
  'saw': Saw,
  'nail': Nail,
  
  // Time
  'light': Light,
  'dark': Dark,
  'day': Day,
  'night': Night,
  'dawn': Dawn,
  'dusk': Dusk,
  'sunset': Sunset,
  'sunrise': Sunrise,
};

export const WIKI_COLORS = {
  // Primary Colors
  'blue': { name: 'Blue', value: '#3b82f6', category: 'primary' },
  'indigo': { name: 'Indigo', value: '#6366f1', category: 'primary' },
  'purple': { name: 'Purple', value: '#8b5cf6', category: 'primary' },
  'pink': { name: 'Pink', value: '#ec4899', category: 'primary' },
  'red': { name: 'Red', value: '#ef4444', category: 'primary' },
  'orange': { name: 'Orange', value: '#f97316', category: 'primary' },
  'yellow': { name: 'Yellow', value: '#eab308', category: 'primary' },
  'lime': { name: 'Lime', value: '#84cc16', category: 'primary' },
  'green': { name: 'Green', value: '#22c55e', category: 'primary' },
  'emerald': { name: 'Emerald', value: '#10b981', category: 'primary' },
  'teal': { name: 'Teal', value: '#14b8a6', category: 'primary' },
  'cyan': { name: 'Cyan', value: '#06b6d4', category: 'primary' },
  
  // Secondary Colors
  'slate': { name: 'Slate', value: '#64748b', category: 'secondary' },
  'gray': { name: 'Gray', value: '#6b7280', category: 'secondary' },
  'zinc': { name: 'Zinc', value: '#71717a', category: 'secondary' },
  'neutral': { name: 'Neutral', value: '#737373', category: 'secondary' },
  'stone': { name: 'Stone', value: '#78716c', category: 'secondary' },
  
  // Accent Colors
  'rose': { name: 'Rose', value: '#f43f5e', category: 'accent' },
  'amber': { name: 'Amber', value: '#f59e0b', category: 'accent' },
  'violet': { name: 'Violet', value: '#7c3aed', category: 'accent' },
  'fuchsia': { name: 'Fuchsia', value: '#d946ef', category: 'accent' },
  'sky': { name: 'Sky', value: '#0ea5e9', category: 'accent' },
  
  // Neutral Colors
  'white': { name: 'White', value: '#ffffff', category: 'neutral' },
  'black': { name: 'Black', value: '#000000', category: 'neutral' },
  'transparent': { name: 'Transparent', value: 'transparent', category: 'neutral' },
  
  // Semantic Colors
  'success': { name: 'Success', value: '#10b981', category: 'semantic' },
  'warning': { name: 'Warning', value: '#f59e0b', category: 'semantic' },
  'error': { name: 'Error', value: '#ef4444', category: 'semantic' },
  'info': { name: 'Info', value: '#3b82f6', category: 'semantic' },
};

export const getIconComponent = (iconName: string) => {
  return WIKI_ICONS[iconName] || FileText;
};

export const getColorValue = (colorName: string) => {
  return WIKI_COLORS[colorName as keyof typeof WIKI_COLORS]?.value || '#6b7280';
};

export const getColorName = (colorName: string) => {
  return WIKI_COLORS[colorName as keyof typeof WIKI_COLORS]?.name || 'Gray';
};

export const getIconCategories = () => {
  const categories = {
    general: ['book-open', 'file-text', 'folder-open', 'home', 'settings', 'users'],
    navigation: ['map-pin', 'globe', 'compass', 'navigation', 'route', 'map'],
    content: ['file-text', 'book-open', 'edit', 'copy', 'link', 'external-link'],
    media: ['camera', 'video', 'music', 'headphones', 'gamepad', 'dice'],
    communication: ['message', 'mail', 'phone', 'video-call', 'calendar', 'clock'],
    development: ['code', 'database', 'server', 'network', 'lock', 'key'],
    gaming: ['gamepad', 'dice', 'cards', 'chess', 'trophy', 'award'],
  };
  return categories;
};

export const getColorCategories = () => {
  const categories = {
    primary: ['blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan'],
    secondary: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
    accent: ['rose', 'amber', 'violet', 'fuchsia', 'sky'],
    neutral: ['white', 'black', 'transparent'],
    semantic: ['success', 'warning', 'error', 'info'],
  };
  return categories;
}; 