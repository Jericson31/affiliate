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
      // Return empty lists if no affiliate record
      return NextResponse.json({
        topReferrers: [],
        topLeadGenerators: [],
        topSharers: []
      });
    }

    // For demo purposes, we'll create mock data
    // In a real implementation, you'd query your database for actual referral networks
    
    const topReferrers = [
      {
        id: '1',
        name: 'Trishia Serrano',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Sales', value: 83 },
        secondaryMetric: { label: 'Tickets', value: 137 },
        tertiaryMetric: { label: 'Total Sales', value: '₱1,532,000.00' }
      },
      {
        id: '2',
        name: 'russ juson',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Sales', value: 66 },
        secondaryMetric: { label: 'Tickets', value: 89 },
        tertiaryMetric: { label: 'Total Sales', value: '₱876,000.00' }
      },
      {
        id: '3',
        name: 'Lucky Guerzon',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Sales', value: 17 },
        secondaryMetric: { label: 'Tickets', value: 37 },
        tertiaryMetric: { label: 'Total Sales', value: '₱545,000.00' }
      },
      {
        id: '4',
        name: 'Reymond Delos Reyes',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Sales', value: 19 },
        secondaryMetric: { label: 'Tickets', value: 47 },
        tertiaryMetric: { label: 'Total Sales', value: '₱506,000.00' }
      },
      {
        id: '5',
        name: 'Coy Suico',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Sales', value: 19 },
        secondaryMetric: { label: 'Tickets', value: 35 },
        tertiaryMetric: { label: 'Total Sales', value: '₱385,000.00' }
      }
    ];

    const topLeadGenerators = [
      {
        id: '1',
        name: 'Reymond Delos Reyes',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Leads', value: 254 }
      },
      {
        id: '2',
        name: 'Migs Flores',
        avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Leads', value: 204 }
      },
      {
        id: '3',
        name: 'russ juson',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Leads', value: 164 }
      },
      {
        id: '4',
        name: 'Trishia Serrano',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Leads', value: 104 }
      },
      {
        id: '5',
        name: 'Val Domingo',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Leads', value: 54 }
      }
    ];

    const topSharers = [
      {
        id: '1',
        name: 'Routh Gar Flogio',
        avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Clicks', value: 9815 },
        secondaryMetric: { label: 'Unique', value: 7512 }
      },
      {
        id: '2',
        name: 'Migs Flores',
        avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Clicks', value: 2152 },
        secondaryMetric: { label: 'Unique', value: 1328 }
      },
      {
        id: '3',
        name: 'russ juson',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Clicks', value: 2607 },
        secondaryMetric: { label: 'Unique', value: 1184 }
      },
      {
        id: '4',
        name: 'Reymond Delos Reyes',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Clicks', value: 1554 },
        secondaryMetric: { label: 'Unique', value: 829 }
      },
      {
        id: '5',
        name: 'Val Domingo',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        primaryMetric: { label: 'Clicks', value: 831 },
        secondaryMetric: { label: 'Unique', value: 470 }
      }
    ];

    return NextResponse.json({
      topReferrers,
      topLeadGenerators,
      topSharers
    });
  } catch (error) {
    console.error('Top lists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}