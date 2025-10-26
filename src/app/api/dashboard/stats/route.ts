import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireServerAuth } from '@/lib/auth/serverAuthMiddleware';

export async function GET(request: NextRequest) {
  return requireServerAuth(async (auth) => {
    try {
      const supabase = createClient();

      // Get affiliate ID for the authenticated user
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', auth.userId)
        .single();

    if (!affiliate) {
      // If no affiliate record exists, return default stats
      const defaultStats = {
        totalSales: {
          value: 0,
          formatted: '₱0.00',
          change: '+0%',
          subtitle: 'Total no. of sales: 0'
        },
        totalCommission: {
          value: 0,
          formatted: '₱0.00',
          change: '+0',
          subtitle: 'Total no. of sales: 0'
        },
        leads: {
          value: 0,
          formatted: '0',
          change: '+0'
        },
        traffic: {
          value: 0,
          formatted: '0',
          change: '+0',
          subtitle: 'Clicks: 0 Unique: 0'
        }
      };
      return NextResponse.json(defaultStats);
    }

    // Fetch all required data in parallel
    const [transactionsRes, leadsRes, trafficRes] = await Promise.all([
      // Get transactions data
      supabase
        .from('transactions')
        .select('amount, commission_amount, status, created_at')
        .eq('affiliate_id', affiliate.id),
      
      // Get leads data
      supabase
        .from('leads')
        .select('status, created_at')
        .eq('affiliate_id', affiliate.id),
      
      // Get traffic data (assuming you have a clicks/traffic table)
      supabase
        .from('affiliate_clicks')
        .select('created_at, unique_visitor')
        .eq('affiliate_id', affiliate.id)
    ]);

    const transactions = transactionsRes.data || [];
    const leads = leadsRes.data || [];
    const traffic = trafficRes.data || [];

    // Calculate statistics
    const totalSales = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalCommission = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.commission_amount || 0), 0);

    const totalLeads = leads.length;

    const totalClicks = traffic.length;
    const uniqueVisitors = traffic.filter(t => t.unique_visitor).length;

    // Calculate previous period for comparison (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentTransactions = transactions.filter(t => 
      new Date(t.created_at) >= thirtyDaysAgo
    );
    const previousTransactions = transactions.filter(t => 
      new Date(t.created_at) >= sixtyDaysAgo && new Date(t.created_at) < thirtyDaysAgo
    );

    const recentSales = recentTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const previousSales = previousTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const salesChange = previousSales > 0 
      ? ((recentSales - previousSales) / previousSales * 100).toFixed(1)
      : '0';

    const stats = {
      totalSales: {
        value: totalSales,
        formatted: new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 0
        }).format(totalSales),
        change: `${salesChange > 0 ? '+' : ''}${salesChange}%`,
        subtitle: `Total no. of sales: ${transactions.filter(t => t.status === 'completed').length}`
      },
      totalCommission: {
        value: totalCommission,
        formatted: new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2
        }).format(totalCommission),
        change: `+ 0`,
        subtitle: `Total no. of sales: ${transactions.filter(t => t.status === 'completed').length}`
      },
      leads: {
        value: totalLeads,
        formatted: totalLeads.toString(),
        change: `+ 0`
      },
      traffic: {
        value: totalClicks,
        formatted: totalClicks.toString(),
        change: `+ 0`,
        subtitle: `Clicks: ${totalClicks} Unique: ${uniqueVisitors}`
      }
    };

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}