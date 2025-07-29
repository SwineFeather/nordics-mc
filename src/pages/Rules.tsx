import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  MessageSquare, 
  Hammer, 
  Users, 
  Gavel,
  AlertTriangle,
  Book,
  Scale,
  Crown,
  FileText
} from 'lucide-react';

const Rules = () => {
  const ruleCategories = [
    {
      id: 'cheating',
      title: 'Cheating & Technical Issues',
      icon: Shield,
      color: 'text-red-500',
      rules: [
        { id: '1.1', text: 'Use of Cheats', severity: 'severe', description: 'Those who use any form of cheats, mods, or programs that provide unfair advantages will face severe penalties.' },
        { id: '1.1.1', text: 'Unauthorized Automation', severity: 'minor', description: 'Advanced functions for automated behavior that provide advantages.' },
        { id: '1.2', text: 'Assisting in Cheating', severity: 'minor', description: 'Collaborating or trading with players using cheats.' },
        { id: '1.3', text: 'Exploitation of Bugs', severity: 'moderate', description: 'Exploiting bugs or unintended features for personal gain.' },
        { id: '1.4', text: 'Multi-Accounting', severity: 'minor', description: 'Exploiting multiple accounts to generate in-game currency.' }
      ]
    },
    {
      id: 'behavior',
      title: 'Behaviors',
      icon: Users,
      color: 'text-blue-500',
      rules: [
        { id: '2.1', text: 'Deception', severity: 'chat', description: 'Intentionally deceiving other players or mimicking identities.' },
        { id: '2.2', text: 'Disobedience to Authority', severity: 'moderate', description: 'Not following moderator instructions.' },
        { id: '2.3', text: 'Incitement to Violate Rules', severity: 'minor', description: 'Encouraging others to break rules.' }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      color: 'text-green-500',
      rules: [
        { id: '3.1', text: 'Inappropriate Language', severity: 'chat', description: 'Careless, inappropriate, unsuitable, or foreign words.' },
        { id: '3.2', text: 'Provocation', severity: 'severe', description: 'Expressions of xenophobia, hatred, threats, or sexual innuendos.' },
        { id: '3.3', text: 'Spam', severity: 'chat', description: 'Repeating similar messages or sending junk messages.' },
        { id: '3.4', text: 'Advertising Violation', severity: 'chat', description: 'Advertising other servers or commercial purposes.' },
        { id: '3.5', text: 'Unlawful Opposition', severity: 'chat', description: 'Non-constructive criticism of the server or moderators.' },
        { id: '3.6', text: 'Personal Data Violation', severity: 'moderate', description: 'Spreading personal information.' }
      ]
    },
    {
      id: 'building',
      title: 'Buildings & Griefing',
      icon: Hammer,
      color: 'text-orange-500',
      rules: [
        { id: '4.1', text: 'Vandalism', severity: 'moderate', description: 'Placement of annoying blocks, large-scale griefing, destructive use of fluids.' },
        { id: '4.2', text: 'Unauthorized Construction', severity: 'minor', description: 'Building traps or harmful structures in public towns.' },
        { id: '4.3', text: 'Unauthorized Aircraft', severity: 'minor', description: 'Building aircraft that don\'t meet requirements.' },
        { id: '4.5.1', text: 'Large-scale Griefing', severity: 'moderate', description: 'Griefing within town claims or nearby wilderness.' },
        { id: '4.5.2', text: 'Major Griefing', severity: 'severe', description: 'Exceptionally extensive griefing.' }
      ]
    }
  ];

  const staffRoles = [
    { role: 'Verified', color: 'text-blue-500', prefix: '[V]', description: 'Trusted community members who can kick rule-breakers when no staff are online.' },
    { role: 'Helper', color: 'text-blue-500', prefix: '[H]', description: 'Support new players and maintain order in chat channels.' },
    { role: 'Moderator', color: 'text-blue-500', prefix: '[M]', description: 'Universal tool handling most server tasks and rule enforcement.' },
    { role: 'Administrator', color: 'text-blue-500', prefix: '[A]', description: 'Moderators with greater responsibility for events and world management.' },
    { role: 'Management', color: 'text-red-500', prefix: '[A]', description: 'Responsible for the entire server operation and all staff.' }
  ];

  const getSeverityBadge = (severity: string) => {
    const variants = {
      chat: 'bg-green-500/20 text-green-500 border-green-500/30',
      minor: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      severe: 'bg-red-500/20 text-red-500 border-red-500/30',
      grievous: 'bg-purple-500/20 text-purple-500 border-purple-500/30'
    };

    return (
      <Badge className={`text-xs ${variants[severity as keyof typeof variants]}`}>
        {severity}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-medium mb-4">
          <span className="gradient-text">Server Rules</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Guidelines and regulations for maintaining a fair and enjoyable community on Nordics Minecraft.
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/30">
          <TabsTrigger value="rules" className="rounded-xl">
            <Book className="w-4 h-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="punishments" className="rounded-xl">
            <Scale className="w-4 h-4 mr-2" />
            Punishments
          </TabsTrigger>
          <TabsTrigger value="staff" className="rounded-xl">
            <Crown className="w-4 h-4 mr-2" />
            Staff Roles
          </TabsTrigger>
          <TabsTrigger value="bans" className="rounded-xl">
            <Gavel className="w-4 h-4 mr-2" />
            Ban List
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ruleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="glass-card rounded-3xl">
                  <CardHeader>
                    <CardTitle className={`flex items-center text-xl ${category.color}`}>
                      <Icon className="w-6 h-6 mr-3" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {category.rules.map((rule) => (
                          <div key={rule.id} className="p-4 bg-muted/20 rounded-xl border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{rule.id} - {rule.text}</span>
                              {getSeverityBadge(rule.severity)}
                            </div>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Punishments Tab */}
        <TabsContent value="punishments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { type: 'Chat Related', color: 'green', description: 'Chat mutes and warnings. Length increases on repeat offences.' },
              { type: 'Minor', color: 'blue', description: '1st: Warning, 2nd: Days ban, 3rd: Weeks ban, 4th: Permanent' },
              { type: 'Moderate', color: 'yellow', description: '1st: Warning/ban, 2nd: Weeks ban, 3rd: Months ban, 4th: Permanent' },
              { type: 'Severe', color: 'red', description: '1st: Weeks ban, 2nd: Months ban, 3rd: Permanent' },
              { type: 'Grievous', color: 'purple', description: '1st offence: Permanent ban immediately.' }
            ].map((punishment) => (
              <Card key={punishment.type} className="glass-card rounded-3xl">
                <CardHeader>
                  <CardTitle className={`text-${punishment.color}-500 flex items-center`}>
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {punishment.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{punishment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Staff Roles Tab */}
        <TabsContent value="staff">
          <div className="space-y-6">
            {staffRoles.map((staff) => (
              <Card key={staff.role} className="glass-card rounded-3xl">
                <CardHeader>
                  <CardTitle className={`flex items-center ${staff.color}`}>
                    <Badge className={`mr-3 ${staff.color} bg-current/20`}>
                      {staff.prefix}
                    </Badge>
                    {staff.role}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{staff.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ban List Tab */}
        <TabsContent value="bans">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <Gavel className="w-6 h-6 mr-3" />
                Permanent Bans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-3">Player</th>
                      <th className="text-left p-3">Banned By</th>
                      <th className="text-left p-3">Reason</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { player: 'NumbersGuy_', bannedBy: 'KevorkDK', reason: 'Rule Violation', date: '2023-09-28' },
                      { player: 'i10s', bannedBy: 'KevorkDK', reason: 'Rule Violation', date: '2023-09-18' },
                      { player: 'Tolek1803', bannedBy: 'Console', reason: 'Inappropriate Language', date: '2024-01-29' },
                      { player: 'MonkeyPorcupine', bannedBy: 'SwineFeather', reason: 'Severe Hacking', date: '2024-08-06' },
                      { player: 'fbajk', bannedBy: 'SwineFeather', reason: 'Griefing Towns', date: '2024-07-05' },
                      { player: 'guuba234', bannedBy: 'Svardmastaren', reason: 'Rule Violation', date: '2023-11-17' }
                    ].map((ban, index) => (
                      <tr key={index} className="border-b border-border/30">
                        <td className="p-3 font-medium">{ban.player}</td>
                        <td className="p-3 text-muted-foreground">{ban.bannedBy}</td>
                        <td className="p-3 text-muted-foreground">{ban.reason}</td>
                        <td className="p-3 text-muted-foreground">{ban.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rules;
