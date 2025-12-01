import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';

const NotificationPermissionBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      setShowBanner(currentPermission === 'default');
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!showBanner || permission !== 'default') {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Enable notifications to stay updated
              </p>
              <p className="text-xs text-blue-700">
                Get notified when you're assigned to cards or receive comments
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-blue-700 hover:text-blue-900"
            >
              Not now
            </button>
            <button
              onClick={handleRequestPermission}
              className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
