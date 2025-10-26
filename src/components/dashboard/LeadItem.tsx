import React from 'react';

interface LeadItemProps {
  id: string;
  productImage: string;
  productName: string;
  createdAt: string;
  description: string;
  status: 'Unpublished' | 'Draft' | 'Published';
}

export const LeadItem: React.FC<LeadItemProps> = ({
  productImage,
  productName,
  createdAt,
  description,
  status
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Draft':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Unpublished':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={productImage}
          alt={productName}
          className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {productName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created on {formatDate(createdAt)}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {description}
        </p>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};