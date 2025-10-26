'use client';

import React, { useState } from 'react';
import { Search, FileText, Percent, AlertTriangle, BarChart3 } from 'lucide-react';
import { SalesStatsCard } from '@/components/sales/SalesStatsCard';
import { TransactionItem } from '@/components/sales/TransactionItem';
import { useSalesStats, useTransactionsData } from '@/hooks/useDashboard';

export default function SalesPage() {
  const { data: salesStats, isLoading: statsLoading } = useSalesStats();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactionsData();
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction: any) =>
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.purchaserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statsLoading || transactionsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sales <span className="text-gray-500">(Loading...)</span>
          </h1>
        </div>

        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Transactions Loading */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search Customer"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>

          <div className="space-y-4 p-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-6 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sales <span className="text-gray-500">(No. of Transactions: {totalCount})</span>
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesStatsCard
          title="SUCCESS TRANSACTION"
          value={salesStats?.successTransaction?.value || '₱0'}
          icon={FileText}
          details={salesStats?.successTransaction?.details}
          iconColor="text-blue-600"
        />
        <SalesStatsCard
          title="TOTAL AMOUNT COMMISSION"
          value={salesStats?.totalAmountCommission?.value || '₱0'}
          icon={Percent}
          details={salesStats?.totalAmountCommission?.details}
          iconColor="text-green-600"
        />
        <SalesStatsCard
          title="PENDING OR FAILED"
          value={salesStats?.pendingOrFailed?.value || '₱0'}
          icon={AlertTriangle}
          iconColor="text-orange-600"
        />
        <SalesStatsCard
          title="ALL TRANSACTION"
          value={salesStats?.allTransaction?.value || '₱0'}
          icon={BarChart3}
          iconColor="text-purple-600"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-6 p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div>Transaction</div>
          <div>Payment</div>
          <div>Status</div>
          <div>Purchaser</div>
          <div>Product</div>
        </div>

        {/* Transactions List */}
        <div>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction: any) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                transactionId={transaction.transactionId}
                createdAt={transaction.createdAt}
                respondedAt={transaction.respondedAt}
                referenceNumber={transaction.referenceNumber}
                paymentMethod={transaction.paymentMethod}
                totalAmount={transaction.totalAmount}
                status={transaction.status}
                purchaserName={transaction.purchaserName}
                purchaserEmail={transaction.purchaserEmail}
                purchaserMobile={transaction.purchaserMobile}
                productName={transaction.productName}
                ticketCount={transaction.ticketCount}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No transactions found matching your search.' : 'No transactions available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}