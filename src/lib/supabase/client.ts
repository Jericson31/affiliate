import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Supabase Client Configuration:');
  console.log('URL:', supabaseUrl);
  console.log('Key present:', supabaseAnonKey ? 'Yes' : 'No');
  console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = `Missing Supabase environment variables:
    - URL: ${supabaseUrl ? '✓ Present' : '✗ Missing'}
    - Key: ${supabaseAnonKey ? '✓ Present' : '✗ Missing'}
    
    Please check your .env file contains:
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key`;
    
    console.error(error);
    throw new Error(error);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (e) {
    const error = `Invalid Supabase URL format: ${supabaseUrl}`;
    console.error(error);
    throw new Error(error);
  }

  // Validate anon key format (should be a JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    const error = `Invalid Supabase anon key format. Key should start with 'eyJ'`;
    console.error(error);
    throw new Error(error);
  }

  // Decode and validate JWT expiration
  try {
    const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
    console.log('🔍 JWT Payload:', payload);

    if (payload.exp && payload.iat) {
      const expirationDate = new Date(payload.exp * 1000);
      const issuedDate = new Date(payload.iat * 1000);
      const now = new Date();

      if (now > expirationDate) {
        console.error('⚠️ Supabase anon key has expired!');
        console.error(`   Expired on: ${expirationDate.toISOString()}`);
        console.error(`   Current time: ${now.toISOString()}`);
      } else {
        const daysUntilExpiry = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log('✅ Supabase anon key is valid');
        console.log(`   Issued: ${issuedDate.toISOString()}`);
        console.log(`   Expires: ${expirationDate.toISOString()} (${daysUntilExpiry} days remaining)`);
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not validate JWT expiration:', e);
  }

  console.log('✅ Supabase client configuration valid');

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token'
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        let cookie = `${name}=${value}`;
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
        if (options?.secure) cookie += '; Secure';
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return;
        this.set(name, '', { ...options, maxAge: 0 });
      }
    }
  });
}