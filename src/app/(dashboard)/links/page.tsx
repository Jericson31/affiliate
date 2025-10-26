'use client';

import React from 'react';
import { LinkItem } from '@/components/links/LinkItem';
import { useLinksData } from '@/hooks/useDashboard';

export default function LinksPage() {
  const { data: linksData, isLoading } = useLinksData();

  const links = linksData?.links || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Links</h1>
        </div>

        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-start space-x-6">
                <div className="w-64 h-48 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2"></div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                  </div>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Links</h1>
      </div>

      {/* Links List */}
      <div className="space-y-6">
        {links.length > 0 ? (
          links.map((link: any) => (
            <LinkItem
              key={link.id}
              id={link.id}
              image={link.image}
              pageTitle={link.pageTitle}
              description={link.description}
              urlLink={link.urlLink}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No links available.</p>
          </div>
        )}
      </div>
    </div>
  );
}