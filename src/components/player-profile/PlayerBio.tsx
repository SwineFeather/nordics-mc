
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface PlayerBioProps {
  bio?: string;
}

const PlayerBio = ({ bio }: PlayerBioProps) => {
  if (!bio) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No bio available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
};

export default PlayerBio;
