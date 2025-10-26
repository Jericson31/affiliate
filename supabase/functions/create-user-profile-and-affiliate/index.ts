import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { user_id, email } = await req.json()

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and email' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing profile and affiliate for user:', user_id, email)

    let profileData;
    let affiliateData;
    let profileCreated = false;
    let affiliateCreated = false;

    // 1. Check for existing user profile
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingProfileError) {
      console.error('Error checking existing user profile:', existingProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing user profile', details: existingProfileError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingProfile) {
      console.log('User profile already exists:', existingProfile);
      profileData = existingProfile;
    } else {
      // Create user profile if it doesn't exist
      console.log('Creating new user profile for user:', user_id, email);
      const { data: newProfileData, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user_id,
          email: email,
          role: 'affiliate'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile', details: profileError }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      profileData = newProfileData;
      profileCreated = true;
      console.log('New user profile created successfully:', profileData);
    }

    // 2. Check for existing affiliate record
    const { data: existingAffiliate, error: existingAffiliateError } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingAffiliateError) {
      console.error('Error checking existing affiliate record:', existingAffiliateError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing affiliate record', details: existingAffiliateError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingAffiliate) {
      console.log('Affiliate record already exists:', existingAffiliate);
      affiliateData = existingAffiliate;
    } else {
      // Generate a unique partnership code based on email
      const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const partnershipCode = `${emailPrefix}-${randomSuffix}`;

      console.log('Creating new affiliate record for user:', user_id, 'with partnership_code:', partnershipCode);

      const { data: newAffiliateData, error: affiliateError } = await supabaseAdmin
        .from('affiliates')
        .insert({
          user_id: user_id,
          partnership_code: partnershipCode
        })
        .select()
        .single();

      if (affiliateError) {
        console.error('Error creating affiliate record:', affiliateError);
        return new Response(
          JSON.stringify({ error: 'Failed to create affiliate record', details: affiliateError }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      affiliateData = newAffiliateData;
      affiliateCreated = true;
      console.log('New affiliate record created successfully:', affiliateData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: profileData,
        affiliate: affiliateData,
        profile_status: profileCreated ? 'created' : 'already_exists',
        affiliate_status: affiliateCreated ? 'created' : 'already_exists'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});