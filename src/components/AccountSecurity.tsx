
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Monitor, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginSession {
  id: string;
  device: string;
  location: string;
  timestamp: string;
  current: boolean;
}

const AccountSecurity = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Windows PC - Chrome',
      location: 'Current Location',
      timestamp: new Date().toISOString(),
      current: true
    }
  ]);

  const handleEndSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleEndAllSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Monitor your account security and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-green-600">Secure</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-blue-600">{sessions.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Last Login</p>
                <p className="text-sm text-orange-600">Now</p>
              </div>
            </div>
          </div>

          {profile?.email?.includes('@tokenlink.local') && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">TokenLink Account</p>
                <p className="text-sm text-orange-700">
                  Consider upgrading to email/password for enhanced security
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices that are currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEndSession(session.id)}
                  >
                    End Session
                  </Button>
                )}
              </div>
            ))}
          </div>

          {sessions.length > 1 && (
            <Button variant="destructive" onClick={handleEndAllSessions} className="w-full">
              End All Other Sessions
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSecurity;
