import { requireServerAuth } from '@/lib/auth/serverAuthMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        // Return empty leads if no affiliate record
        return NextResponse.json({
          leads: [],
          totalCount: 0
        });
      }

      // For demo purposes, we'll create mock leads data
      // In a real implementation, you'd query your database for actual leads

      const mockLeads = [
      {
        id: '1',
        productImage: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1',
        productName: 'Discovery - November 2023',
        createdAt: '2023-10-02T12:27:41.000Z',
        description: 'Personal Development Training Camp...',
        status: 'Unpublished'
      },
      {
        id: '2',
        productImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1',
        productName: 'Breakthrough 2023',
        createdAt: '2023-10-12T09:48:44.000Z',
        description: 'Breakthrough is a 3-day high energy and interactiv...',
        status: 'Unpublished'
      },
      {
        id: '3',
        productImage: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1',
        productName: 'Discovery - October 2023',
        createdAt: '2023-10-02T12:27:41.000Z',
        description: 'Personal Development Training Camp...',
        status: 'Unpublished'
      },
      {
        id: '4',
        productImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1',
        productName: 'Breakthrough - November 2023 - DP',
        createdAt: '2023-10-22T09:48:44.000Z',
        description: 'Breakthrough is a 3-day high energy and interactiv...',
        status: 'Draft'
      }
    ];

      return NextResponse.json({
        leads: mockLeads,
        totalCount: mockLeads.length
      });
    } catch (error) {
      console.error('Leads data error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}