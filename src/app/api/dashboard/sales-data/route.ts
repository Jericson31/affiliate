import { requireServerAuth } from '@/lib/auth/serverAuthMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format, subDays, eachDayOfInterval } from 'date-fns';

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
      // Return empty chart data if no affiliate record
      return NextResponse.json([]);
    }

    // Get date range (last 10 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 9);

    // Generate all dates in range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Fetch transactions for the date range
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, commission_amount, created_at, status')
      .eq('affiliate_id', affiliate.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'completed');

    // Group transactions by date
    const transactionsByDate = (transactions || []).reduce((acc, transaction) => {
      const date = format(new Date(transaction.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { sales: 0, commission: 0 };
      }
      acc[date].sales += transaction.amount || 0;
      acc[date].commission += transaction.commission_amount || 0;
      return acc;
    }, {} as Record<string, { sales: number; commission: number }>);

    // Create chart data with all dates (including zeros)
    const chartData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = transactionsByDate[dateStr] || { sales: 0, commission: 0 };
      
      return {
        date: dateStr,
        sales: data.sales,
        commission: data.commission
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Sales data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}