import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '../icons/Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
    info: 'bg-brand-primary hover:opacity-90 text-text-inverted'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : variant === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-brand-soft'}`}>
            <ExclamationTriangleIcon className={`h-8 w-8 ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : variant === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-brand-primary'}`} />
          </div>
        </div>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium btn-secondary rounded-lg focus-visible:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-sm font-medium ${variantStyles[variant]} rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
