import { requireServerAuth } from '@/lib/auth/serverAuthMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get affiliate ID for the authenticated user
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      // Return default sales stats if no affiliate record
      const defaultSalesStats = {
        successTransaction: {
          value: '₱0',
          details: '+ 0 Sales: 0 Tickets: 0'
        },
        totalAmountCommission: {
          value: '₱0',
          details: '+ 0 Total no. of sales: 0'
        },
        pendingOrFailed: {
          value: '₱0',
          details: null
        },
        allTransaction: {
          value: '₱0',
          details: null
        }
      };
      return NextResponse.json(defaultSalesStats);
    }

    // For demo purposes, we'll create mock sales statistics
    // In a real implementation, you'd query your database for actual sales data
    
    const salesStats = {
      successTransaction: {
        value: '₱344,500',
        details: '+ 0 Sales: 31 Tickets: 43'
      },
      totalAmountCommission: {
        value: '₱0',
        details: '+ 0 Total no. of sales: 31'
      },
      pendingOrFailed: {
        value: '₱394,000',
        details: null
      },
      allTransaction: {
        value: '₱738,500',
        details: null
      }
    };

    return NextResponse.json(salesStats);
  } catch (error) {
    console.error('Sales stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}