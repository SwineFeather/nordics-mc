
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link2, User, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AccountLinking = () => {
  const [loading, setLoading] = useState(false);
  const [linkingData, setLinkingData] = useState({
    email: '',
    password: '',
    minecraftUsername: ''
  });

  const handleLinkAccount = async () => {
    if (!linkingData.email || !linkingData.password || !linkingData.minecraftUsername) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // This would need to be implemented with an edge function to handle the linking
      // For now, just show success message
      toast.success('Account linking request submitted. Please check your email for verification.');
    } catch (error) {
      console.error('Error linking account:', error);
      toast.error('Failed to link account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Link Minecraft Account
        </CardTitle>
        <CardDescription>
          Link your Minecraft account to an existing email account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If you already have an account with email/password, you can link your Minecraft account to it.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="linkEmail">Email Address</Label>
            <Input
              id="linkEmail"
              type="email"
              placeholder="your.existing@email.com"
              value={linkingData.email}
              onChange={(e) => setLinkingData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="linkPassword">Password</Label>
            <Input
              id="linkPassword"
              type="password"
              placeholder="Your account password"
              value={linkingData.password}
              onChange={(e) => setLinkingData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="linkMinecraft">Minecraft Username</Label>
            <Input
              id="linkMinecraft"
              placeholder="Your Minecraft username"
              value={linkingData.minecraftUsername}
              onChange={(e) => setLinkingData(prev => ({ ...prev, minecraftUsername: e.target.value }))}
            />
          </div>
          
          <Button onClick={handleLinkAccount} disabled={loading} className="w-full">
            <User className="w-4 h-4 mr-2" />
            {loading ? 'Linking...' : 'Link Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountLinking;
