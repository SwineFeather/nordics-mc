
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeHero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 mb-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
      
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="p-8 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <Heart className="h-6 w-6 text-red-500 animate-pulse" />
                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800">
                  Welcome Home
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Welcome to the{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Nordics Community
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                Join our vibrant community of builders, explorers, and adventurers. 
                Discover amazing players, explore thriving towns, and become part of something special.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white group">
                  <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explore Players
                </Button>
                <Button variant="outline" size="lg" asChild className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  <Link to="/towns">
                    <Globe className="h-5 w-5 mr-2" />
                    Visit Towns
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:w-80 grid grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer">
                <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">2,847</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Players</div>
              </div>
              
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Towns</div>
              </div>
              
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Satisfaction</div>
              </div>
              
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer">
                <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Online</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeHero;
