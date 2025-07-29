
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, ArrowRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock news data - in a real app, this would come from the forum posts
const newsItems = [
  {
    id: '1',
    title: 'New Town System Update Released',
    excerpt: 'We\'ve implemented major improvements to the town management system, including better permissions and easier administration.',
    author: {
      name: 'ServerAdmin',
      avatar: 'https://mc-heads.net/avatar/ServerAdmin/32'
    },
    date: '2024-01-15',
    category: 'Patch Notes',
    replies: 12,
    featured: true
  },
  {
    id: '2',
    title: 'Winter Building Competition Announced',
    excerpt: 'Join our winter building competition! Build the most creative winter-themed structure and win amazing prizes.',
    author: {
      name: 'EventManager',
      avatar: 'https://mc-heads.net/avatar/EventManager/32'
    },
    date: '2024-01-14',
    category: 'Events',
    replies: 25,
    featured: true
  },
  {
    id: '3',
    title: 'Server Performance Improvements',
    excerpt: 'We\'ve made several backend improvements to reduce lag and improve overall server performance.',
    author: {
      name: 'TechTeam',
      avatar: 'https://mc-heads.net/avatar/TechTeam/32'
    },
    date: '2024-01-13',
    category: 'News',
    replies: 8,
    featured: false
  },
  {
    id: '4',
    title: 'New Player Guide Updated',
    excerpt: 'Our comprehensive guide for new players has been updated with the latest information and helpful tips.',
    author: {
      name: 'ModeratorTeam',
      avatar: 'https://mc-heads.net/avatar/ModeratorTeam/32'
    },
    date: '2024-01-12',
    category: 'News',
    replies: 15,
    featured: false
  }
];

const NewsSection: React.FC = () => {
  const featuredNews = newsItems.filter(item => item.featured);
  const recentNews = newsItems.filter(item => !item.featured).slice(0, 4);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Patch Notes':
        return 'bg-purple-100 text-purple-800';
      case 'Events':
        return 'bg-orange-100 text-orange-800';
      case 'News':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4 flex items-center justify-center">
            <Newspaper className="w-8 h-8 mr-3" />
            Latest News
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest server news, events, and announcements
          </p>
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Featured</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredNews.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.author.avatar} alt={item.author.name} />
                          <AvatarFallback className="text-xs">
                            {item.author.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{item.author.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {item.replies}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent News */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Recent Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNews.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <Badge className={`${getCategoryColor(item.category)} mb-2`}>
                    {item.category}
                  </Badge>
                  <h4 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {item.replies}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Link to Forum */}
        <div className="text-center">
          <Link to="/forum">
            <Button className="inline-flex items-center gap-2">
              View All Forum Posts
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
