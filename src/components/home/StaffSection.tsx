
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  icon: React.ReactNode;
  color: string;
}

interface StaffSectionProps {
  staffMembers: StaffMember[];
}

const StaffSection: React.FC<StaffSectionProps> = ({ staffMembers }) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">Meet Our Staff Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team works hard to ensure the best experience for all players
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffMembers.map(member => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={member.avatar} className="object-fill" />
                  <AvatarFallback>
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center justify-center mb-2">
                  {member.icon}
                  <Badge className={`ml-2 text-xs ${member.color}`}>
                    {member.role}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaffSection;
