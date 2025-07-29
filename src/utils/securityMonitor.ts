
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  action_type: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventQueue: SecurityEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startFlushInterval();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logEvent(event: SecurityEvent) {
    const enhancedEvent = {
      ...event,
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
    };

    this.eventQueue.push(enhancedEvent);

    // Flush immediately for critical events
    const criticalEvents = ['login_failure', 'privilege_escalation', 'account_deletion'];
    if (criticalEvents.includes(event.action_type)) {
      this.flushEvents();
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await supabase.functions.invoke('log-security-events', {
        body: { events }
      });
    } catch (error) {
      console.error('Failed to flush security events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private startFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  private getClientIP(): string {
    // In a real implementation, you'd get this from your server
    // For client-side, we can't reliably get the real IP
    return 'client-side';
  }

  // Monitor suspicious patterns
  monitorFailedLogins(email: string) {
    this.logEvent({
      action_type: 'login_failure',
      resource_type: 'auth',
      resource_id: email,
      success: false
    });
  }

  monitorPrivilegeEscalation(userId: string, fromRole: string, toRole: string) {
    this.logEvent({
      action_type: 'privilege_escalation',
      resource_type: 'user',
      resource_id: userId,
      old_values: { role: fromRole },
      new_values: { role: toRole },
      success: true
    });
  }

  monitorSensitiveDataAccess(resourceType: string, resourceId: string) {
    this.logEvent({
      action_type: 'sensitive_data_access',
      resource_type: resourceType,
      resource_id: resourceId,
      success: true
    });
  }

  // Cleanup when component unmounts
  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushEvents(); // Final flush
  }
}

export const securityMonitor = SecurityMonitor.getInstance();
