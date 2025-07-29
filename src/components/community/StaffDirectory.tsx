
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Crown, UserCheck, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getRoleDisplayName, getRoleBadgeColor, isStaffRole } from '@/utils/roleUtils';

interface StaffMember {
  id: string;
  full_name: string;
  minecraft_username: string;
  role: string;
  avatar_url?: string;
  bio?: string;
}

const StaffDirectory = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('role.eq.admin,role.eq.moderator,role.eq.helper')
        .order('role', { ascending: true });

      if (error) throw error;
      
      // Filter to only include staff roles on the client side as well
      const staffData = (data || []).filter(member => isStaffRole(member.role));
      setStaffMembers(staffData);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'helper':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staff Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Staff Directory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staffMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No staff members found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.full_name?.charAt(0) || member.minecraft_username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getRoleIcon(member.role)}
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {getRoleDisplayName(member.role)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">
                    {member.full_name || member.minecraft_username}
                  </h3>
                  
                  {member.minecraft_username && member.full_name !== member.minecraft_username && (
                    <p className="text-sm text-muted-foreground mb-2">
                      @{member.minecraft_username}
                    </p>
                  )}
                  
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffDirectory;
