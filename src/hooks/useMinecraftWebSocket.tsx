import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { ThorMinecraftService } from '@/services/thorMinecraftService';

export interface MinecraftMessage {
  id: string;
  player: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'join' | 'leave' | 'system' | 'reaction' | 'pin' | 'private' | 'death' | 'town-created';
  source: 'minecraft' | 'web';
  isJoinLeave?: boolean;
  isPrivate?: boolean;
  messageId?: string;
  emoji?: string;
  pinned?: boolean;
  sender?: string;
  town?: string;
  placeholders?: Record<string, string>;
}

// Global connection management
let globalWsInstance: WebSocket | null = null;
let globalConnectionCallbacks: Set<(state: ConnectionState) => void> = new Set();
let globalMessageCallbacks: Set<(message: MinecraftMessage) => void> = new Set();
let globalPlayerName: string | null = null;
let isGloballyConnected = false;
let connectionAttemptInProgress = false;
let sentMessages: Set<string> = new Set(); // Track sent message IDs to prevent duplicates

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: string;
}

const cleanupGlobalConnection = () => {
  if (globalWsInstance) {
    globalWsInstance.close(1000, 'Manual disconnect');
    globalWsInstance = null;
  }
  isGloballyConnected = false;
  connectionAttemptInProgress = false;
  globalPlayerName = null;
  sentMessages.clear();
  globalConnectionCallbacks.forEach(callback => callback({ status: 'disconnected' }));
};

// Add to window for logout integration
(window as any).disconnectFromMinecraft = cleanupGlobalConnection;

