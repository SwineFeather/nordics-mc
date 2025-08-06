import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Shield, 
  Users, 
  Globe,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.gg/JXSVG367ux', '_blank');
  };

  const handleAdminDiscordClick = () => {
    // Open Discord with a mention to the admin
    window.open('https://discord.com/users/swinefeather', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team for support, questions, or to report issues. 
            We're here to help make your Nordics experience the best it can be.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Community Discord */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Community Discord
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Join our community Discord server to connect with other players, 
                get help, and stay updated with server news and events.
              </p>
              <Button 
                onClick={handleDiscordClick}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Discord Server
              </Button>
              <div className="text-sm text-muted-foreground">
                <strong>Link:</strong> discord.gg/JXSVG367ux
              </div>
            </CardContent>
          </Card>

          {/* Admin Contact */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Admin Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Need to contact an administrator? Reach out to our server admin 
                for urgent issues, appeals, or administrative matters.
              </p>
              <Button 
                onClick={handleAdminDiscordClick}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Admin
              </Button>
              <div className="text-sm text-muted-foreground">
                <strong>Discord:</strong> @swinefeather
              </div>
            </CardContent>
          </Card>

          {/* Server Information */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Server Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Server IP:</span>
                  <span className="font-mono font-medium">nordics.world</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <Badge variant="secondary">1.21.1+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-green-500">Online</Badge>
                </div>
              </div>
              <Button 
                onClick={() => navigator.clipboard.writeText('nordics.world')}
                className="w-full"
                variant="outline"
              >
                Copy Server IP
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Getting Help */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">General Questions</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask in our Discord server's #general or #help channels
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Technical Issues</h4>
                    <p className="text-sm text-muted-foreground">
                      Report bugs or technical problems in #bug-reports
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Appeals & Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact an admin directly for moderation issues
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Be Respectful</h4>
                    <p className="text-sm text-muted-foreground">
                      Treat all players with kindness and respect
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Follow Rules</h4>
                    <p className="text-sm text-muted-foreground">
                      Adhere to server rules and community standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Help Others</h4>
                    <p className="text-sm text-muted-foreground">
                      Contribute positively to the community
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/rules">
              <Button variant="outline">
                Server Rules
              </Button>
            </Link>
            <Link to="/wiki">
              <Button variant="outline">
                Wiki
              </Button>
            </Link>
            <Link to="/forum">
              <Button variant="outline">
                Forum
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="outline">
                Interactive Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 