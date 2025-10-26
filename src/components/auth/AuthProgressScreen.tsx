import React from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export interface AuthStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  errorMessage?: string;
  startTime?: number;
  endTime?: number;
}

interface AuthProgressScreenProps {
  steps: AuthStep[];
  isVisible: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const AuthProgressScreen: React.FC<AuthProgressScreenProps> = ({
  steps,
  isVisible,
  onRetry,
  onCancel,
}) => {
  console.log('🔍 AuthProgressScreen render - isVisible:', isVisible, 'steps count:', steps.length);

  if (!isVisible) {
    console.log('🔍 AuthProgressScreen - Not visible, returning null');
    return null;
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const hasError = steps.some(step => step.status === 'error');
  const errorStep = steps.find(step => step.status === 'error');

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">I AM +</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">COACHING & TRAINING SYSTEMS</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            {hasError ? 'Authentication Failed' : 'Authenticating...'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {hasError
              ? 'An error occurred during authentication'
              : 'Please wait while we securely sign you in'}
          </p>
        </div>

        <div className="mb-6">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {completedSteps} of {totalSteps} steps completed
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                step.status === 'in_progress'
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800'
                  : step.status === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : step.status === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {step.status === 'in_progress' && (
                  <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />
                )}
                {step.status === 'error' && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${
                      step.status === 'in_progress'
                        ? 'text-cyan-900 dark:text-cyan-100'
                        : step.status === 'completed'
                        ? 'text-green-900 dark:text-green-100'
                        : step.status === 'error'
                        ? 'text-red-900 dark:text-red-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.status === 'completed' && step.startTime && step.endTime && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-mono">
                      {(step.endTime - step.startTime).toFixed(0)}ms
                    </span>
                  )}
                  {step.status === 'in_progress' && step.startTime && (
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">
                      {(Date.now() - step.startTime).toFixed(0)}ms
                    </span>
                  )}
                </div>
                {step.status === 'error' && step.errorMessage && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {step.errorMessage}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasError && (
          <div className="space-y-3">
            {errorStep?.errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                  Error Details:
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {errorStep.errorMessage}
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
                >
                  Return to Login
                </button>
              )}
            </div>
          </div>
        )}

        {!hasError && completedSteps === totalSteps && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Authentication successful! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
