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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the request body
    const { new_partnership_code } = await req.json();

    if (!new_partnership_code || typeof new_partnership_code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid new_partnership_code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate the partnership code format
    const trimmedCode = new_partnership_code.trim();
    if (trimmedCode.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Partnership code cannot be empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (trimmedCode.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Partnership code is too long (max 50 characters)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Only allow alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedCode)) {
      return new Response(
        JSON.stringify({ error: 'Partnership code can only contain letters, numbers, hyphens, and underscores' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if the partnership code is already in use by another user
    const { data: existingAffiliate, error: checkError } = await supabaseClient
      .from('affiliates')
      .select('user_id')
      .eq('partnership_code', trimmedCode)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing partnership code:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate partnership code' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingAffiliate && existingAffiliate.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'This partnership code is already in use by another user' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the partnership code
    const { data: updatedAffiliate, error: updateError } = await supabaseClient
      .from('affiliates')
      .update({ 
        partnership_code: trimmedCode,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating partnership code:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update partnership code', details: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!updatedAffiliate) {
      return new Response(
        JSON.stringify({ error: 'Affiliate record not found. Please create your profile first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Partnership code updated successfully',
        partnership_code: updatedAffiliate.partnership_code
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