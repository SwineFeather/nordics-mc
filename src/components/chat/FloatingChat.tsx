import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Users, Pin, PinOff } from 'lucide-react';
import { useMinecraftWebSocket } from '@/hooks/useMinecraftWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmojiPicker } from './EmojiPicker';
import { convertMinecraftColors } from '@/utils/minecraftColorToCss';

interface FloatingChatProps {
  isVisible: boolean;
  onToggle: () => void;
}

const FloatingChat = ({ isVisible, onToggle }: FloatingChatProps) => {
  const { user, profile } = useAuth();
  const { messages, connectionState, connect, disconnect, sendMessage, sendPrivateMessage, sendReaction, sendPin, isConnected, triggerThorTest } = useMinecraftWebSocket();
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('minecraft');
  const [pmRecipient, setPmRecipient] = useState<string | null>(null);
  const [showThorTest, setShowThorTest] = useState(false);
  const [thorTestMessage, setThorTestMessage] = useState('Hey Thor, what time is it?');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (pmRecipient) {
        await sendPrivateMessage(pmRecipient, newMessage);
        setPmRecipient(null);
      } else {
        await sendMessage(newMessage, profile?.role || 'default');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleEmojiSelect = (emoji: string, messageId: string) => {
    sendReaction(messageId, emoji);
  };

  const handlePin = (messageId: string, pinned: boolean) => {
    sendPin(messageId, !pinned);
  };

  const handlePrivateMessage = (recipient: string) => {
    setPmRecipient(recipient);
    setNewMessage(`@${recipient} `);
  };

  const handleThorTest = async () => {
    try {
      await triggerThorTest(thorTestMessage);
      setShowThorTest(false);
    } catch (error) {
      console.error('Thor test failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return connectionState.error || 'Error';
      default: return 'Disconnected';
    }
  };

  const formatMessage = (message: any) => {
    const time = new Date(message.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const formattedPlaceholders = message.placeholders ? Object.fromEntries(
      Object.entries(message.placeholders).map(([key, value]: [string, any]) => {
        const { formattedText, classes } = convertMinecraftColors(value);
        return [key, { text: formattedText, classes }];
      })
    ) : {};

    return {
      ...message,
      time,
      isJoinLeave: message.type === 'join' || message.type === 'leave',
      isSystem: message.type === 'system' || message.type === 'death' || message.type === 'town-created',
      isPrivate: message.type === 'private',
      isReaction: message.type === 'reaction',
      isPin: message.type === 'pin',
      formattedPlaceholders
    };
  };

  const filteredMessages = messages
    .filter(msg => {
      if (activeTab === 'minecraft') return true; // Show all messages in Minecraft tab
      if (activeTab === 'community') return msg.source === 'web' && !msg.isPrivate; // Show web non-private messages
      return false;
    })
    .map(formatMessage);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-950/50 dark:to-purple-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Community Chat</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/30">
              <TabsList className="grid w-full grid-cols-2 bg-blue-100/50 dark:bg-blue-900/50">
                <TabsTrigger value="minecraft" className="flex items-center gap-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <MessageCircle className="h-4 w-4" />
                  Minecraft
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Users className="h-4 w-4" />
                  Web Only
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 px-4">
              <TabsContent value="minecraft" className="h-full mt-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <Button
                      size="sm"
                      variant={isConnected ? "destructive" : "default"}
                      onClick={handleConnect}
                      className="flex-1"
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowThorTest(!showThorTest)}
                      title="Test Thor AI"
                    >
                      ⚡ Thor Test
                    </Button>
                  </div>
                  
                  {showThorTest && (
                    <div className="p-2 border-b bg-muted/50">
                      <div className="space-y-2">
                        <Input
                          value={thorTestMessage}
                          onChange={(e) => setThorTestMessage(e.target.value)}
                          placeholder="Enter test message for Thor..."
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleThorTest} disabled={!isConnected}>
                            Test Thor
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowThorTest(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="flex-1 border border-blue-200 dark:border-blue-700 rounded-md p-3 bg-white/50 dark:bg-gray-800/50 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                    <div className="space-y-3">
                      {filteredMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3 text-sm bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 shadow-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={msg.source === 'minecraft' ? `https://mc-heads.net/avatar/${msg.player}/32` : (profile?.avatar_url || undefined)} />
                            <AvatarFallback className="text-xs">
                              {msg.player.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 flex-wrap">
                              <span className="font-medium text-xs truncate">
                                {msg.isPrivate && msg.sender ? `${msg.sender} → ${msg.player}` : msg.player}
                              </span>
                              <Badge 
                                variant={msg.isPrivate ? 'default' : 'secondary'} 
                                className={`text-xs px-1 py-0 ${msg.isPrivate ? 'bg-purple-100 text-purple-800' : ''}`}
                              >
                                {msg.source === 'web' ? 'Web' : 'MC'}
                                {msg.isPrivate && ' (PM)'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {msg.time}
                              </span>
                              {msg.type === 'chat' && user && (
                                <div className="flex items-center space-x-1">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        😊
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <EmojiPicker onEmojiSelect={(emoji: string) => handleEmojiSelect(emoji, msg.id)} />
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handlePrivateMessage(msg.player)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  {profile?.role === 'admin' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handlePin(msg.id, !!msg.pinned)}
                                    >
                                      {msg.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className={`text-xs break-words ${
                              msg.isJoinLeave ? 'text-muted-foreground italic' :
                              msg.isSystem ? 'text-red-600 italic' :
                              msg.isPrivate ? 'text-purple-600' :
                              msg.isReaction ? 'text-blue-600 italic' :
                              msg.isPin ? 'text-orange-600 italic' : ''
                            }`}>
                              {msg.message}
                            </p>
                            {msg.formattedPlaceholders && Object.keys(msg.formattedPlaceholders).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {msg.formattedPlaceholders.townyadvanced_town && (
                                  <span className={msg.formattedPlaceholders.townyadvanced_town.classes.join(' ')}>
                                    Town: {msg.formattedPlaceholders.townyadvanced_town.text}{' '}
                                  </span>
                                )}
                                {msg.formattedPlaceholders.townyadvanced_nation && (
                                  <span className={msg.formattedPlaceholders.townyadvanced_nation.classes.join(' ')}>
                                    Nation: {msg.formattedPlaceholders.townyadvanced_nation.text}
                                  </span>
                                )}
                              </div>
                            )}
                            {msg.emoji && (
                              <span className="text-xs text-blue-600">{msg.emoji}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="community" className="h-full mt-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      Web Users Only
                    </Badge>
                  </div>
                  
                  <ScrollArea className="flex-1 border border-blue-200 dark:border-blue-700 rounded-md p-3 bg-white/50 dark:bg-gray-800/50 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                    <div className="space-y-3">
                      {filteredMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3 text-sm bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 shadow-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {msg.player.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 flex-wrap">
                              <span className="font-medium text-xs truncate">
                                {msg.player}
                              </span>
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Web
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {msg.time}
                              </span>
                              {msg.type === 'chat' && user && (
                                <div className="flex items-center space-x-1">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        😊
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <EmojiPicker onEmojiSelect={(emoji: string) => handleEmojiSelect(emoji, msg.id)} />
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handlePrivateMessage(msg.player)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  {profile?.role === 'admin' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handlePin(msg.id, !!msg.pinned)}
                                    >
                                      {msg.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className={`text-xs break-words ${
                              msg.isJoinLeave ? 'text-muted-foreground italic' :
                              msg.isSystem ? 'text-red-600 italic' :
                              msg.isReaction ? 'text-blue-600 italic' :
                              msg.isPin ? 'text-orange-600 italic' : ''
                            }`}>
                              {msg.message}
                            </p>
                            {msg.formattedPlaceholders && Object.keys(msg.formattedPlaceholders).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {msg.formattedPlaceholders.townyadvanced_town && (
                                  <span className={msg.formattedPlaceholders.townyadvanced_town.classes.join(' ')}>
                                    Town: {msg.formattedPlaceholders.townyadvanced_town.text}{' '}
                                  </span>
                                )}
                                {msg.formattedPlaceholders.townyadvanced_nation && (
                                  <span className={msg.formattedPlaceholders.townyadvanced_nation.classes.join(' ')}>
                                    Nation: {msg.formattedPlaceholders.townyadvanced_nation.text}
                                  </span>
                                )}
                              </div>
                            )}
                            {msg.emoji && (
                              <span className="text-xs text-blue-600">{msg.emoji}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>

            <div className="p-4 border-t border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/30">
              {user ? (
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={pmRecipient ? `Private message to ${pmRecipient}...` : isConnected ? 'Type a message...' : 'Connect to chat'}
                    disabled={!isConnected}
                    className="flex-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-gray-800 dark:border-blue-600 dark:focus:border-blue-400"
                  />
                  {pmRecipient && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPmRecipient(null)}
                      className="h-8 w-8 p-0 hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={!isConnected || !newMessage.trim()}
                    size="sm"
                    className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    Send
                  </Button>
                </form>
              ) : (
                <div className="text-center text-sm text-blue-700 dark:text-blue-300">
                  Sign in to participate in chat
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingChat;