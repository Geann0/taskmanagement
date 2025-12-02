import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-3 flex items-start gap-3 animate-slideIn`}
    >
      <span className="text-2xl font-bold flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium whitespace-pre-line">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-white hover:text-gray-200 text-xl font-bold flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
