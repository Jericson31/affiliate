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
      // Return empty transactions if no affiliate record
      return NextResponse.json({
        transactions: [],
        totalCount: 0
      });
    }

    // For demo purposes, we'll create mock transaction data
    // In a real implementation, you'd query your database for actual transactions
    
    const mockTransactions = [
      {
        id: '1',
        transactionId: 'TXNID250828553058848',
        createdAt: '2025-08-28T05:53:05.000Z',
        respondedAt: '2025-08-28T05:54:48.000Z',
        referenceNumber: 'ZFP4HNNZZO',
        paymentMethod: 'Xendit',
        totalAmount: '₱15,000.00',
        status: 'SUCCESS' as const,
        purchaserName: 'Shannella Mari Paredes',
        purchaserEmail: 'smsaparedes@gmail.com',
        purchaserMobile: '09392884039',
        productName: 'Discovery(Manila) - Se',
        ticketCount: 1
      },
      {
        id: '2',
        transactionId: 'TXNID250828552136635',
        createdAt: '2025-08-28T05:52:13.000Z',
        respondedAt: null,
        referenceNumber: 'GCH7MNPQRS',
        paymentMethod: 'Gcash',
        totalAmount: '₱15,000.00',
        status: 'PENDING' as const,
        purchaserName: 'Shannella Mari Paredes',
        purchaserEmail: 'smsapareses@gmail.com',
        purchaserMobile: '09392884039',
        productName: 'Discovery(Manila) - Se',
        ticketCount: 1
      }
    ];

      return NextResponse.json({
        transactions: mockTransactions,
        totalCount: mockTransactions.length
      });
    } catch (error) {
      console.error('Transactions data error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}