
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, ExternalLink } from 'lucide-react';

const DiscordPromo = () => {
  return (
    <Card className="glass-card rounded-3xl mb-16 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-medium mb-2">Join Our Discord</h2>
            <p className="text-muted-foreground mb-4">
              Connect with the community, get support, and stay updated with the latest news.
              <br />
              <span className="text-sm font-medium text-primary">
                Don't forget to get the Minecraft role to access all channels!
              </span>
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <Badge className="bg-secondary/20 text-secondary">
                <Users className="w-4 h-4 mr-1" />
                850+ Members
              </Badge>
              <Badge className="bg-primary/20 text-primary">
                <MessageCircle className="w-4 h-4 mr-1" />
                Active Chat
              </Badge>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-2xl font-medium hover-lift"
            onClick={() => window.open('https://discord.gg/nordics', '_blank')}
          >
            <ExternalLink className="mr-2 w-5 h-5" />
            Join Discord
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DiscordPromo;
