import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '../contexts/TranslationContext';

const NotificationBell = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = async () => {
    if (!isOpen) {
      await fetchNotifications();
      // Mark all notifications as read when opening the dropdown
      if (unreadCount > 0) {
        await markAllAsRead();
      }
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Translate notification content
  const translateNotification = (notification) => {
    // First try to match by type field if it exists
    if (notification.type) {
      const typeKey = `notifications.types.${notification.type}`;
      const translatedTitle = t(`${typeKey}.title`);
      const translatedMessage = t(`${typeKey}.message`);
      
      // If translation exists (doesn't return the key itself), use it
      if (translatedTitle !== `${typeKey}.title` && translatedMessage !== `${typeKey}.message`) {
        return {
          ...notification,
          title: translatedTitle,
          message: translatedMessage
        };
      }
    }
    
    // Fallback: Try to detect type from title content (for existing notifications)
    let detectedType = null;
    const title = notification.title.toLowerCase();
    
    if (title.includes('flight approved') || title.includes('approved')) {
      detectedType = 'flight_approved';
    } else if (title.includes('flight submitted') || title.includes('submitted for review')) {
      detectedType = 'flight_submitted';
    } else if (title.includes('booking confirmed') || title.includes('confirmed')) {
      detectedType = 'booking_confirmed';
    } else if (title.includes('payment received') || title.includes('payment')) {
      detectedType = 'payment_received';
    } else if (title.includes('flight denied') || title.includes('denied')) {
      detectedType = 'flight_denied';
    } else if (title.includes('flight deleted') || title.includes('deleted')) {
      detectedType = 'flight_deleted';
    }
    
    if (detectedType) {
      const typeKey = `notifications.types.${detectedType}`;
      const translatedTitle = t(`${typeKey}.title`);
      const translatedMessage = t(`${typeKey}.message`);
      
      // If translation exists, use it
      if (translatedTitle !== `${typeKey}.title` && translatedMessage !== `${typeKey}.message`) {
        return {
          ...notification,
          title: translatedTitle,
          message: translatedMessage,
          type: detectedType
        };
      }
    }
    
    // If no translation found, return original
    return notification;
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return t('notifications.timeJustNow');
    if (diffMinutes < 60) return t('notifications.timeMinutesAgo').replace('{minutes}', diffMinutes);
    if (diffHours < 24) return t('notifications.timeHoursAgo').replace('{hours}', diffHours);
    if (diffDays < 7) return t('notifications.timeDaysAgo').replace('{days}', diffDays);
    
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'flight_approved':
        return '✅';
      case 'flight_denied':
        return '❌';
      case 'flight_deleted':
        return '🗑️';
      case 'flight_submitted':
        return '📋';
      case 'booking_confirmed':
        return '🎯';
      case 'payment_received':
        return '💰';
      default:
        return '📢';
    }
  };

  // Don't render if no auth token
  if (!getAuthToken()) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-white/80 hover:text-violet-300 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-200 backdrop-blur-sm border border-violet-400/20 shadow-lg hover:shadow-xl"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-5 w-5 text-violet-300 animate-pulse" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-violet-200/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold">{t('notifications.title')}</h3>
          </div>

          {/* Notifications List - Scrollable */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500 mx-auto mb-2"></div>
                {t('notifications.loading')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">{t('notifications.noNotifications')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('notifications.noNotificationsDescription')}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const translatedNotification = translateNotification(notification);
                return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-violet-100/50 hover:bg-violet-50/50 last:border-b-0 transition-colors duration-200 ${
                    !notification.read_at ? 'bg-violet-50/80 border-l-4 border-l-violet-400' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0 p-1 bg-violet-100 rounded-full">{getNotificationIcon(translatedNotification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read_at ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {translatedNotification.title}
                        </p>
                        {!notification.read_at && (
                          <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {translatedNotification.message}
                      </p>
                      <p className="text-xs text-violet-500 mt-1 font-medium">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
