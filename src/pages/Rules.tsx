import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  UserCheck,
  Sword,
  Coins,
  Trophy,
  Settings,
  Shield,
  Users,
  MessageSquare,
  Hammer,
  Crown,
  Info,
  AlertTriangle,
  Gavel
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from 'react';

const Rules = () => {
  const [activeTab, setActiveTab] = useState('cheating');
  const ruleCategories = [
    {
      id: 'cheating',
      title: 'Cheating & Technical Issues',
      icon: Shield,
      color: 'text-primary',
      rules: [
        { id: '1.1', text: 'Use of Cheats', severity: 'severe', description: 'Those who use any form of cheats, mods, or programs that provide unfair advantages in the game will be convicted of cheating. This includes, but is not limited to, resource and texture packs that conceal certain blocks, speed and flight cheats, and x-ray. Those caught using these will face severe penalties.' },
        { id: '1.1.1', text: 'Unauthorized Automation', severity: 'severe', description: 'Those who use advanced functions to automatically create mouse clicks, movements, keyboard presses, or any other form of automated behavior that may provide advantages will be convicted of unauthorized automation.' },
        { id: '1.2', text: 'Assisting in Cheating', severity: 'moderate', description: 'Those who collaborate or trade with players where it is evident that the other player is breaking the prohibition in the previous section will be convicted of assisting in cheating.' },
        { id: '1.3', text: 'Exploitation of Bugs', severity: 'severe', description: 'Players who discover a bug or unintended feature must report it immediately to the server admins or moderators and must not use it for personal gain. Exploiting such issues, whether known or unknown to the public or the server staff, will result in severe penalties.' },
        { id: '1.4', text: 'Multi-Accounting', severity: 'moderate', description: 'Those who exploit multiple accounts to generate in-game currency on the server will be convicted of multi-accounting.' }
      ]
    },
    {
      id: 'behavior',
      title: 'Behaviors',
      icon: Users,
      color: 'text-primary',
      rules: [
        { id: '2.1', text: 'Deception', severity: 'moderate', description: 'Those who intentionally deceive or otherwise knowingly or negligently deceive other players will be convicted of deception. This also applies to those who unlawfully attempt to mimic another player\'s or moderator\'s identity or other characteristics on the server.' },
        { id: '2.2', text: 'Disobedience to Authority', severity: 'moderate', description: 'Anyone who does not follow the written instructions of the serving moderator is convicted of disobedience against the authorities. Even those who ignore a moderator are convicted of disobedience against the authorities. This applies to both Discord and the server.' },
        { id: '2.3', text: 'Incitement to Violate Rules', severity: 'moderate', description: 'Anyone who incites other players to commit a rule violation is judged for incitement to violate rules.' }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Channels',
      icon: MessageSquare,
      color: 'text-primary',
      rules: [
        { id: '3.1', text: 'Inappropriate Language Use', severity: 'moderate', description: 'Those who choose careless, inappropriate, unsuitable, or foreign words are judged for inappropriate language use. This includes, but is not limited to, chat, private messages, player names, naming of items, plots and towns, the website, and Discord.' },
        { id: '3.2', text: 'Provocation', severity: 'severe', description: 'Those who intentionally express xenophobia, hatred, threats, sexual innuendos, or revenge are judged for provocation. This includes, but is not limited to, expressions in writing and constructions.' },
        { id: '3.3', text: 'Spam', severity: 'minor', description: 'Anyone who repeats many similar messages in a short time or sends junk messages in any of Nordic\'s communication channels is judged for spam.' },
        { id: '3.4', text: 'Advertising Violation', severity: 'moderate', description: 'Those who advertise in order to invite players to another server are judged for advertising violation. Also, those who intentionally use Nordics for commercial purposes are judged for advertising violation.' },
        { id: '3.5', text: 'Unlawful Opposition', severity: 'moderate', description: 'Those who openly criticize the server, or its moderators in a non-constructive manner are judged for unlawful opposition.' },
        { id: '3.6', text: 'Personal Data Violation', severity: 'severe', description: 'Those who spread personal information are judged for personal data violation. This includes, among other things, social security numbers, home addresses, phone numbers, and accounts.' }
      ]
    },
    {
      id: 'buildings',
      title: 'Buildings & Griefing',
      icon: Hammer,
      color: 'text-primary',
      rules: [
        { id: '4.1', text: 'Vandalism', severity: 'moderate', description: 'Vandalism, including the placement of annoying blocks, large-scale griefing, and destructive use of fluids like lava and water, is generally prohibited. Destruction of unclaimed areas is allowed, but claimed towns and structures are protected from significant damage.' },
        { id: '4.2', text: 'Unauthorized Construction', severity: 'moderate', description: 'Intentionally constructs a trap, an arena, or other structure to harm or kill players in a public town. Those who construct something that meets the criteria for inappropriate language use or provocation are judged accordingly.' },
        { id: '4.3', text: 'Unauthorized Aircraft', severity: 'moderate', description: 'Anyone who builds or uses aircraft that do not meet the requirements for building aircraft is judged for building or using unauthorized aircraft.' },
        { id: '4.5.1', text: 'Large-scale Griefing', severity: 'moderate', description: 'Large-scale griefing within a town claim, or in the wilderness within 3 chunks of a claim, is disallowed unless done by the claim owner.' },
        { id: '4.5.2', text: 'Major Griefing', severity: 'severe', description: 'If staff determines that the amount of griefing is exceptionally extensive, it will be classified as Major Griefing and penalized more severely than standard griefing.' },
        { id: '4.5.3', text: 'Road Griefing', severity: 'moderate', description: 'Griefing overworld roads, including ice roads, rails, and superficial structures, is subject to player-driven resolution. Road owners noticing grief can request that admins identify the player responsible.' }
      ]
    },
    {
      id: 'redstone',
      title: 'Redstone Rules',
      icon: Zap,
      color: 'text-primary',
      rules: [
        { id: '4.6.1', text: 'Avoid Excessive Redstone Clocks', severity: 'moderate', description: 'Continuous redstone clocks or circuits that run indefinitely can cause significant lag. Players should design circuits that deactivate when not in use or utilize observer-based or delay-based timers to minimize server load.' },
        { id: '4.6.2', text: 'Use Chunk-Aligned Builds', severity: 'moderate', description: 'Each town allows only one large-scale farm (except for bamboo and kelp farms), limited to 5 by 5 chunks on a single layer. Redstone components must stay within 20% of the total farm area and operate solely on player-initiated power.' },
        { id: '4.6.3', text: 'Avoid Automatic Farms That Run Continuously', severity: 'moderate', description: 'Automatic farms that run continuously, especially those that generate large amounts of entities (e.g., mob farms, crop farms), should be limited or designed with on/off switches to reduce lag.' },
        { id: '4.6.4', text: 'No Exploitative Redstone', severity: 'severe', description: 'Any use of redstone intended to exploit game mechanics, duplicate items, or otherwise gain an unfair advantage is strictly prohibited. This includes machines designed to overload the server or bypass intended game limitations.' },
        { id: '4.6.5', text: 'Responsibility for Redstone Lag', severity: 'moderate', description: 'Players are responsible for ensuring their redstone builds do not negatively impact server performance. If a redstone creation is found to cause significant lag, players may be asked to modify or remove it.' }
      ]
    },
    {
      id: 'staff',
      title: 'Staff-related Rules',
      icon: UserCheck,
      color: 'text-primary',
      rules: [
        { id: '5.1', text: 'Compensation in Case of Death', severity: 'minor', description: 'Players are generally responsible for the risks they take in the game. Compensation is only considered for non-natural deaths caused by technical issues, such as server lag or glitches. Natural deaths, like monster attacks or falls, are not eligible for compensation.' },
        { id: '5.2.1', text: 'Items purchased accidentally with a value below 1k are not eligible for reimbursement', severity: 'minor', description: 'Staff will not reimburse low-value accidental purchases.' },
        { id: '5.2.2', text: 'Staff will not reimburse any item more than once', severity: 'minor', description: 'One-time reimbursement policy for all items.' },
        { id: '5.3.1', text: 'Staff must not use their in-game permissions for non-staff-related activities', severity: 'severe', description: 'Staff members are fully subject to all server rules and must not use permissions for non-staff activities that impact other players.' },
        { id: '5.3.2', text: 'Staff must not block communication without valid reason', severity: 'severe', description: 'Staff must not use their permissions on Discord or Minecraft to block or restrict communication for other community members without a valid reason.' },
        { id: '5.3.3', text: 'Staff must not misuse personal information', severity: 'grievous', description: 'Staff must not misuse personal information obtained through official staff channels to gain leverage, an unfair advantage, or for blackmail.' },
        { id: '5.3.4', text: 'Applying punishments without following guidelines is staff abuse', severity: 'severe', description: 'Applying a punishment that disregards the Statute of Limitations or internal staff guidelines is considered staff abuse.' },
        { id: '5.3.5', text: 'Using staff permissions without sufficient evidence is staff abuse', severity: 'severe', description: 'Using staff permissions to take action without sufficient evidence or for personal gain is considered staff abuse.' },
        { id: '5.3.6.1', text: 'Administrators may not lead nations or countries', severity: 'severe', description: 'Administrators are restricted from participating in geopolitics and may not lead nations or countries represented on the world map.' },
        { id: '5.3.6.2', text: 'Administrators may not engage in diplomacy', severity: 'severe', description: 'Administrators may not engage in diplomacy, such as signing documents, negotiating, or paying for assistance in wars.' },
        { id: '5.3.6.3', text: 'Administrators may not participate in war leadership', severity: 'severe', description: 'Administrators may not participate in war leadership. Admins involved in the war department or handling war tickets are not allowed to participate in wars at all.' },
        { id: '5.3.6.4', text: 'War staff may not act as players in war tickets', severity: 'severe', description: 'Staff members involved in the war department may not act as players in war tickets.' },
        { id: '5.3.6.5', text: 'Senior war staff restrictions', severity: 'severe', description: 'Senior war staff members, and war staff members at the Sr. Mod level or higher, are prohibited from leading nations or engaging in geopolitics, except in cases of defending a claim they own.' }
      ]
    },
    {
      id: 'ingame',
      title: 'In-game Rules (Fair Play)',
      icon: Sword,
      color: 'text-primary',
      rules: [
        { id: '7.1.1', text: 'Combat Logging', severity: 'moderate', description: 'Logging out during combat to avoid dying or losing items is prohibited. Players caught combat logging will face penalties.' },
        { id: '7.1.1.1', text: 'Waiting after combat timer expires', severity: 'minor', description: 'If a player logs off immediately after their combat timer expires and you were actively engaged with them in PvP, you are permitted to wait in the area where they logged off.' },
        { id: '7.1.1.2', text: 'No terrain modifications after combat', severity: 'minor', description: 'If waiting after combat timer expires, making any terrain modifications that would disadvantage the player upon relogging is not allowed.' },
        { id: '7.1.2', text: 'PvP is permitted', severity: 'minor', description: 'You are permitted to engage in PvP (player vs. player) combat, provided it does not violate any Harassment or Toxicity guidelines.' },
        { id: '7.1.3', text: 'No coordinated harassment', severity: 'severe', description: 'It is not allowed to make or attempt to make the game unplayable for another player through repeated, coordinated killing or harassment, whether by an individual or a group.' },
        { id: '7.1.4', text: 'No blocking access to Graves', severity: 'moderate', description: 'Blocking access to a player\'s Grave (a tomb-like block containing the inventory of deceased players), or camping the Grave and repeatedly killing them to prevent access, is not allowed.' },
        { id: '7.2.1', text: 'No inspiration from real-life atrocities', severity: 'grievous', description: 'You are not allowed to take inspiration from regimes, ideologies, groups, or governments that have committed real-life atrocities or were founded on such actions.' },
        { id: '7.2.2', text: 'No systematic slavery roleplay', severity: 'grievous', description: 'You are not allowed to roleplay systematic slavery.' },
        { id: '7.2.3', text: 'No slavery without consent', severity: 'severe', description: 'You are not allowed to roleplay the slavery of individuals unless there is informed Out-of-Character consent from the enslaved party/parties.' },
        { id: '7.2.4', text: 'No real-life regimes or religions', severity: 'severe', description: 'You are not allowed to roleplay as real-life regimes, governments, countries, peoples, or religions. Ideologies that are not banned are acceptable.' },
        { id: '7.2.5', text: 'No genocidal ideologies', severity: 'grievous', description: 'You are not allowed to roleplay historically genocidal ideologies, such as Fascism, Nazism, Maoism, Leninism/Stalinism, Falangism, Race Supremacy, etc.' },
        { id: '7.3.1', text: 'Cheating in Events', severity: 'severe', description: 'Any form of cheating or unfair advantage in server-hosted events or competitions is prohibited. This includes using unauthorized mods, exploiting event mechanics, or colluding with other players to manipulate outcomes.' },
        { id: '7.3.2', text: 'Event Disruption', severity: 'moderate', description: 'Intentionally disrupting server-events, including griefing event areas, sabotaging other players, or otherwise hindering the event\'s operation, is not allowed.' }
      ]
    },
    {
      id: 'economy',
      title: 'Economy and Trade',
      icon: Coins,
      color: 'text-primary',
      rules: [
        { id: '8.1', text: 'Exploiting Market Bugs', severity: 'severe', description: 'Exploiting bugs or glitches in the server\'s economy or trade systems to gain an unfair advantage is strictly prohibited. This includes, but is not limited to, item duplication or exploiting pricing errors.' },
        { id: '8.2.1', text: 'No deceptive shop chests', severity: 'moderate', description: 'Using the chest shop plugin to create shop chests that sell a different item than what is advertised.' },
        { id: '8.2.2', text: 'No renamed item scams', severity: 'moderate', description: 'Using plugins to trade or sell items that have been renamed to resemble another, more valuable item.' },
        { id: '8.2.3', text: 'No fake enchantments', severity: 'moderate', description: 'Using /rename, /lore, and /setloreline to create items that appear to have enchantments they don\'t actually possess. Creating "fake enchantments" is allowed, provided the enchantment has a color other than grey, doesn\'t share the exact name of any vanilla Minecraft enchantment, and is not presented as a genuine enchantment.' }
      ]
    },

    {
      id: 'plugins',
      title: 'Plugin-related Rules',
      icon: Settings,
      color: 'text-primary',
      rules: [
        { id: '10.1.1', text: 'Town and nation naming restrictions', severity: 'minor', description: 'In-real-life names or blatantly meme names may not be used as town or nation names. Admins reserve the right to rename towns that violate these rules. The main languages we will moderate for real-life names are: English, Swedish, Danish, Finnish, and Norwegian.' },
        { id: '10.1.2', text: 'Town ownership transfer rules', severity: 'minor', description: 'Claim ownership of a town can be transferred to a player if they are the only active member of their rank or higher. If there are other active players of the same or higher rank in the town, the player must obtain consent from them for the transfer.' },
        { id: '10.1.3', text: 'No alternate account abuse for town claims', severity: 'moderate', description: 'Using a large number of alternate accounts (roughly 3 or more) to increase the size of a town claim, especially for political advantages or town manipulation, is disallowed.' },
        { id: '10.1.4', text: 'Town coup restrictions', severity: 'moderate', description: 'Players are permitted to take over town claims using internal mechanics (such as betrayal by a town\'s mayor through unclaiming or removing players). However, executing a town coup with an alternate account, stealing player property is not allowed.' }
      ]
    },
    {
      id: 'website',
      title: 'Website & Platform Rules',
      icon: Info,
      color: 'text-primary',
      rules: [
        { id: '11.1', text: 'Company Rating & Review Integrity', severity: 'moderate', description: 'All company and business ratings must be based on genuine experiences and interactions. Creating multiple accounts to manipulate ratings, coordinating with others to inflate/deflate scores, using bots, leaving unrealistic ratings, trolling, or writing false/defamatory reviews is strictly prohibited. Ratings must reflect actual service quality and customer experience. Disputes should be resolved through proper channels rather than retaliatory reviews.' },
        { id: '11.2', text: 'Wiki Content Standards', severity: 'moderate', description: 'All wiki content must be accurate, relevant, and properly sourced. Vandalism, spam, inappropriate content, or deliberate misinformation is prohibited. Content should follow established formatting guidelines and be written in appropriate language.' },
        { id: '11.3', text: 'Wiki Collaboration Etiquette', severity: 'minor', description: 'When editing wiki pages, respect other contributors\' work. Use edit summaries, discuss major changes on talk pages, and avoid edit wars. Revert vandalism but discuss content disputes rather than repeatedly reverting legitimate edits.' },
        { id: '11.4', text: 'Forum Post Quality', severity: 'minor', description: 'Forum posts should contribute meaningfully to discussions. Low-effort posts, excessive bumping, thread necromancy, or derailing conversations with off-topic content is discouraged. Use appropriate categories and tags for your posts.' },
        { id: '11.5', text: 'Chat Behavior Standards', severity: 'moderate', description: 'Website chat systems must be used appropriately. Spam, harassment, inappropriate language, or disruptive behavior in chat channels is not allowed. Respect chat moderators and follow channel-specific rules.' },
        { id: '11.6', text: 'Profile Content Guidelines', severity: 'moderate', description: 'Player profiles and customizations must be appropriate and not contain offensive, discriminatory, or inappropriate content. Profile pictures, descriptions, and custom fields should follow community standards.' },
        { id: '11.7', text: 'No Impersonation or Deception', severity: 'severe', description: 'Creating fake profiles, impersonating staff members, or using deceptive usernames to mislead other users is strictly prohibited. All accounts must represent real individuals.' },
        { id: '11.8', text: 'Respect for User Privacy', severity: 'severe', description: 'Sharing personal information, private messages, or confidential data without consent is prohibited. Respect other users\' privacy settings and do not attempt to circumvent privacy controls.' },
        { id: '11.9', text: 'No Platform Abuse', severity: 'moderate', description: 'Exploiting website features, abusing API endpoints, or using automated tools to manipulate the platform is not allowed. Report bugs and technical issues rather than exploiting them.' },
        { id: '11.10', text: 'Content Moderation Compliance', severity: 'moderate', description: 'When content is removed or accounts are moderated, users must comply with the decisions. Attempting to circumvent bans, creating new accounts to avoid restrictions, or challenging moderation decisions inappropriately is not allowed.' },
        { id: '11.11', text: 'No Spam or Advertising Abuse', severity: 'moderate', description: 'Excessive posting of promotional content, repeated posting of the same message across multiple areas, or using the platform for unauthorized commercial purposes is not allowed. Advertising must be relevant and follow community guidelines.' },
        { id: '11.12', text: 'Respectful Dispute Resolution', severity: 'minor', description: 'When disagreements arise on the platform, resolve them respectfully through appropriate channels. Public arguments, personal attacks, or attempting to rally others against specific users or businesses is discouraged. Use moderation tools and support channels instead.' }
      ]
    }
  ];

  const staffInfo = {
    operators: {
      management: ['SwineFeather'],
      administrators: [],
      moderators: [],
      developers: ['MigningSM']
    },
    associates: {
      builders: [],
      helpers: ['Golli1432'],
      media: ['SwineFeather'],
      writers: ['_Bamson']
    },
    notableContributors: [
      'Bamson - Wiki writer',
      'Svardmastaren - Wiki writer & Developer',
      'Kevork - Management (Updates 1.0-1.1)',
      'CosmicWaffles - Map creator of 1.0',
      'VPswede - Admin and backend 1.0',
      'MigningSM - Builder 1.0, Developer from 1.3.9',
      'SwineFeather - Management (Updates 1.2-1.4)'
    ]
  };

  const severityInfo = {
    minor: {
      color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      tooltip: '1st: Warning, 2nd: Days ban, 3rd: Weeks ban, 4th: Permanent ban'
    },
    moderate: {
      color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      tooltip: '1st: Warning/ban, 2nd: Weeks ban, 3rd: Months ban, 4th: Permanent ban'
    },
    severe: {
      color: 'bg-red-500/20 text-red-500 border-red-500/30',
      tooltip: '1st: Weeks ban, 2nd: Months ban, 3rd: Permanent ban'
    },
    grievous: {
      color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      tooltip: '1st offence: Permanent ban immediately'
    }
  };

  const getSeverityBadge = (severity: string) => {
    const info = severityInfo[severity as keyof typeof severityInfo];
    if (!info) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`text-xs ${info.color}`}>
              {severity}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{info.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderRules = (categoryId: string) => {
    const category = ruleCategories.find(cat => cat.id === categoryId);
    if (!category) return null;

    return (
      <div className="space-y-4">
        {category.rules.map((rule) => (
          <div key={rule.id} className="p-6 bg-muted/20 rounded-xl border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-lg">{rule.id} - {rule.text}</span>
              {getSeverityBadge(rule.severity)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">


      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-2">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">Rule Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('cheating')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'cheating'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Cheating</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('behavior')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'behavior'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Behavior</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('communication')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'communication'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Communication</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('buildings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'buildings'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span>Buildings</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('redstone')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'redstone'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Redstone</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('ingame')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'ingame'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Sword className="w-4 h-4" />
                  <span>In-Game</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('economy')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'economy'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'hover:bg-orange-100 dark:hover:bg-orange-900/20 text-foreground'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Economy</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('plugins')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'plugins'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Plugins</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('website')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'website'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>Website</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('punishments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'punishments'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>Punishments</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'staff'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Staff</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6 md:space-y-8">

        {/* Cheating & Technical Issues Tab */}
        {activeTab === 'cheating' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Cheating & Technical Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('cheating')}
            </CardContent>
          </Card>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Behaviors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('behavior')}
            </CardContent>
          </Card>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Communication Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('communication')}
            </CardContent>
          </Card>
        )}

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Hammer className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Buildings & Griefing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('buildings')}
            </CardContent>
          </Card>
        )}

        {/* Redstone Rules Tab */}
        {activeTab === 'redstone' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Redstone Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('redstone')}
            </CardContent>
          </Card>
        )}

        {/* In-Game Rules Tab */}
        {activeTab === 'ingame' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Sword className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                In-game Rules (Fair Play)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('ingame')}
            </CardContent>
          </Card>
        )}

        {/* Economy Rules Tab */}
        {activeTab === 'economy' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Economy and Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('economy')}
            </CardContent>
          </Card>
        )}

        {/* Plugins Rules Tab */}
        {activeTab === 'plugins' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Plugin-related Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('plugins')}
            </CardContent>
          </Card>
        )}

        {/* Website & Platform Rules Tab */}
        {activeTab === 'website' && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Website & Platform Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {renderRules('website')}
            </CardContent>
          </Card>
        )}

        {/* Punishments Tab */}
        {activeTab === 'punishments' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="glass-card rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                  <Gavel className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Punishment System
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Overview</h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                      When a moderator has enough evidence to support that a rule violation has occurred, it may be appropriate to administer a penalty. The specific penalties handed out depend on several circumstances including the rule violated, severity, previous penalties, cooperation level, and mitigating circumstances.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Types of Penalties</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                        <h4 className="font-semibold mb-2">Verbal Warning</h4>
                        <p className="text-sm text-muted-foreground">The lightest type of penalty. These are not saved, but they are the moderators' way of pointing out minor rule violations without having too significant consequences for the offender.</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                        <h4 className="font-semibold mb-2">Warning</h4>
                        <p className="text-sm text-muted-foreground">Results in being disconnected from the server and indicates that a rule violation has been committed. All warnings include a reason and are saved in the player's profile.</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                        <h4 className="font-semibold mb-2">Banishment</h4>
                        <p className="text-sm text-muted-foreground">As a banned individual, one is usually imprisoned and has limited opportunities to play and communicate on the server. Bans always have an expiration date.</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                        <h4 className="font-semibold mb-2">Fines and Damages</h4>
                        <p className="text-sm text-muted-foreground">This penalty involves transferring money or items in the form of fines to the nation or as damages to players. Common in cases of X-ray use or unlawful murder.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Punishment Color Coding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                        <h4 className="font-semibold mb-2 text-blue-600">Minor</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1st Offence: Warning</li>
                          <li>• 2nd Offence: Days long ban</li>
                          <li>• 3rd Offence: Weeks long ban</li>
                          <li>• 4th Offence: Permanent ban</li>
                        </ul>
                      </div>
                      <div className="p-3 sm:p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                        <h4 className="font-semibold mb-2 text-yellow-600">Moderate</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1st Offence: Warning or ban</li>
                          <li>• 2nd Offence: Weeks long ban</li>
                          <li>• 3rd Offence: Months long ban</li>
                          <li>• 4th Offence: Permanent ban</li>
                        </ul>
                      </div>
                      <div className="p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                        <h4 className="font-semibold mb-2 text-red-600">Severe</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1st Offence: Weeks long ban</li>
                          <li>• 2nd Offence: Months long ban</li>
                          <li>• 3rd Offence: Permanent ban</li>
                        </ul>
                      </div>
                      <div className="p-3 sm:p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                        <h4 className="font-semibold mb-2 text-purple-600">Grievous</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1st Offence: Permanent Ban</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Appeals</h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                      One can appeal or question a penalty once per penalty if they have been penalized for a rule violation. Appeals are only handled if sent to the support team and are usually handled by the moderator who issued the penalty.
                    </p>
                    <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                      <h4 className="font-semibold mb-2">When appealing a penalty, it is important to:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tell the truth</li>
                        <li>• Explain what you think is wrong with the penalty</li>
                        <li>• Present a request for how you think the penalty should be changed</li>
                        <li>• Argue why you believe the penalty is unjust</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Staff Rules Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Staff Rules */}
            <Card className="glass-card rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Staff-related Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {renderRules('staff')}
              </CardContent>
            </Card>

            {/* Staff Information */}
            <Card className="glass-card rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  The Nordics Staff & Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Operators */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Operators</h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Management</h4>
                        <p className="text-sm">{staffInfo.operators.management.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Developers</h4>
                        <p className="text-sm">{staffInfo.operators.developers.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Associates */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Associates</h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Helpers</h4>
                        <p className="text-sm">{staffInfo.associates.helpers.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Media & Writers</h4>
                        <p className="text-sm">{staffInfo.associates.media.join(', ')} • {staffInfo.associates.writers.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notable Contributors */}
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary">Notable Contributors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {staffInfo.notableContributors.map((contributor, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {contributor}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Rules;
