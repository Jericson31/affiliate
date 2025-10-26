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
      // Return empty links if no affiliate record
      return NextResponse.json({
        links: [],
        totalCount: 0
      });
    }

    // For demo purposes, we'll create mock links data
    // In a real implementation, you'd query your database for actual affiliate links
    
    const mockLinks = [
      {
        id: '1',
        image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        pageTitle: 'Discovery Cavite (Sept 27 and 28, 2025) - Complete Your Journey to Personal Mastery',
        description: 'DISCOVERY is a two-day experiential course designed to reveal the belief systems that have been holding you back in creating the life that you truly want.',
        urlLink: 'https://iampluscoaching.net/discovery-cavite?ref=ken'
      },
      {
        id: '2',
        image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        pageTitle: 'Discovery Manila (Oct 04 and 05, 2025) - Complete Your Journey to Personal Mastery',
        description: 'DISCOVERY is a two-day experiential course designed to reveal the belief systems that have been holding you back in creating the life that you truly want.',
        urlLink: 'https://iampluscoaching.net/discovery-manila?ref=ken'
      }
    ];

      return NextResponse.json({
        links: mockLinks,
        totalCount: mockLinks.length
      });
    } catch (error) {
      console.error('Links data error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}