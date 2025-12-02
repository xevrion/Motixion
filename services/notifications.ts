import { supabase } from './supabase';
import { PushSubscription } from '../types';

// VAPID public key - loaded from environment variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Convert base64 URL-safe to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Remove any whitespace
  const cleanBase64 = base64String.trim();
  
  // Calculate padding
  const padding = '='.repeat((4 - cleanBase64.length % 4) % 4);
  
  // Convert URL-safe base64 to standard base64
  const base64 = (cleanBase64 + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  try {
    // Decode base64 string
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  } catch (error) {
    throw new Error(`Invalid VAPID key format: ${error}`);
  }
}

export const notificationService = {
  // Check if browser supports notifications
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      return registration;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to push notifications
  async subscribeToPush(userId: string): Promise<PushSubscriptionData | null> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.trim() === '') {
      const errorMsg = 'VAPID public key not configured. Please add VITE_VAPID_PUBLIC_KEY to your environment variables.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validate VAPID key format (should be base64 URL-safe, typically 87 chars)
    if (VAPID_PUBLIC_KEY.length < 80) {
      const errorMsg = `Invalid VAPID public key format. Key length: ${VAPID_PUBLIC_KEY.length}. Expected ~87 characters.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Check permission
    const permission = this.getPermission();
    if (permission !== 'granted') {
      const newPermission = await this.requestPermission();
      if (newPermission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    // Register service worker
    const registration = await this.registerServiceWorker();
    if (!registration) {
      throw new Error('Failed to register service worker');
    }

    // Wait for service worker to be ready/activated
    if (registration.waiting) {
      // A new service worker is waiting, activate it
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      await navigator.serviceWorker.ready;
    } else if (registration.installing) {
      // Service worker is installing, wait for it
      await new Promise((resolve) => {
        registration.installing!.addEventListener('statechange', function() {
          if (this.state === 'activated') {
            resolve(undefined);
          }
        });
      });
    } else {
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
    }

    let applicationServerKey: Uint8Array | null = null;
    
    try {
      // Convert VAPID key to Uint8Array
      try {
        applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      } catch (keyError: any) {
        throw new Error(`Failed to parse VAPID key: ${keyError.message}. Please check that VITE_VAPID_PUBLIC_KEY is correctly set.`);
      }
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Convert subscription to our format
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      // Save to database
      await this.saveSubscription(userId, subscriptionData);

      return subscriptionData;
    } catch (error: any) {
      // Provide helpful error messages
      if (error.name === 'AbortError' || error.message?.includes('push service error') || error.message?.includes('Registration failed')) {
        throw new Error('Push subscription failed. This may be a browser compatibility issue. Please try a different browser (Chrome, Firefox, or Edge).');
      }
      
      if (error.message?.includes('Invalid key') || error.message?.includes('Invalid format')) {
        throw new Error('Invalid VAPID key format. Please check your VITE_VAPID_PUBLIC_KEY environment variable.');
      }
      
      throw new Error(error.message || 'Failed to subscribe to push notifications. Please try again.');
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(userId: string): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Delete from database
      await this.deleteSubscription(userId, subscription?.endpoint);
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      throw error;
    }
  },

  // Get current subscription
  async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  },

  // Save subscription to database
  async saveSubscription(userId: string, subscription: PushSubscriptionData): Promise<void> {
    const userAgent = navigator.userAgent;

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  // Delete subscription from database
  async deleteSubscription(userId: string, endpoint?: string): Promise<void> {
    if (endpoint) {
      // Delete specific subscription by endpoint
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);

      if (error) throw error;
    } else {
      // Delete all subscriptions for user
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    }
  },

  // Get all subscriptions for a user
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(sub => ({
      id: sub.id,
      userId: sub.user_id,
      endpoint: sub.endpoint,
      p256dhKey: sub.p256dh_key,
      authKey: sub.auth_key,
      userAgent: sub.user_agent,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at || sub.created_at
    }));
  }
};

