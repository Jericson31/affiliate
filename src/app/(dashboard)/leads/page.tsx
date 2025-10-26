'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LeadItem } from '@/components/dashboard/LeadItem';
import { useLeadsData } from '@/hooks/useDashboard';

export default function LeadsPage() {
  const { data: leadsData, isLoading } = useLeadsData();
  const [searchTerm, setSearchTerm] = useState('');

  const leads = leadsData?.leads || [];
  const totalCount = leadsData?.totalCount || 0;

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead: any) =>
    lead.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Leads <span className="text-gray-500">(Loading...)</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search Transaction"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>

          <div className="space-y-4 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
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
          Leads <span className="text-gray-500">(No. of Leads: {totalCount})</span>
        </h1>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Transaction"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div>Product</div>
          <div></div>
          <div>Description</div>
          <div>Status</div>
        </div>

        {/* Leads List */}
        <div>
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead: any) => (
              <LeadItem
                key={lead.id}
                id={lead.id}
                productImage={lead.productImage}
                productName={lead.productName}
                createdAt={lead.createdAt}
                description={lead.description}
                status={lead.status}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No leads found matching your search.' : 'No leads available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}