import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopListItem {
  id: string;
  name: string;
  avatar?: string;
  primaryMetric: {
    label: string;
    value: string | number;
  };
  secondaryMetric?: {
    label: string;
    value: string | number;
  };
  tertiaryMetric?: {
    label: string;
    value: string | number;
  };
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  isLoading?: boolean;
}

export const TopList: React.FC<TopListProps> = ({ title, items, isLoading }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium">
                  {getInitials(item.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.primaryMetric.value}</span> {item.primaryMetric.label}
                  </span>
                  {item.secondaryMetric && (
                    <span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.secondaryMetric.value}</span> {item.secondaryMetric.label}
                    </span>
                  )}
                  {item.tertiaryMetric && (
                    <span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.tertiaryMetric.value}</span> {item.tertiaryMetric.label}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};