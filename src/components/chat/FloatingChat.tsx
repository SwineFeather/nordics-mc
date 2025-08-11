import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Users, Pin, PinOff, Wifi, WifiOff, Zap, Smile } from 'lucide-react';
import { useMinecraftWebSocket } from '@/hooks/useMinecraftWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const { messages, connectionState, connect, disconnect, sendMessage, sendPrivateMessage, sendReaction, sendPin, isConnected } = useMinecraftWebSocket();
  const [newMessage, setNewMessage] = useState('');
  const [pmRecipient, setPmRecipient] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Remove auto-connect - let users manually connect when they want to chat
  // useEffect(() => {
  //   if (!isConnected && connectionState.status !== 'connecting') {
  //     connect();
  //   }
  // }, [isConnected, connectionState.status, connect]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return 'bg-green-500 animate-pulse';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState.status) {
      case 'connected': return <Wifi className="h-3 w-3 text-green-600" />;
      case 'connecting': return <Zap className="h-3 w-3 text-yellow-600 animate-spin" />;
      case 'error': return <WifiOff className="h-3 w-3 text-red-600" />;
      default: return <WifiOff className="h-3 w-3 text-gray-600" />;
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

  // Filter out duplicate messages and only show unique ones
  const filteredMessages = messages
    .filter((msg, index, arr) => {
      // Remove duplicates by checking if this message is the same as the previous one
      if (index === 0) return true;
      const prevMsg = arr[index - 1];
      return !(
        msg.player === prevMsg.player &&
        msg.message === prevMsg.message &&
        Math.abs(new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) < 1000
      );
    })
    .map(formatMessage);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-110 border-0"
        >
          <MessageCircle className="h-6 w-6" />
          {isConnected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="w-96 h-[600px] shadow-2xl border border-border bg-card/95 backdrop-blur-md overflow-hidden">
        <CardHeader className="relative pb-3 flex flex-row items-center justify-between space-y-0 bg-muted/80 border-b border-border backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-200">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Minecraft Chat
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-xs text-muted-foreground font-medium">{getStatusText()}</span>
                {getStatusIcon()}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hover:bg-muted/50 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="relative p-0 flex flex-col h-[calc(600px-80px)]">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
              <Button
                size="sm"
                variant={isConnected ? "destructive" : "default"}
                onClick={handleConnect}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
              {isTyping && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1 p-3 bg-muted/10">
              <div className="space-y-2">
                {filteredMessages.map((msg, index) => (
                  <div 
                    key={msg.id} 
                    className="flex items-start space-x-3 text-sm bg-card/70 rounded-lg p-3 border border-border/50 hover:border-border/80 hover:bg-card/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0 ring-2 ring-border/30 hover:ring-primary/50 transition-all duration-200">
                      <AvatarImage src={msg.source === 'minecraft' ? `https://mc-heads.net/avatar/${msg.player}/32` : (profile?.avatar_url || undefined)} />
                      <AvatarFallback className="text-xs bg-muted">
                        {msg.player.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap mb-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {msg.isPrivate && msg.sender ? `${msg.sender} → ${msg.player}` : msg.player}
                        </span>
                        <Badge 
                          variant={msg.isPrivate ? 'default' : 'secondary'} 
                          className={`text-xs px-2 py-1 font-medium ${msg.isPrivate ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}
                        >
                          {msg.source === 'web' ? 'Web' : 'MC'}
                          {msg.isPrivate && ' (PM)'}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          {msg.time}
                        </span>
                        {msg.type === 'chat' && user && (
                          <div className="flex items-center space-x-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted/80 rounded-full transition-all duration-200 hover:scale-110">
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
                              className="h-6 w-6 p-0 hover:bg-muted/80 rounded-full transition-all duration-200 hover:scale-110"
                              onClick={() => handlePrivateMessage(msg.player)}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            {profile?.role === 'admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted/80 rounded-full transition-all duration-200 hover:scale-110"
                                onClick={() => handlePin(msg.id, !!msg.pinned)}
                              >
                                {msg.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={`text-sm break-words leading-relaxed ${
                        msg.isJoinLeave ? 'text-muted-foreground italic' :
                        msg.isSystem ? 'text-destructive italic font-medium' :
                        msg.isPrivate ? 'text-primary italic font-medium' :
                        msg.isReaction ? 'text-accent italic' :
                        msg.isPin ? 'text-orange-600 italic font-medium' : 'text-foreground'
                      }`}>
                        {msg.message}
                      </p>
                      {msg.formattedPlaceholders && Object.keys(msg.formattedPlaceholders).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          {msg.formattedPlaceholders.townyadvanced_town && (
                            <span className={`${msg.formattedPlaceholders.townyadvanced_town.classes.join(' ')} px-2 py-1 rounded-md bg-muted/50`}>
                              🏘️ Town: {msg.formattedPlaceholders.townyadvanced_town.text}
                            </span>
                          )}
                          {msg.formattedPlaceholders.townyadvanced_nation && (
                            <span className={`${msg.formattedPlaceholders.townyadvanced_nation.classes.join(' ')} px-2 py-1 rounded-md bg-muted/50`}>
                              🏛️ Nation: {msg.formattedPlaceholders.townyadvanced_nation.text}
                            </span>
                          )}
                        </div>
                      )}
                      {msg.emoji && (
                        <span className="text-lg text-accent mt-2 block animate-bounce">{msg.emoji}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t border-border bg-muted/30 backdrop-blur-sm">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={pmRecipient ? `Private message to ${pmRecipient}...` : isConnected ? 'Type a message...' : 'Connect to chat'}
                  disabled={!isConnected}
                  className="flex-1 border-border focus:border-ring focus:ring-ring/20 bg-background/80 backdrop-blur-sm rounded-lg transition-all duration-200 focus:scale-[1.02]"
                />
                {pmRecipient && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPmRecipient(null)}
                    className="h-9 w-9 p-0 hover:bg-muted/80 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-muted/80 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <EmojiPicker onEmojiSelect={(emoji: string) => setNewMessage(prev => prev + emoji)} />
                  </PopoverContent>
                </Popover>
                <Button 
                  type="submit" 
                  disabled={!isConnected || !newMessage.trim()}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </Button>
              </form>
            ) : (
              <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 backdrop-blur-sm">
                Sign in to participate in chat
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingChat;