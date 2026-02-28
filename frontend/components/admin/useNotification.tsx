import React, { useState, useCallback } from 'react';
import Notification, { NotificationType } from './Notification';

interface NotificationState {
  message: string;
  type: NotificationType;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  /**
   * IMPORTANT: This is a React component, not a React element.
   * We previously returned a ReactNode here and used it as <NotificationComponent />,
   * which caused React's "Element type is invalid" error because the value was
   * sometimes null or an already-created element instead of a component function.
   */
  const NotificationComponent: React.FC = () =>
    notification ? (
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
};
