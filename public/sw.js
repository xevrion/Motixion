// Service Worker for Push Notifications
// This file handles push notifications and shows them to the user

self.addEventListener('push', function(event) {
  // Default notification data
  let notificationData = {
    title: 'Motixion Reminder',
    body: "Don't forget to log your daily activity!",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'daily-reminder',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  // Parse push payload if available
  if (event.data) {
    try {
      // Try to parse as JSON first (web-push sends JSON string)
      let payload;
      try {
        payload = event.data.json();
      } catch (e) {
        // If json() fails, try text()
        const text = event.data.text();
        if (text) {
          try {
            payload = JSON.parse(text);
          } catch (parseError) {
            // If it's not JSON, use as plain text
            notificationData.body = text;
            payload = null;
          }
        }
      }

      // Merge payload data if we got valid JSON
      if (payload && typeof payload === 'object') {
        notificationData = {
          ...notificationData,
          ...payload,
          data: {
            url: payload.url || payload.data?.url || '/',
            ...(payload.data || {})
          }
        };
      }
    } catch (e) {
      console.error('Error parsing push notification payload:', e);
      // Use default notification data on error
    }
  }

  // Show the notification
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon || '/favicon.svg',
      badge: notificationData.badge || '/favicon.svg',
      tag: notificationData.tag || 'daily-reminder',
      requireInteraction: notificationData.requireInteraction || false,
      data: notificationData.data || { url: '/' },
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'open' action - open the app
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  // Notification was closed
});

// Service worker installation
self.addEventListener('install', function(event) {
  self.skipWaiting(); // Activate immediately
});

// Service worker activation
self.addEventListener('activate', function(event) {
  event.waitUntil(
    clients.claim() // Take control of all pages immediately
  );
});

