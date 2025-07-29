
import { Link } from 'react-router-dom';
import { Github, MessageCircle, Users, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NordicsLogo from './NordicsLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Discord',
      icon: MessageCircle,
      href: 'https://discord.gg/nordics',
      color: 'hover:text-blue-500'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://www.youtube.com/@NordicsMinecraft/shorts',
      color: 'hover:text-red-500'
    },
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/SwineFeather/Nordics',
      color: 'hover:text-gray-600'
    }
  ];

  const quickLinks = [
    { name: 'Rules', href: '/rules' },
    { name: 'Wiki', href: '/wiki' },
    { name: 'Map', href: '/map' },
    { name: 'Forum', href: '/forum' }
  ];

  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <NordicsLogo className="h-6 w-6" />
              <span className="text-lg font-bold gradient-text">Nordics</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A premium Minecraft server featuring towny gameplay and Nordic-themed adventures.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`${social.color} transition-colors`}
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Server Info */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Connect</h3>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Server IP:</p>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                nordics.world
              </code>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Nordics Minecraft Server. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 text-xs">
              <Link to="/rules" className="text-muted-foreground hover:text-foreground transition-colors">
                Server Rules
              </Link>
              <span className="text-muted-foreground">•</span>
              <a 
                href="mailto:admin@nordics.world" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
