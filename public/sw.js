// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event.data);

  if (!event.data) {
    console.log('No push data available');
    return;
  }

  let notificationData = {};
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Reminder',
      body: event.data.text()
    };
  }

  const { title = 'Personal Assistant', body = 'You have a reminder', icon = '/favicon.ico', badge = '/favicon.ico', tag = 'reminder', data = {} } = notificationData;

  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' }
    ],
    requireInteraction: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle notification dismissal
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification dismissed:', event.notification.tag);
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reminders') {
    event.waitUntil(
      fetch('/api/reminders/pending')
        .then(response => response.json())
        .then(data => {
          data.reminders?.forEach(reminder => {
            self.registration.showNotification(reminder.title, {
              body: reminder.body,
              icon: '/favicon.ico',
              tag: reminder.id
            });
          });
        })
        .catch(err => console.error('Sync failed:', err))
    );
  }
});
