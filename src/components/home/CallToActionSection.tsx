
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-6">Ready to Start Your Adventure?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of players in the most immersive Minecraft experience
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="rounded-xl">
            Join Server
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="lg" className="rounded-xl" asChild>
            <Link to="/wiki">
              Learn More
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Server Address:</p>
          <code className="text-lg font-mono bg-background px-4 py-2 rounded-lg">
            nordics.world
          </code>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
