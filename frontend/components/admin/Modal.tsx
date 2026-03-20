import React, { Fragment } from 'react';
import { XMarkIcon } from '../icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop – dimmed only; blur is handled by the bounded modal panel */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"></div>
        
        {/* Modal */}
        <div 
          className={`relative w-full ${sizeClasses[size]} surface surface--modal glass-interactive transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <h2 id="modal-title" className="text-2xl font-bold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
