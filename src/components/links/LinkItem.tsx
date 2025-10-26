import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface LinkItemProps {
  id: string;
  image: string;
  pageTitle: string;
  description: string;
  urlLink: string;
}

export const LinkItem: React.FC<LinkItemProps> = ({
  image,
  pageTitle,
  description,
  urlLink
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
      <div className="flex items-start space-x-6">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={image}
            alt={pageTitle}
            className="w-64 h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Page Title */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Page Title:
            </h3>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {pageTitle}
            </h2>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Description:
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* URL Link */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              URL Link:
            </h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={urlLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};