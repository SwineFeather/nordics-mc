
import { useState, useCallback } from 'react';

interface RateLimitState {
  [key: string]: {
    attempts: number;
    lastAttempt: number;
    blockedUntil?: number;
  };
}

const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  register: { maxAttempts: 3, windowMs: 10 * 60 * 1000 }, // 3 attempts per 10 minutes
  api: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
};

export const useRateLimit = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({});

  const checkRateLimit = useCallback((action: keyof typeof RATE_LIMITS): boolean => {
    const now = Date.now();
    const limit = RATE_LIMITS[action];
    const state = rateLimitState[action];

    // If no previous attempts, allow
    if (!state) {
      setRateLimitState(prev => ({
        ...prev,
        [action]: { attempts: 1, lastAttempt: now }
      }));
      return true;
    }

    // If currently blocked, check if block period has expired
    if (state.blockedUntil && now < state.blockedUntil) {
      return false;
    }

    // If outside the time window, reset attempts
    if (now - state.lastAttempt > limit.windowMs) {
      setRateLimitState(prev => ({
        ...prev,
        [action]: { attempts: 1, lastAttempt: now }
      }));
      return true;
    }

    // If within window and under limit, increment attempts
    if (state.attempts < limit.maxAttempts) {
      setRateLimitState(prev => ({
        ...prev,
        [action]: { 
          attempts: state.attempts + 1, 
          lastAttempt: now 
        }
      }));
      return true;
    }

    // Rate limit exceeded, block for the remainder of the window
    const blockedUntil = state.lastAttempt + limit.windowMs;
    setRateLimitState(prev => ({
      ...prev,
      [action]: { 
        ...state, 
        blockedUntil 
      }
    }));
    return false;
  }, [rateLimitState]);

  const getRemainingAttempts = useCallback((action: keyof typeof RATE_LIMITS): number => {
    const state = rateLimitState[action];
    const limit = RATE_LIMITS[action];
    
    if (!state) return limit.maxAttempts;
    
    const now = Date.now();
    
    // If blocked, return seconds until unblocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return Math.ceil((state.blockedUntil - now) / 1000);
    }
    
    // If outside window, return max attempts
    if (now - state.lastAttempt > limit.windowMs) {
      return limit.maxAttempts;
    }
    
    return Math.max(0, limit.maxAttempts - state.attempts);
  }, [rateLimitState]);

  const resetRateLimit = useCallback((action: keyof typeof RATE_LIMITS) => {
    setRateLimitState(prev => {
      const newState = { ...prev };
      delete newState[action];
      return newState;
    });
  }, []);

  return {
    checkRateLimit,
    getRemainingAttempts,
    resetRateLimit
  };
};
