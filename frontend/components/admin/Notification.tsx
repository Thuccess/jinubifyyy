'use client';

import React, { useEffect } from 'react';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '../icons/Icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-brand-soft border-border-accent text-brand-primary',
    error: 'bg-surface-muted border-border-strong text-text-primary',
    warning: 'bg-surface-muted border-border-strong text-text-primary',
    info: 'bg-brand-soft border-border-accent text-brand-primary'
  };

  const icons = {
    success: <CheckIcon className="h-5 w-5 text-brand-primary" />,
    error: <XMarkIcon className="h-5 w-5 text-text-primary" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-text-primary" />,
    info: <InformationCircleIcon className="h-5 w-5 text-brand-primary" />
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full rounded-lg border shadow-lg p-4 ${typeStyles[type]} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label="Close notification"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
