'use client';

import React from 'react';
import { TopList } from '@/components/dashboard/TopList';
import { useTopLists } from '@/hooks/useDashboard';

export default function LeaderboardPage() {
  const { data: topLists, isLoading } = useTopLists();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
        </div>

        {/* Loading State */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
      </div>

      {/* Leaderboard Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopList
          title="Top 20 Referrer"
          items={topLists?.topReferrers || []}
          isLoading={isLoading}
        />
        <TopList
          title="Top 20 Lead Generator"
          items={topLists?.topLeadGenerators || []}
          isLoading={isLoading}
        />
        <TopList
          title="Top 20 Sharer"
          items={topLists?.topSharers || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}