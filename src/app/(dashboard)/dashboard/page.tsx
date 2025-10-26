'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { TopList } from '@/components/dashboard/TopList';
import { useDashboardStats, useSalesData, useTopLists } from '@/hooks/useDashboard';
import { 
  DollarSign, 
  Percent, 
  Users, 
  BarChart3 
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesData, isLoading: salesLoading } = useSalesData();
  const { data: topLists, isLoading: topListsLoading } = useTopLists();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Amount Sales"
          value={statsLoading ? "Loading..." : stats?.totalSales?.formatted || "₱0.00"}
          icon={DollarSign}
          change={stats?.totalSales?.change}
          changeType="positive"
          subtitle={stats?.totalSales?.subtitle}
        />
        <StatsCard
          title="Total Amount Commission"
          value={statsLoading ? "Loading..." : stats?.totalCommission?.formatted || "₱0.00"}
          icon={Percent}
          change={stats?.totalCommission?.change}
          changeType="neutral"
          subtitle={stats?.totalCommission?.subtitle}
        />
        <StatsCard
          title="Leads"
          value={statsLoading ? "Loading..." : stats?.leads?.formatted || "0"}
          icon={Users}
          change={stats?.leads?.change}
          changeType="neutral"
        />
        <StatsCard
          title="Traffic"
          value={statsLoading ? "Loading..." : stats?.traffic?.formatted || "0"}
          icon={BarChart3}
          change={stats?.traffic?.change}
          changeType="neutral"
          subtitle={stats?.traffic?.subtitle}
        />
      </div>

      {/* Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <SalesChart 
          data={salesData || []} 
          isLoading={salesLoading}
        />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopList
          title="Top Referrer"
          items={topLists?.topReferrers || []}
          isLoading={topListsLoading}
        />
        <TopList
          title="Top Lead Generator"
          items={topLists?.topLeadGenerators || []}
          isLoading={topListsLoading}
        />
        <TopList
          title="Top Sharer"
          items={topLists?.topSharers || []}
          isLoading={topListsLoading}
        />
      </div>
    </div>
  );
}