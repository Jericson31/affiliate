import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireServerAuth } from '@/lib/auth/serverAuthMiddleware';

export async function GET(request: NextRequest) {
  return requireServerAuth(async (auth) => {
    try {
      const supabase = createClient();

      const { data: payoutInfo, error } = await supabase
        .from('payout_information')
        .select('*')
        .eq('user_id', auth.userId)
        .maybeSingle();

    if (error) {
      console.error('Error fetching payout information:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payout information' },
        { status: 500 }
      );
    }

      return NextResponse.json({ data: payoutInfo });
    } catch (error) {
      console.error('Payout GET error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return requireServerAuth(async (auth) => {
    try {
      const supabase = createClient();
      const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'payment_processor',
      'first_name',
      'last_name',
      'account_number',
      'email',
      'mobile_number',
      'street1',
      'city',
      'province'
    ];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

      // Check if payout information already exists
      const { data: existingPayout } = await supabase
        .from('payout_information')
        .select('id')
        .eq('user_id', auth.userId)
        .maybeSingle();

      let result;

      if (existingPayout) {
        // Update existing payout information
        const { data, error } = await supabase
          .from('payout_information')
          .update({
            payment_processor: body.payment_processor,
            first_name: body.first_name,
            middle_name: body.middle_name || null,
            last_name: body.last_name,
            account_number: body.account_number,
            email: body.email,
            country_code: body.country_code || '+63',
            mobile_number: body.mobile_number,
            birthdate: body.birthdate || null,
            nationality: body.nationality || null,
            country: body.country || 'Philippines',
            street1: body.street1,
            street2: body.street2 || null,
            barangay: body.barangay || null,
            city: body.city,
            province: body.province,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', auth.userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payout information:', error);
        return NextResponse.json(
          { error: 'Failed to update payout information' },
          { status: 500 }
        );
      }

        result = data;
      } else {
        // Insert new payout information
        const { data, error } = await supabase
          .from('payout_information')
          .insert({
            user_id: auth.userId,
          payment_processor: body.payment_processor,
          first_name: body.first_name,
          middle_name: body.middle_name || null,
          last_name: body.last_name,
          account_number: body.account_number,
          email: body.email,
          country_code: body.country_code || '+63',
          mobile_number: body.mobile_number,
          birthdate: body.birthdate || null,
          nationality: body.nationality || null,
          country: body.country || 'Philippines',
          street1: body.street1,
          street2: body.street2 || null,
          barangay: body.barangay || null,
          city: body.city,
          province: body.province
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payout information:', error);
        return NextResponse.json(
          { error: 'Failed to create payout information' },
          { status: 500 }
        );
      }

        result = data;
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Payout information saved successfully'
      });
    } catch (error) {
      console.error('Payout POST error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
