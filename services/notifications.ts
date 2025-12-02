import { supabase } from './supabase';
import { PushSubscription } from '../types';

// VAPID public key - loaded from environment variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Debug logging (will be removed in production)
if (typeof window !== 'undefined') {
  console.log('[VAPID Debug] Key present:', !!VAPID_PUBLIC_KEY);
  console.log('[VAPID Debug] Key length:', VAPID_PUBLIC_KEY?.length || 0);
  console.log('[VAPID Debug] Key starts with:', VAPID_PUBLIC_KEY?.substring(0, 10) || 'N/A');
}

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
    
    // VAPID public key should be 65 bytes (uncompressed EC point: 0x04 + 32 bytes x + 32 bytes y)
    if (outputArray.length !== 65) {
      console.warn(`[VAPID] Unexpected key length: ${outputArray.length} bytes. Expected 65 bytes.`);
    }
    
    return outputArray;
  } catch (error) {
    console.error('[VAPID] Failed to decode base64:', error);
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
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
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

    try {
      // Convert VAPID key to Uint8Array
      let applicationServerKey: Uint8Array;
      try {
        console.log('[Push] Attempting to subscribe with VAPID key length:', VAPID_PUBLIC_KEY.length);
        applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        console.log('[Push] VAPID key converted successfully, length:', applicationServerKey.length);
      } catch (keyError: any) {
        console.error('[Push] VAPID key conversion failed:', keyError);
        throw new Error(`Failed to parse VAPID key: ${keyError.message}. Please check that VITE_VAPID_PUBLIC_KEY is correctly set.`);
      }

      // Subscribe to push
      console.log('[Push] Subscribing with applicationServerKey length:', applicationServerKey.length);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      console.log('[Push] Subscription successful! Endpoint:', subscription.endpoint.substring(0, 50) + '...');

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
      console.error('[Push] Error subscribing:', error);
      console.error('[Push] Error name:', error.name);
      console.error('[Push] Error message:', error.message);
      console.error('[Push] VAPID key was:', VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'MISSING');
      
      // Provide more helpful error messages
      if (error.name === 'AbortError' || error.message?.includes('push service error') || error.message?.includes('Registration failed')) {
        const detailedError = `Push subscription failed. 
        
Diagnostics:
- VAPID key present: ${!!VAPID_PUBLIC_KEY}
- VAPID key length: ${VAPID_PUBLIC_KEY?.length || 0}
- Error: ${error.message || error.name}

This usually means:
1. The VAPID key is not set in Vercel environment variables, OR
2. The app wasn't redeployed after adding the key, OR
3. The VAPID key format is invalid

Please verify:
- VITE_VAPID_PUBLIC_KEY is set in Vercel
- You've redeployed after adding it
- The key value matches: BFwp_a7Ff4uG3crsEAgdo2o6C3oZ2lP2PbaWnjRelFvvG8rVK_DXVj9Xn9BMre8-TpmFDXVKR6k8CUB9Pb-yNiI`;
        
        throw new Error(detailedError);
      }
      
      if (error.message?.includes('Invalid key') || error.message?.includes('Invalid format')) {
        throw new Error('Invalid VAPID key format. Please regenerate your VAPID keys and update your environment variables.');
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

