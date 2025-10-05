// Notifications API Service
import client from './client';

class NotificationsAPI {
  /**
   * Get all notifications for the current user
   */
  static async getNotifications() {
    try {
      const response = await client.get('/notifications');
      return response; // response is already the array of notifications
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId) {
    try {
      const response = await client.patch(`/notifications/${notificationId}/read`);
      return response; // response is already the data
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    try {
      const response = await client.patch('/notifications/mark-all-read');
      return response; // response is already the data
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId) {
    try {
      const response = await client.delete(`/notifications/${notificationId}`);
      return response; // response is already the data
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default NotificationsAPI;