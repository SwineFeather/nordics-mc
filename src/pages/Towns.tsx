
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TownsHeader from '@/components/towns/TownsHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NationsTab from '@/components/towns/NationsTab';
import TownsTab from '@/components/towns/TownsTab';
import GroupsTab from '@/components/towns/GroupsTab';
import BusinessListingsTab from '@/components/towns/BusinessListingsTab';
import ShopsTab from '@/components/towns/ShopsTab';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { useShopData } from '@/hooks/useShopData';
import { useServerStatus } from '@/hooks/useServerStatus';
import { Crown, DollarSign, UserPlus, Building2, MapPin, HelpCircle, Building, Store, Flag } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TownsProps {
  defaultTab?: 'nations' | 'markets';
}

const Towns: React.FC<TownsProps> = ({ defaultTab = 'nations' }) => {
  const { companies } = useCompaniesData();
  const { shops } = useShopData();
  const { status: serverStatus } = useServerStatus();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL or prop
  const getActiveTab = () => {
    if (location.pathname === '/towns/nations' || location.pathname === '/towns/towns') return 'nations';
    if (location.pathname === '/towns/groups' || location.pathname === '/towns/businesses' || location.pathname === '/towns/shops') return 'markets';
    return defaultTab;
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'nations':
        navigate('/towns/nations');
        break;
      case 'markets':
        navigate('/towns/groups');
        break;
      default:
        navigate('/towns');
    }
  };

  return (
    <div className="min-h-[100vh] bg-background py-8">
      {/* Nordic Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
          {/* Nordic flag pattern background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-8 relative">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Flag className="h-6 w-6 text-red-500" />
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800">
                    Nordic Nations
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  Discover{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Nations & Towns
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Explore the diverse communities across our Nordic-inspired world. 
                  From bustling towns to mighty nations, find your perfect home in the Nordics.
                </p>
                
                {/* Nordic flag colors accent */}
                <div className="flex justify-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Guide Section */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="rounded-2xl bg-card shadow-lg p-6 md:p-8 border border-border flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-xl">
                  <HelpCircle className="w-8 h-8" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to Join a Town</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Browse the list of towns and nations below to find a community that fits your style.</li>
                      <li>Click on a town to view more details and see how to join or contact the mayor.</li>
                      <li>Inside the town profile, click the <b>Request to Join</b> button to send your application.</li>
                      <li>Wait for the mayor or staff to approve your request. You'll be notified in-game or on the website.</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                  <button className="mt-6 w-full bg-muted text-foreground font-semibold px-5 py-2 rounded-lg border border-border hover:bg-muted/70 transition">Close</button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-16 h-16 bg-gradient-to-r from-blue-500 to-yellow-400 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-yellow-500 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-xl">
                  <HelpCircle className="w-8 h-8" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to Create a Town (Towny Plugin)</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Make sure you have enough in-game currency and meet any requirements set by the server.</li>
                      <li>Open the Minecraft chat and type: <code className="bg-muted px-2 py-1 rounded">/town new &lt;name&gt;</code></li>
                      <li>Follow the prompts to set up your town's name, mayor, and initial settings.</li>
                      <li>Invite friends to join your town and start building your community!</li>
                      <li>For more advanced options, see <code className="bg-muted px-2 py-1 rounded">/town help</code> or ask staff for assistance.</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                  <button className="mt-6 w-full bg-muted text-foreground font-semibold px-5 py-2 rounded-lg border border-border hover:bg-muted/70 transition">Close</button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-2">Need Help Getting Started?</h3>
            <p className="text-muted-foreground text-sm">
              Use the help buttons above to learn how to join or create a town
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-1 w-full max-w-4xl mx-auto border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <TabsTrigger 
                value="nations" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Crown className="w-5 h-5" />
                Nations & Towns
              </TabsTrigger>
              <TabsTrigger 
                value="markets" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Building className="w-5 h-5" />
                Markets
              </TabsTrigger>
            </TabsList>
            
            {/* Nations & Towns Tab Content */}
            <TabsContent value="nations" className="mt-8">
              <NationsAndTownsTab />
            </TabsContent>
            
            {/* Markets Tab Content */}
            <TabsContent value="markets" className="mt-8">
              <MarketsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// New component for Nations & Towns with sub-navigation
const NationsAndTownsTab: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active sub-tab from URL
  const getActiveSubTab = () => {
    if (location.pathname === '/towns/nations') return 'nations';
    if (location.pathname === '/towns/towns') return 'towns';
    return 'nations';
  };
  
  const [activeSubTab, setActiveSubTab] = useState<'nations' | 'towns'>(getActiveSubTab());
  
  const handleSubTabChange = (value: 'nations' | 'towns') => {
    setActiveSubTab(value);
    switch (value) {
      case 'nations':
        navigate('/towns/nations');
        break;
      case 'towns':
        navigate('/towns/towns');
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Sub-navigation for Nations & Towns */}
      <div className="flex justify-center">
        <Tabs value={activeSubTab} onValueChange={(value: 'nations' | 'towns') => handleSubTabChange(value)} className="w-full">
          <TabsList className="flex justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-1 w-full max-w-md mx-auto border border-orange-200 dark:border-orange-800 shadow-lg">
            <TabsTrigger 
              value="nations" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Crown className="w-4 h-4" />
              Nations
            </TabsTrigger>
            <TabsTrigger 
              value="towns" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              Towns
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="nations" className="mt-6">
            <NationsTab />
          </TabsContent>
          
          <TabsContent value="towns" className="mt-6">
            <TownsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// New component for Markets with sub-navigation
const MarketsTab: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active sub-tab from URL
  const getActiveSubTab = () => {
    if (location.pathname === '/towns/groups') return 'groups';
    if (location.pathname === '/towns/businesses') return 'businesses';
    if (location.pathname === '/towns/shops') return 'shops';
    return 'groups';
  };
  
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'businesses' | 'shops'>(getActiveSubTab());
  
  const handleSubTabChange = (value: 'groups' | 'businesses' | 'shops') => {
    setActiveSubTab(value);
    switch (value) {
      case 'groups':
        navigate('/towns/groups');
        break;
      case 'businesses':
        navigate('/towns/businesses');
        break;
      case 'shops':
        navigate('/towns/shops');
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Sub-navigation for Markets */}
      <div className="flex justify-center">
        <Tabs value={activeSubTab} onValueChange={(value: 'groups' | 'businesses' | 'shops') => handleSubTabChange(value)} className="w-full">
          <TabsList className="flex justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-1 w-full max-w-2xl mx-auto border border-orange-200 dark:border-orange-800 shadow-lg">
            <TabsTrigger 
              value="groups" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Building className="w-4 h-4" />
              Enterprises
            </TabsTrigger>
            <TabsTrigger 
              value="businesses" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Building2 className="w-4 h-4" />
              Business Listings
            </TabsTrigger>
            <TabsTrigger 
              value="shops" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Store className="w-4 h-4" />
              Shops
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="mt-6">
            <GroupsTab />
          </TabsContent>
          
          <TabsContent value="businesses" className="mt-6">
            <BusinessListingsTab />
          </TabsContent>
          
          <TabsContent value="shops" className="mt-6">
            <ShopsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Towns;
