
import { useState, useEffect, useRef } from 'react';

export interface RealTimePlayerData {
  name: string;
  uuid: string;
  x: number;
  y: number;
  z: number;
  world: string;
  biome: string;
  block_below: string;
  health: number;
  food: number;
  level: number;
  weather: 'clear' | 'rain' | 'thunder' | 'snow';
  time: number;
  is_day: boolean;
}

export interface ServerWeather {
  weather: 'clear' | 'rain' | 'thunder' | 'snow';
  time: number;
  is_day: boolean;
  temperature: number;
}

export interface RecentActivity {
  id: string;
  type: 'achievement' | 'level_up' | 'join' | 'leave';
  player: string;
  message: string;
  timestamp: number;
}

export interface RealTimeData {
  players: RealTimePlayerData[];
  weather: ServerWeather;
  activities: RecentActivity[];
  performance: {
    tps: number;
    players_online: number;
  };
}

export const useRealTimePlayerData = () => {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = 'http://nordics.world:8085/api';
  const WS_URL = 'ws://nordics.world:8086';

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [playersRes, weatherRes, activityRes, performanceRes] = await Promise.all([
        fetch(`${API_BASE}/players`).catch(() => null),
        fetch(`${API_BASE}/weather`).catch(() => null),
        fetch(`${API_BASE}/activity`).catch(() => null),
        fetch(`${API_BASE}/performance`).catch(() => null)
      ]);

      const players = playersRes && playersRes.ok ? await playersRes.json() : [];
      const weather = weatherRes && weatherRes.ok ? await weatherRes.json() : { weather: 'clear', time: 0, is_day: true, temperature: 20 };
      const activities = activityRes && activityRes.ok ? await activityRes.json() : [];
      const performance = performanceRes && performanceRes.ok ? await performanceRes.json() : { tps: 20, players_online: 0 };

      setData({
        players: players || [],
        weather,
        activities: activities?.slice(0, 10) || [],
        performance
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch initial real-time data:', err);
      setError('Failed to connect to server');
      // Set fallback data
      setData({
        players: [],
        weather: { weather: 'clear', time: 0, is_day: true, temperature: 20 },
        activities: [],
        performance: { tps: 20, players_online: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Real-time WebSocket connected');
        setConnected(true);
        setError(null);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setData(prevData => {
            if (!prevData) return prevData;
            
            return {
              ...prevData,
              ...update
            };
          });
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('Real-time WebSocket disconnected');
        setConnected(false);
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection failed');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  };

  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    connected,
    refresh: fetchInitialData
  };
};
