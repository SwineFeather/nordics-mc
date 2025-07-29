
import { supabase } from '@/integrations/supabase/client';

export interface SecureWebSocketConfig {
  url: string;
  protocols?: string[];
  maxRetries?: number;
  retryDelay?: number;
}

export class SecureWebSocketService {
  private ws: WebSocket | null = null;
  private config: SecureWebSocketConfig;
  private retryCount = 0;
  private isAuthenticated = false;
  private authToken: string | null = null;
  private messageQueue: any[] = [];

  constructor(config: SecureWebSocketConfig) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      ...config
    };
    
    // Ensure WSS protocol for security
    if (this.config.url.startsWith('ws://')) {
      console.warn('Upgrading insecure WebSocket connection to WSS');
      this.config.url = this.config.url.replace('ws://', 'wss://');
    }
  }

  async connect(): Promise<void> {
    try {
      // Get authentication token
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        throw new Error('Authentication required for WebSocket connection');
      }

      this.authToken = session.access_token;

      // Create secure WebSocket connection
      this.ws = new WebSocket(this.config.url, this.config.protocols);

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.ws.onopen = () => {
          console.log('Secure WebSocket connected');
          this.authenticate();
          this.retryCount = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isAuthenticated = false;
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  private async authenticate(): Promise<void> {
    if (!this.ws || !this.authToken) {
      throw new Error('WebSocket or auth token not available');
    }

    // Send authentication message
    const authMessage = {
      type: 'auth',
      token: this.authToken,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth_success') {
        this.isAuthenticated = true;
        console.log('WebSocket authenticated successfully');
        
        // Send queued messages
        this.flushMessageQueue();
        return;
      }
      
      if (data.type === 'auth_failed') {
        console.error('WebSocket authentication failed:', data.error);
        this.disconnect();
        return;
      }

      // Handle other message types
      this.onMessage?.(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnect(): void {
    if (this.retryCount < (this.config.maxRetries || 3)) {
      this.retryCount++;
      console.log(`Reconnecting WebSocket (attempt ${this.retryCount})...`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.config.retryDelay);
    } else {
      console.error('Max WebSocket reconnection attempts reached');
    }
  }

  sendMessage(message: any): void {
    if (!this.isAuthenticated) {
      // Queue message until authenticated
      this.messageQueue.push(message);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
        auth_token: this.authToken
      }));
    } else {
      console.warn('WebSocket not connected, queueing message');
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
    this.authToken = null;
    this.messageQueue = [];
  }

  // Callback for incoming messages
  onMessage?: (data: any) => void;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
}
