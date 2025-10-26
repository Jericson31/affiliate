import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface SalesStatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  details?: string;
  iconColor?: string;
}

export const SalesStatsCard: React.FC<SalesStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  details,
  iconColor = 'text-blue-600'
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <div className="p-2 mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
            <Icon className={`h-5 w-5 ${iconColor} dark:${iconColor.replace('600', '400')}`} />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          
          {details && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <span className="mr-1">↗</span>
              <span>{details}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};