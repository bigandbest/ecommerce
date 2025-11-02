"use client";
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

const NotificationPanel = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    const unreadOnly = filter === 'unread';
    const result = await notificationService.getUserNotifications(userId, 50, unreadOnly);
    if (result.success) {
      setNotifications(result.notifications || []);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await notificationService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '🛍️';
      case 'return': return '↩️';
      case 'refund': return '💰';
      case 'product': return '📦';
      default: return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">All Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🔔</div>
              <div>No notifications found</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.related_type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                        {notification.heading}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {notification.related_type?.replace('_', ' ')}
                      </span>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;