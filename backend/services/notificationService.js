import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.EMAIL || 'mailto:admin@disasteralert.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class NotificationService {
  /**
   * Save or update a push subscription for a user
   */
  async saveSubscription(userId, role, subscription) {
    return await PushSubscription.findOneAndUpdate(
      { userId },
      { userId, role, subscription },
      { upsert: true, new: true }
    );
  }

  /**
   * Send a push notification to specific users based on role
   */
  async sendPushByRole(role, payload) {
    try {
      const subscriptions = await PushSubscription.find({ role });
      const notifications = subscriptions.map(sub => 
        webpush.sendNotification(sub.subscription, JSON.stringify(payload))
          .catch(err => {
            console.error(`Error sending push to ${sub.userId}:`, err.message);
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Subscription has expired or is no longer valid
              return PushSubscription.deleteOne({ _id: sub._id });
            }
          })
      );
      return Promise.all(notifications);
    } catch (error) {
      console.error('Error in sendPushByRole:', error);
    }
  }

  /**
   * Send a push notification to a specific user
   */
  async sendPushToUser(userId, payload) {
    try {
      const sub = await PushSubscription.findOne({ userId });
      if (sub) {
        return await webpush.sendNotification(sub.subscription, JSON.stringify(payload))
          .catch(err => {
            console.error(`Error sending push to ${userId}:`, err.message);
            if (err.statusCode === 410 || err.statusCode === 404) {
              return PushSubscription.deleteOne({ _id: sub._id });
            }
          });
      }
    } catch (error) {
      console.error('Error in sendPushToUser:', error);
    }
  }

  /**
   * Broadcast real-time and push notification for a new disaster
   */
  async notifyNewDisaster(io, report) {
    const payload = {
      title: '🚨 NEW DISASTER ALERT',
      body: `A ${report.disasterType} has been reported: ${report.description.substring(0, 50)}...`,
      icon: '/alert-icon.png',
      data: {
        url: `/disasters/${report._id}`,
        type: 'disaster'
      }
    };

    // Socket emission (already handled in controller, but can be unified here)
    io.emit('disaster_alert', report);

    // Push notification to all users (broadcast)
    const subscriptions = await PushSubscription.find({});
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(() => {});
    });
  }

  /**
   * Notify volunteers about a new resource request
   */
  async notifyNewRequest(io, request) {
    const payload = {
      title: '🔔 New Resource Request',
      body: `${request.resourceType} needed. Urgency: ${request.urgency}`,
      icon: '/request-icon.png',
      data: {
        url: `/requests/${request._id}`,
        type: 'request'
      }
    };

    // Socket emission to volunteers and admins (for monitoring)
    io.to('role-volunteer').to('role-admin').emit('new_request', request);

    // Push notification to all volunteers
    await this.sendPushByRole('volunteer', payload);

  }
}

export default new NotificationService();
