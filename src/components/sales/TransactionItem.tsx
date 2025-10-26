import React from 'react';

interface TransactionItemProps {
  id: string;
  transactionId: string;
  createdAt: string;
  respondedAt?: string;
  referenceNumber: string;
  paymentMethod: string;
  totalAmount: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  purchaserName: string;
  purchaserEmail: string;
  purchaserMobile: string;
  productName: string;
  ticketCount: number;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transactionId,
  createdAt,
  respondedAt,
  referenceNumber,
  paymentMethod,
  totalAmount,
  status,
  purchaserName,
  purchaserEmail,
  purchaserMobile,
  productName,
  ticketCount
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
    <div className="grid grid-cols-5 gap-6 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
      {/* Transaction */}
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Transaction ID: </span>
          <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {transactionId}
          </a>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created on {formatDate(createdAt)}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Reference #: </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{referenceNumber}</span>
        </div>
        {respondedAt && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Responded on {formatDate(respondedAt)}
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment Method: </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{paymentMethod}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Amount: </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{totalAmount}</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Purchaser */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {purchaserName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Email: <a href={`mailto:${purchaserEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            {purchaserEmail}
          </a>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Mobile: <a href={`tel:${purchaserMobile}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            {purchaserMobile}
          </a>
        </div>
      </div>

      {/* Product */}
      <div className="space-y-1">
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Product Name: </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{productName}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          No. of Ticket: {ticketCount}
        </div>
      </div>
    </div>
  );
};