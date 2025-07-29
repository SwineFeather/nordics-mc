
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy } from 'lucide-react';

interface UpcomingEvent {
  title: string;
  date: string;
  time: string;
  description: string;
  participants: number;
  prize: string;
}

interface EventsDisplayProps {
  events: UpcomingEvent[];
}

const EventsDisplay: React.FC<EventsDisplayProps> = ({ events }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-medium">
          Upcoming <span className="gradient-text">Events</span>
        </h2>
        <Button variant="outline" className="rounded-2xl">
          <Calendar className="w-4 h-4 mr-2" />
          View Calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <Card
            key={event.title}
            className="glass-card rounded-3xl hover-lift"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {event.date}
                </Badge>
                <div className="text-sm text-muted-foreground">{event.time}</div>
              </div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{event.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {event.participants}
                  </div>
                  <div className="flex items-center text-accent">
                    <Trophy className="w-4 h-4 mr-1" />
                    Prize
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-muted/30 rounded-xl">
                <div className="text-sm font-medium text-accent">{event.prize}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsDisplay;
