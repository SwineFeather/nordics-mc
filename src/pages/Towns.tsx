
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NationsTab from '@/components/towns/NationsTab';
import TownsTab from '@/components/towns/TownsTab';
import MarketplaceSubTabs from '@/components/towns/MarketplaceSubTabs';

import { Crown, MapPin, HelpCircle, Building } from 'lucide-react';

interface TownsProps {
  defaultTab?: 'nations' | 'towns';
}

const Towns: React.FC<TownsProps> = ({ defaultTab = 'nations' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL or prop
  const getActiveTab = () => {
    if (location.pathname === '/towns/nations') return 'nations';
    if (location.pathname === '/towns/towns') return 'towns';
    return defaultTab;
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'nations':
        navigate('/towns/nations');
        break;
      case 'towns':
        navigate('/towns/towns');
        break;
      default:
        navigate('/towns');
    }
  };

  return (
    <div className="min-h-[100vh] bg-background py-8">
      {/* Top hero/title removed per request */}

      {/* Getting Started Guide Section */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="rounded-2xl bg-card shadow-lg p-6 md:p-8 border border-border flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex gap-4">
            <div className="relative group">
              <button className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-xl">
                <HelpCircle className="w-8 h-8" />
              </button>
              
              {/* Hover Popup */}
              <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-[9999] min-w-[320px]">
                <div className="bg-card border border-border rounded-lg shadow-xl p-4 w-80 max-w-sm">
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-border"></div>
                  <h4 className="font-semibold mb-3 text-foreground">How to Join a Town</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Browse the list of towns and nations below to find a community that fits your style.</li>
                    <li>Click on a town to view more details and see how to join or contact the mayor.</li>
                    <li>Inside the town profile, click the <b>Request to Join</b> button to send your application.</li>
                    <li>Wait for the mayor or staff to approve your request. You'll be notified in-game or on the website.</li>
                    <li>Once you're a member, use <code className="bg-muted px-2 py-1 rounded">/town menu</code> to access town features and settings.</li>
                    <li>For plot management, use <code className="bg-muted px-2 py-1 rounded">/plot menu</code> to view and manage your plots.</li>
                    <li>For nation information, use <code className="bg-muted px-2 py-1 rounded">/nation menu</code> to see nation details and options.</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <button className="w-16 h-16 bg-gradient-to-r from-blue-500 to-yellow-400 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-yellow-500 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-xl">
                <HelpCircle className="w-8 h-8" />
              </button>
              
              {/* Hover Popup */}
              <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-[9999] min-w-[320px]">
                <div className="bg-card border border-border rounded-lg shadow-xl p-4 w-80 max-w-sm">
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-border"></div>
                  <h4 className="font-semibold mb-3 text-foreground">How to Create a Town (Towny Plugin)</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Make sure you have enough in-game currency and meet any requirements set by the server.</li>
                    <li>Open the Minecraft chat and type: <code className="bg-muted px-2 py-1 rounded">/town new &lt;name&gt;</code></li>
                    <li>Follow the prompts to set up your town's name, mayor, and initial settings.</li>
                    <li>Invite friends to join your town using: <code className="bg-muted px-2 py-1 rounded">/town add &lt;player&gt;</code></li>
                    <li>Use <code className="bg-muted px-2 py-1 rounded">/town menu</code> to manage your town settings, members, and permissions.</li>
                    <li>For plot management, use <code className="bg-muted px-2 py-1 rounded">/plot menu</code> to assign plots to residents.</li>
                    <li>For nation management, use <code className="bg-muted px-2 py-1 rounded">/nation menu</code> to handle nation affairs.</li>
                    <li>Almost everything you need is available through these menu commands!</li>
                    <li>For more advanced options, see <code className="bg-muted px-2 py-1 rounded">/town help</code> or ask staff for assistance.</li>
                  </ol>
                </div>
              </div>
            </div>
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Crown className="w-5 h-5" />
                Nations & Towns
              </TabsTrigger>
              <TabsTrigger 
                value="markets" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
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
              <MarketplaceSubTabs />
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
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
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



export default Towns;
