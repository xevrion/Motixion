// Service Worker for Push Notifications
// This file handles push notifications and shows them to the user

self.addEventListener('push', function(event) {
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
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
        data: {
          url: payload.url || '/',
          ...payload.data
        }
      };
    } catch (e) {
      const text = event.data.text();
      if (text) {
        notificationData.body = text;
      }
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
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

