
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <footer className="bg-background dark:bg-background border-t border-border dark:border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Nordics</h3>
            <p className="text-sm text-muted-foreground">
              A vibrant Minecraft community where builders, explorers, and adventurers come together.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-foreground dark:text-foreground">Community</h4>
            <div className="space-y-2">
              <Link to="/community" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Player Directory
              </Link>
              <Link to="/towns/groups" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </Link>
              <Link to="/forum" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forum
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-foreground dark:text-foreground">Resources</h4>
            <div className="space-y-2">
              <Link to="/guide" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Guide
              </Link>
              <Link to="/wiki" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Wiki
              </Link>
              <Link to="/map" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Interactive Map
              </Link>
              <Link to="/towns/shops" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shops
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-foreground dark:text-foreground">Support</h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground">
                    <Database className="w-4 h-4 mr-1" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-border dark:border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 nordics.world. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
