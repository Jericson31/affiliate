import { createClient } from '@/lib/supabase/server';

export interface AuthenticatedRequest {
  userId: string;
  userEmail: string;
  accessToken: string;
}

export async function validateServerAuth(): Promise<AuthenticatedRequest> {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Server Auth: Error getting user:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }

  if (!user) {
    console.warn('Server Auth: No authenticated user found');
    throw new Error('Unauthorized: No active session found');
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.warn('Server Auth: No active session found');
    throw new Error('Unauthorized: No active session found');
  }

  if (!session.access_token) {
    console.warn('Server Auth: Session missing access token');
    throw new Error('Unauthorized: Invalid session');
  }

  const expiresAt = session.expires_at;
  const currentTime = Date.now() / 1000;

  if (expiresAt && currentTime > expiresAt) {
    console.warn('Server Auth: Session has expired');
    throw new Error('Unauthorized: Session has expired');
  }

  return {
    userId: user.id,
    userEmail: user.email || '',
    accessToken: session.access_token,
  };
}

export async function requireServerAuth(
  handler: (auth: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  try {
    const auth = await validateServerAuth();
    return await handler(auth);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    console.error('Server Auth Middleware: Authentication failed -', message);

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
          'X-Auth-Status': 'failed',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export function createAuthenticatedServerHandler(
  handler: (auth: AuthenticatedRequest) => Promise<Response>
) {
  return async (): Promise<Response> => {
    return requireServerAuth(handler);
  };
}
