import type { ErrorResponse } from '../types/api';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ErrorResponse;
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors[0].msg;
    }
  }
  
  return 'An unexpected error occurred';
};

export const isApiError = (error: unknown): error is ErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'errors' in error)
  );
};

export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const logMessage = context ? `[${context}] ${message}` : message;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(logMessage, error);
  } else {
    // In production, you might want to send to an error tracking service
    console.error(logMessage);
  }
};
