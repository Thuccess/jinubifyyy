import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-muted mb-4">
            <svg
              className="w-10 h-10 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-text-secondary mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 btn-primary font-medium rounded-lg focus-visible:ring-offset-2"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 btn-secondary font-medium rounded-lg focus-visible:ring-offset-2"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