export const useMinecraftWebSocket = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<MinecraftMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: 'disconnected' });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const hasJoinedRef = useRef(false);
  const instanceIdRef = useRef(Math.random().toString(36).substr(2, 9));

  const playNotificationSound = useCallback((type: MinecraftMessage['type'] = 'chat') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies: Record<MinecraftMessage['type'], number> = {
        chat: 800,
        join: 600,
        leave: 400,
        system: 500,
        reaction: 700,
        pin: 750,
        private: 650,
        death: 550,
        'town-created': 600
      };
      
      oscillator.frequency.value = frequencies[type] || 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio context error:', error);
    }
  }, []);

  const addJoinLeaveMessage = useCallback((playerName: string, type: 'join' | 'leave', source: 'minecraft' | 'web') => {
    const isSilentMode = (profile as any)?.silent_join_leave || false;
    if (isSilentMode && source === 'web') return;
    
    const joinLeaveMessage: MinecraftMessage = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      player: playerName,
      message: `${playerName} ${type === 'join' ? 'joined' : 'left'} the chat`,
      timestamp: new Date().toISOString(),
      type,
      source,
      isJoinLeave: true
    };
    
    setMessages(prev => [...prev, joinLeaveMessage]);
    globalMessageCallbacks.forEach(callback => callback(joinLeaveMessage));
    playNotificationSound(type);
  }, [playNotificationSound, profile]);

  const getPlayerName = useCallback(() => {
    if (!user || !profile) return null;
    return profile.full_name || user.email?.split('@')[0] || null;
  }, [user, profile]);

  useEffect(() => {
    const connectionCallback = (state: ConnectionState) => {
      setConnectionState(state);
    };

    const messageCallback = (message: MinecraftMessage) => {
      // Prevent duplicates by checking message ID
      if (sentMessages.has(message.id)) return;
      setMessages(prev => [...prev, message]);
      playNotificationSound(message.type);
      if (message.type === 'system' && message.message.includes('has been muted')) {
        toast.info(message.message);
      } else if (message.type === 'private' && message.sender === 'Server') {
        toast.error(message.message);
      }
    };

    globalConnectionCallbacks.add(connectionCallback);
    globalMessageCallbacks.add(messageCallback);

    return () => {
      globalConnectionCallbacks.delete(connectionCallback);
      globalMessageCallbacks.delete(messageCallback);
    };
  }, [playNotificationSound]);

  const connect = useCallback(() => {
    const playerName = getPlayerName();
    if (!playerName || !user?.id) {
      console.log('Cannot connect: User not authenticated or no display name');
      setConnectionState({ status: 'error', error: 'Authentication required' });
      return;
    }

    if (isGloballyConnected || connectionAttemptInProgress) {
      console.log('Already connected or connection in progress');
      setConnectionState({ status: 'connected' });
      return;
    }

    if (globalPlayerName && globalPlayerName !== playerName) {
      console.log(`Another user (${globalPlayerName}) is already connected`);
      setConnectionState({ status: 'error', error: 'Another user is already connected' });
      return;
    }

    connectionAttemptInProgress = true;
    globalConnectionCallbacks.forEach(callback => callback({ status: 'connecting' }));
    
    try {
      const wsUrl = 'wss://webchat.nordics.world';
      console.log('Connecting to WebSocket:', wsUrl, 'as player:', playerName);
      const ws = new WebSocket(wsUrl);
      globalWsInstance = ws;
      globalPlayerName = playerName;

      ws.onopen = () => {
        console.log('Connected to Minecraft WebSocket as:', playerName);
        isGloballyConnected = true;
        connectionAttemptInProgress = false;
        reconnectAttempts.current = 0;
        
        globalConnectionCallbacks.forEach(callback => callback({ status: 'connected' }));
        
        ws.send(JSON.stringify({ 
          token: 'NthelubSOehna2812385aSHahnt',
          player: playerName,
          userId: user.id,
          role: profile?.role || 'default'
        }));

        const isSilentMode = (profile as any)?.silent_join_leave || false;
        if (!hasJoinedRef.current && !isSilentMode) {
          addJoinLeaveMessage(playerName, 'join', 'web');
        }
        hasJoinedRef.current = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          // Handle thor_trigger messages from Minecraft plugin
          if (data.type === 'thor_trigger') {
            console.log(`⚡ Thor triggered by ${data.player}: ${data.message}`);
            
            // Process Thor trigger using the existing service
            const thorService = ThorMinecraftService.getInstance();
            
            // Set API key if not already set
            if (!thorService.isApiKeyConfigured()) {
              const apiKey = (window as any).XAI_API_KEY || import.meta.env.VITE_XAI_API_KEY || 'xai-mAYQCOyF28KXu1bePNLiPgtdNfIWgTEw1nddojyASc1tMEEgs22upLOY5KgvA5YXNk4NFiA5zmE6lE7i';
              if (apiKey) {
                thorService.setApiKey(apiKey);
              }
            }
            
            thorService.processMinecraftMessage(
              data.message,
              data.player || 'Unknown'
            ).then(thorResponse => {
              if (thorResponse && globalWsInstance && globalWsInstance.readyState === WebSocket.OPEN) {
                // Send each Thor message separately
                thorResponse.messages.forEach((message, index) => {
                  const thorMessageData = {
                    type: 'thor_response',
                    player: 'Thor',
                    message: message,
                    timestamp: new Date().toISOString()
                  };
                  
                  console.log(`⚡ Sending Thor response ${index + 1}/${thorResponse.messages.length} to Minecraft:`, thorMessageData);
                  globalWsInstance.send(JSON.stringify(thorMessageData));
                  
                  // Add small delay between messages to prevent spam
                  if (index < thorResponse.messages.length - 1) {
                    setTimeout(() => {}, 500);
                  }
                });
              }
            }).catch(error => {
              console.error('⚡ Error processing Thor trigger:', error);
              // Send error response back to Minecraft
              if (globalWsInstance && globalWsInstance.readyState === WebSocket.OPEN) {
                const errorResponse = {
                  type: 'thor_response',
                  player: 'Thor',
                  message: 'Sorry, I\'m having trouble thinking right now.',
                  timestamp: new Date().toISOString()
                };
                globalWsInstance.send(JSON.stringify(errorResponse));
              }
            });
            return; // Don't process as regular chat message
          }
          
          // Handle thor_response messages (if sent from another source)
          if (data.type === 'thor_response') {
            console.log(`⚡ Thor response received: ${data.message}`);
            
            const thorMessage: MinecraftMessage = {
              id: `thor-${Date.now()}-${Math.random()}`,
              player: 'Thor',
              message: data.message,
              timestamp: new Date().toISOString(),
              type: 'chat',
              source: 'minecraft'
            };
            
            setMessages(prev => [...prev, thorMessage]);
            globalMessageCallbacks.forEach(callback => callback(thorMessage));
            return; // Don't process as regular chat message
          }
          
          // Prevent processing the same message twice
          const messageId = `mc-${Date.now()}-${Math.random()}`;
          if (sentMessages.has(messageId)) return;

          const minecraftMessage: MinecraftMessage = {
            id: messageId,
            player: data.player || 'Unknown',
            message: data.message || (data.type === 'join' ? `${data.player} joined the chat` : data.type === 'leave' ? `${data.player} left the chat` : ''),
            timestamp: new Date().toISOString(),
            type: data.type,
            source: 'minecraft',
            isJoinLeave: data.type === 'join' || data.type === 'leave',
            isPrivate: data.type === 'private',
            messageId: data.messageId,
            emoji: data.emoji,
            pinned: data.pinned,
            sender: data.sender,
            town: data.town,
            placeholders: data.placeholders
          };

          if (data.type === 'private') {
            minecraftMessage.sender = data.sender;
            minecraftMessage.message = data.message;
          } else if (data.type === 'reaction') {
            minecraftMessage.message = `${data.player} reacted with ${data.emoji}`;
          } else if (data.type === 'pin') {
            minecraftMessage.message = `${data.player} ${data.pinned ? 'pinned' : 'unpinned'} a message`;
          } else if (data.type === 'death') {
            minecraftMessage.message = `${data.player} died!`;
          } else if (data.type === 'town-created') {
            minecraftMessage.message = `${data.player} created a new town: ${data.town}`;
          }

          setMessages(prev => [...prev, minecraftMessage]);
          globalMessageCallbacks.forEach(callback => callback(minecraftMessage));
          
          // Legacy Thor trigger handler removed - plugin now handles thor_trigger messages
        } catch (error) {
          console.error('WebSocket message parse error:', error);
          if (typeof event.data === 'string' && (event.data.includes('banned') || event.data.includes('Invalid'))) {
            toast.error(event.data);
            setConnectionState({ status: 'error', error: event.data });
          }
        }
      };

      ws.onclose = (event) => {
        console.log('Minecraft WebSocket closed:', event.code, event.reason);
        isGloballyConnected = false;
        connectionAttemptInProgress = false;
        
        globalConnectionCallbacks.forEach(callback => callback({ status: 'disconnected' }));
        
        const isSilentMode = (profile as any)?.silent_join_leave || false;
        if (hasJoinedRef.current && globalPlayerName && !isSilentMode) {
          addJoinLeaveMessage(globalPlayerName, 'leave', 'web');
        }
        hasJoinedRef.current = false;

        if (event.code === 1008) {
          toast.error('You are banned from web chat');
          setConnectionState({ status: 'error', error: 'Banned from web chat' });
        } else if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts && getPlayerName()) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          globalWsInstance = null;
          globalPlayerName = null;
          sentMessages.clear();
        }
      };

      ws.onerror = (error) => {
        console.error('Minecraft WebSocket error:', error);
        connectionAttemptInProgress = false;
        globalConnectionCallbacks.forEach(callback => 
          callback({ status: 'error', error: 'Failed to connect to Minecraft server' })
        );
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      connectionAttemptInProgress = false;
      globalConnectionCallbacks.forEach(callback => 
        callback({ status: 'error', error: 'Failed to create connection' })
      );
    }
  }, [getPlayerName, user, profile]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    cleanupGlobalConnection();
    reconnectAttempts.current = 0;
    hasJoinedRef.current = false;
  }, []);

  const sendMessage = useCallback(async (message: string, role: string = 'default') => {
    const playerName = getPlayerName();
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }
    if (!playerName || !user?.id) {
      throw new Error('Must be logged in with a display name to send messages');
    }

    try {
      const messageId = `web-${Date.now()}-${Math.random()}`;
      const messageData = {
        type: 'message',
        player: playerName,
        userId: user.id,
        message,
        role
      };
      
      console.log('Sending message:', messageData);
      globalWsInstance.send(JSON.stringify(messageData));
      sentMessages.add(messageId);
      
      const webMessage: MinecraftMessage = {
        id: messageId,
        player: playerName,
        message,
        timestamp: new Date().toISOString(),
        type: 'chat',
        source: 'web'
      };
      
      setMessages(prev => [...prev, webMessage]);
      globalMessageCallbacks.forEach(callback => callback(webMessage));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      throw new Error('Failed to send message to Minecraft server');
    }
  }, [getPlayerName, user]);

  const sendPrivateMessage = useCallback(async (recipient: string, message: string) => {
    const playerName = getPlayerName();
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }
    if (!playerName || !user?.id) {
      throw new Error('Must be logged in with a display name to send messages');
    }

    try {
      const messageId = `web-private-${Date.now()}-${Math.random()}`;
      const messageData = {
        type: 'private',
        sender: playerName,
        player: recipient,
        userId: user.id,
        message
      };
      
      console.log('Sending private message:', messageData);
      globalWsInstance.send(JSON.stringify(messageData));
      sentMessages.add(messageId);
      
      const webMessage: MinecraftMessage = {
        id: messageId,
        player: recipient,
        sender: playerName,
        message: `[PM to ${recipient}] ${message}`,
        timestamp: new Date().toISOString(),
        type: 'private',
        source: 'web'
      };
      
      setMessages(prev => [...prev, webMessage]);
      globalMessageCallbacks.forEach(callback => callback(webMessage));
      toast.success(`Private message sent to ${recipient}`);
    } catch (error) {
      console.error('Failed to send private message:', error);
      toast.error('Failed to send private message');
      throw new Error('Failed to send private message to Minecraft server');
    }
  }, [getPlayerName, user]);

  const sendReaction = useCallback(async (messageId: string, emoji: string) => {
    const playerName = getPlayerName();
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }
    if (!playerName || !user?.id) {
      throw new Error('Must be logged in with a display name to send reactions');
    }

    try {
      const messageIdReaction = `web-reaction-${Date.now()}-${Math.random()}`;
      const reactionData = {
        type: 'reaction',
        player: playerName,
        userId: user.id,
        messageId,
        emoji
      };
      
      console.log('Sending reaction:', reactionData);
      globalWsInstance.send(JSON.stringify(reactionData));
      sentMessages.add(messageIdReaction);
      
      const webMessage: MinecraftMessage = {
        id: messageIdReaction,
        player: playerName,
        message: `${playerName} reacted with ${emoji}`,
        timestamp: new Date().toISOString(),
        type: 'reaction',
        source: 'web',
        messageId,
        emoji
      };
      
      setMessages(prev => [...prev, webMessage]);
      globalMessageCallbacks.forEach(callback => callback(webMessage));
      toast.success('Reaction added');
    } catch (error) {
      console.error('Failed to send reaction:', error);
      toast.error('Failed to send reaction');
      throw new Error('Failed to send reaction to Minecraft server');
    }
  }, [getPlayerName, user]);

  const sendThorResponse = useCallback(async (message: string) => {
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }

    try {
      const messageId = `web-thor-${Date.now()}-${Math.random()}`;
      const thorMessageData = {
        type: 'thor_response',
        player: 'Thor',
        message: message,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending Thor response:', thorMessageData);
      globalWsInstance.send(JSON.stringify(thorMessageData));
      sentMessages.add(messageId);
      
      const webMessage: MinecraftMessage = {
        id: messageId,
        player: 'Thor',
        message,
        timestamp: new Date().toISOString(),
        type: 'chat',
        source: 'web'
      };
      
      setMessages(prev => [...prev, webMessage]);
      globalMessageCallbacks.forEach(callback => callback(webMessage));
      toast.success('Thor response sent');
    } catch (error) {
      console.error('Failed to send Thor response:', error);
      toast.error('Failed to send Thor response');
      throw new Error('Failed to send Thor response to Minecraft server');
    }
  }, []);

  const triggerThorTest = useCallback(async (testMessage: string) => {
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }

    try {
      console.log('🧪 Testing Thor with message:', testMessage);
      
      // Process the test message through Thor service
      const thorService = ThorMinecraftService.getInstance();
      
      // Set API key if not already set
      if (!thorService.isApiKeyConfigured()) {
        const apiKey = (window as any).XAI_API_KEY || import.meta.env.VITE_XAI_API_KEY || 'xai-mAYQCOyF28KXu1bePNLiPgtdNfIWgTEw1nddojyASc1tMEEgs22upLOY5KgvA5YXNk4NFiA5zmE6lE7i';
        if (apiKey) {
          thorService.setApiKey(apiKey);
        }
      }
      
      const thorResponse = await thorService.processMinecraftMessage(
        testMessage,
        'TestUser'
      );
      
      if (thorResponse) {
        // Send each message separately
        thorResponse.messages.forEach((message, index) => {
          const thorMessageData = {
            type: 'thor_response',
            player: 'Thor',
            message: message,
            timestamp: new Date().toISOString()
          };
          
          console.log(`🧪 Sending Thor test response ${index + 1}/${thorResponse.messages.length}:`, thorMessageData);
          globalWsInstance.send(JSON.stringify(thorMessageData));
          
          // Add small delay between messages to prevent spam
          if (index < thorResponse.messages.length - 1) {
            setTimeout(() => {}, 500);
          }
        });
        
        console.log('🧪 Thor test completed successfully');
      } else {
        console.log('🧪 Thor did not respond to test message');
        toast.info('Thor did not respond to test message');
      }
    } catch (error) {
      console.error('🧪 Thor test failed:', error);
      toast.error('Thor test failed');
      throw new Error('Failed to test Thor functionality');
    }
  }, []);

  const sendPin = useCallback(async (messageId: string, pinned: boolean) => {
    const playerName = getPlayerName();
    if (!globalWsInstance || globalWsInstance.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Minecraft server');
    }
    if (!playerName || !user?.id) {
      throw new Error('Must be logged in with a display name to pin messages');
    }

    try {
      const messageIdPin = `web-pin-${Date.now()}-${Math.random()}`;
      const pinData = {
        type: 'pin',
        player: playerName,
        userId: user.id,
        messageId,
        pinned
      };
      
      console.log('Sending pin:', pinData);
      globalWsInstance.send(JSON.stringify(pinData));
      sentMessages.add(messageIdPin);
      
      const webMessage: MinecraftMessage = {
        id: messageIdPin,
        player: playerName,
        message: `${playerName} ${pinned ? 'pinned' : 'unpinned'} a message`,
        timestamp: new Date().toISOString(),
        type: 'pin',
        source: 'web',
        messageId,
        pinned
      };
      
      setMessages(prev => [...prev, webMessage]);
      globalMessageCallbacks.forEach(callback => callback(webMessage));
      toast.success(pinned ? 'Message pinned' : 'Message unpinned');
    } catch (error) {
      console.error('Failed to send pin:', error);
      toast.error('Failed to pin/unpin message');
      throw new Error('Failed to pin/unpin message to Minecraft server');
    }
  }, [getPlayerName, user]);

  useEffect(() => {
    if (!getPlayerName()) {
      disconnect();
    }
  }, [getPlayerName, disconnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    connectionState,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    sendReaction,
    sendPin,
    sendThorResponse,
    triggerThorTest,
    isConnected: connectionState.status === 'connected'
  };
};
