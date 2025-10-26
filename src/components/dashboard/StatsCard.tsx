import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  subtitle
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <div className="p-2 mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          
          {(change || subtitle) && (
            <div className="flex items-center space-x-2 text-sm">
              {change && (
                <span className={`font-medium ${getChangeColor()}`}>
                  {change}
                </span>
              )}
              {subtitle && (
                <span className="text-gray-500 dark:text-gray-400">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};