// Notification Service - Handles browser and push notifications
import { API_URL } from '../config/apiConfig';

class NotificationService {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.notificationPermission = 'default';
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Initialize notification service
   * Register service worker and request permissions
   */
  async initialize() {
    try {
      console.log('🔔 Initializing notification service...');

      // Check browser support
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Workers not supported');
        return false;
      }

      if (!('Notification' in window)) {
        console.warn('⚠️ Notifications not supported');
        return false;
      }

      // Register service worker
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('✅ Service Worker registered successfully');
      } catch (err) {
        console.error('❌ Service Worker registration failed:', err);
        // Continue anyway - browser notifications might still work
      }

      // Request notification permission IMMEDIATELY
      console.log('📢 Requesting notification permission from user...');
      const hasPermission = await this.requestPermission();
      
      if (hasPermission) {
        console.log('✅ Notification system fully initialized with user permission');
      } else {
        console.log('⚠️ Notifications disabled - user declined permission');
      }

      return true;
    } catch (error) {
      console.error('❌ Notification service initialization failed:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    try {
      if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted');
        this.notificationPermission = 'granted';
        return true;
      }

      if (Notification.permission === 'denied') {
        console.log('❌ Notification permission denied by user');
        this.notificationPermission = 'denied';
        return false;
      }

      // Permission is 'default' - ask the user
      console.log('📢 Requesting notification permission from user...');
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;

      console.log(`📋 User responded with permission: ${permission}`);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted by user - notifications ready!');
        // Show a test notification via Service Worker to verify it works
        if (this.serviceWorkerRegistration) {
          this.serviceWorkerRegistration.showNotification('Notifications Enabled! ✅', {
            body: 'You will now receive reminders and updates on this device.',
            tag: 'notification-enabled',
            requireInteraction: true,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
        return true;
      }

      console.log('ℹ️ User declined notification permission');
      return false;
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Show a browser notification (works without push subscription)
   */
  showNotification(title, options = {}) {
    if (this.notificationPermission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return null;
    }

    try {
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'default-notification',
        requireInteraction: true,
        ...options
      };

      if (this.serviceWorkerRegistration) {
        console.log('📢 Sending notification via Service Worker:', title);
        return this.serviceWorkerRegistration.showNotification(title, defaultOptions);
      } else {
        console.log('📢 Sending browser notification:', title);
        return new Notification(title, defaultOptions);
      }
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      return null;
    }
  }

  /**
   * Show a reminder notification for a todo, habit, or routine
   */
  async showReminderNotification(type, item) {
    const icons = {
      todo: '📋',
      habit: '🎯',
      routine: '📅'
    };

    const title = `${icons[type] || '⏰'} ${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`;
    const body = item.title || item.name || 'Time for action!';

    const options = {
      body,
      tag: `${type}-${item.id}`,
      requireInteraction: true,
      actions: [
        { action: 'complete', title: '✅ Done' },
        { action: 'postpone', title: '⏱️ Later' },
        { action: 'dismiss', title: '❌ Dismiss' }
      ],
      data: {
        type,
        id: item.id,
        timestamp: new Date().toISOString()
      }
    };

    this.showNotification(title, options);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(token) {
    try {
      console.log('🔄 Starting push notification subscription process...');
      
      if (!this.serviceWorkerRegistration) {
        console.log('⚠️ Service Worker not registered - push notifications unavailable');
        return false;
      }

      // Check current notification permission
      const permissionStatus = Notification.permission;
      console.log(`📋 Current notification permission: ${permissionStatus}`);

      if (permissionStatus !== 'granted') {
        console.log('⚠️ Notification permission not granted - cannot subscribe to push');
        // Try to request permission again
        const granted = await this.requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Get VAPID public key from backend (not environment)
      let vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      // If not in environment, fetch from backend
      if (!vapidPublicKey) {
        console.log('🔑 VAPID key not in environment, fetching from backend...');
        try {
          const response = await fetch(`${API_URL}/api/vapid-key`);
          if (response.ok) {
            const data = await response.json();
            vapidPublicKey = data.publicKey;
            console.log('✅ VAPID key fetched from backend');
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch VAPID key from backend:', err.message);
        }
      }
      
      console.log(`🔑 VAPID key present: ${!!vapidPublicKey}`);

      if (!vapidPublicKey) {
        console.log('ℹ️ VAPID key not configured - Push notifications disabled');
        return false;
      }

      // Validate VAPID key format
      if (typeof vapidPublicKey !== 'string' || vapidPublicKey.length < 10) {
        console.warn('⚠️ Invalid VAPID key format');
        return false;
      }

      // Get existing subscription
      let subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();

      if (subscription) {
        console.log('ℹ️ Using existing push subscription');
        console.log(`📋 Subscription endpoint: ${subscription.endpoint}`);
      } else {
        // Create new subscription with VAPID key
        console.log('🔐 Creating new push subscription with VAPID key...');
        const subscriptionOptions = {
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        };

        try {
          subscription = await this.serviceWorkerRegistration.pushManager.subscribe(subscriptionOptions);
          console.log('✅ Push subscription created successfully');
          console.log(`📋 Subscription endpoint: ${subscription.endpoint}`);
        } catch (subError) {
          console.error('❌ Failed to create push subscription:', subError);
          return false;
        }
      }

      // Save subscription to backend
      const saved = await this.savePushSubscription(subscription, token);

      if (saved) {
        console.log('✅ Push notification subscription complete - you will receive background notifications!');
        return true;
      } else {
        console.log('⚠️ Failed to save push subscription to backend');
        return false;
      }
    } catch (error) {
      console.error('❌ Push subscription error:', error.message);
      console.log('ℹ️ Browser notifications will still work for alerts on this tab');
      return false;
    }
  }

  /**
   * Save push subscription to backend
   */
  async savePushSubscription(subscription, token) {
    try {
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save push subscription');
      }

      console.log('✅ Push subscription saved to backend');
      return true;
    } catch (error) {
      console.error('❌ Failed to save push subscription:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications() {
    try {
      if (!this.serviceWorkerRegistration) {
        return false;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Unsubscribed from push notifications');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification (browser only)
   */
  scheduleLocalNotification(title, options = {}, delayMs = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.showNotification(title, options);
        resolve();
      }, delayMs);
    });
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return this.notificationPermission;
  }

  /**
   * Check if notifications are available
   */
  isAvailable() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
}

// Export singleton instance
export default new NotificationService();
