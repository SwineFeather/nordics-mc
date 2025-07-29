
import { useEffect, useRef, useState } from 'react';
import { SecureWebSocketService } from '@/services/secureWebSocketService';
import { useAuth } from './useAuth';

interface UseSecureWebSocketProps {
  url: string;
  protocols?: string[];
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

export const useSecureWebSocket = ({
  url,
  protocols,
  onMessage,
  autoConnect = true
}: UseSecureWebSocketProps) => {
  const { user } = useAuth();
  const wsRef = useRef<SecureWebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !autoConnect) return;

    const connectWebSocket = async () => {
      try {
        if (wsRef.current) {
          wsRef.current.disconnect();
        }

        wsRef.current = new SecureWebSocketService({ url, protocols });
        wsRef.current.onMessage = (data) => {
          onMessage?.(data);
        };

        await wsRef.current.connect();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to connect to secure WebSocket:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, url, protocols, onMessage, autoConnect]);

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendMessage(message);
    } else {
      console.warn('Cannot send message: WebSocket not connected or authenticated');
    }
  };

  const reconnect = async () => {
    if (wsRef.current && user) {
      try {
        await wsRef.current.connect();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Reconnection failed');
      }
    }
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
    reconnect
  };
};
