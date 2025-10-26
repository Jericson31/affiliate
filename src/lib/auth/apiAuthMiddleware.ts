import { createClient } from '@/lib/supabase/client';
import { sessionManager } from './sessionManager';

export interface AuthenticatedRequest {
  userId: string;
  userEmail: string;
  accessToken: string;
}

export async function validateApiAuth(): Promise<AuthenticatedRequest> {
  const supabase = createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('API Auth: Error getting session:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }

  if (!session || !session.user) {
    console.warn('API Auth: No active session found');
    throw new Error('Unauthorized: No active session found');
  }

  if (!session.access_token) {
    console.warn('API Auth: Session missing access token');
    throw new Error('Unauthorized: Invalid session');
  }

  const expiresAt = session.expires_at;
  const currentTime = Date.now() / 1000;

  if (expiresAt && currentTime > expiresAt) {
    console.warn('API Auth: Session has expired');
    throw new Error('Unauthorized: Session has expired');
  }

  const validation = await sessionManager.validateSession();
  if (!validation.isValid) {
    console.warn('API Auth: Session validation failed:', validation.error);
    throw new Error(`Unauthorized: ${validation.error}`);
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email || '',
    accessToken: session.access_token,
  };
}

export async function requireAuth(handler: (auth: AuthenticatedRequest) => Promise<Response>): Promise<Response> {
  try {
    const auth = await validateApiAuth();
    return await handler(auth);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    console.error('API Auth Middleware: Authentication failed -', message);

    return new Response(
      JSON.stringify({
        error: message,
        authenticated: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Status': 'failed'
        },
      }
    );
  }
}

export function createAuthenticatedHandler(
  handler: (auth: AuthenticatedRequest) => Promise<Response>
) {
  return async (): Promise<Response> => {
    return requireAuth(handler);
  };
}
