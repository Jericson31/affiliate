import { createClient } from '@/lib/supabase/client';

interface SessionValidationResult {
  isValid: boolean;
  user: any | null;
  error: string | null;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes - increased from 5 to reduce aggressive checks

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async validateSession(): Promise<SessionValidationResult> {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('SessionManager: Error getting session:', error);
        // Don't immediately invalidate on network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          console.warn('SessionManager: Network error, will retry later');
          return {
            isValid: true, // Assume valid on network errors to avoid false logouts
            user: null,
            error: null,
          };
        }
        return {
          isValid: false,
          user: null,
          error: error.message,
        };
      }

      if (!session || !session.user) {
        console.warn('SessionManager: No active session found');
        return {
          isValid: false,
          user: null,
          error: 'No active session found',
        };
      }

      if (!session.access_token) {
        console.warn('SessionManager: Session missing access token');
        return {
          isValid: false,
          user: null,
          error: 'Invalid session: missing access token',
        };
      }

      const expiresAt = session.expires_at;
      const currentTime = Date.now() / 1000;

      if (expiresAt && currentTime > expiresAt) {
        console.warn('SessionManager: Session has expired, attempting refresh');
        const refreshResult = await this.refreshSession();
        if (refreshResult.isValid) {
          console.log('SessionManager: Session successfully refreshed');
          return refreshResult;
        }
        return {
          isValid: false,
          user: null,
          error: 'Session has expired and refresh failed',
        };
      }

      const timeUntilExpiry = expiresAt ? expiresAt - currentTime : 0;
      const REFRESH_THRESHOLD = 10 * 60; // 10 minutes - increased from 5

      if (timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_THRESHOLD) {
        console.log('SessionManager: Token expiring soon, proactively refreshing');
        const refreshResult = await this.refreshSession();
        if (refreshResult.isValid) {
          console.log('SessionManager: Proactive refresh successful');
          return refreshResult;
        }
        console.warn('SessionManager: Proactive refresh failed, using existing session');
      }

      return {
        isValid: true,
        user: session.user,
        error: null,
      };
    } catch (error) {
      console.error('SessionManager: Exception during validation:', error);
      // Don't invalidate on exceptions, could be temporary issues
      return {
        isValid: true,
        user: null,
        error: null,
      };
    }
  }

  async refreshSession(): Promise<SessionValidationResult> {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          isValid: false,
          user: null,
          error: error.message,
        };
      }

      if (!session || !session.user) {
        return {
          isValid: false,
          user: null,
          error: 'Failed to refresh session',
        };
      }

      return {
        isValid: true,
        user: session.user,
        error: null,
      };
    } catch (error) {
      return {
        isValid: false,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  startPeriodicCheck(onSessionExpired?: () => void): void {
    if (this.sessionCheckInterval) {
      console.log('SessionManager: Periodic check already running');
      return;
    }

    console.log('SessionManager: Starting periodic session checks every', this.CHECK_INTERVAL / 1000, 'seconds');

    this.sessionCheckInterval = setInterval(async () => {
      console.log('SessionManager: Running periodic session check');
      const validation = await this.validateSession();

      if (!validation.isValid) {
        console.warn('SessionManager: Periodic check - session invalid:', validation.error);

        // Try to refresh one more time before calling the callback
        console.log('SessionManager: Attempting final refresh before expiring session');
        const refreshResult = await this.refreshSession();

        if (!refreshResult.isValid) {
          console.error('SessionManager: Final refresh failed, triggering session expiration callback');
          if (onSessionExpired) {
            onSessionExpired();
          }
        } else {
          console.log('SessionManager: Final refresh successful, session recovered');
        }
      } else {
        console.log('SessionManager: Periodic check - session is valid');
      }
    }, this.CHECK_INTERVAL);
  }

  stopPeriodicCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  async requireValidSession(): Promise<void> {
    const validation = await this.validateSession();

    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid session');
    }
  }
}

export const sessionManager = SessionManager.getInstance();
