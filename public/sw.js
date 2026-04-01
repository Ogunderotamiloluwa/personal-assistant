// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received in Service Worker');
  console.log('Raw event.data:', event.data);
  console.log('Event data value:', event.data ? event.data.toString() : 'NULL');

  let notificationData = {
    title: '⏰ Personal Assistant Reminder',
    body: 'You have a reminder waiting. Tap to view details.'
  };
  
  // Try to parse the data
  if (event.data) {
    try {
      const parsedData = event.data.json();
      console.log('✅ Successfully parsed JSON data:', parsedData);
      if (parsedData.title) notificationData.title = parsedData.title;
      if (parsedData.body) notificationData.body = parsedData.body;
      if (parsedData.icon) notificationData.icon = parsedData.icon;
      if (parsedData.badge) notificationData.badge = parsedData.badge;
      if (parsedData.tag) notificationData.tag = parsedData.tag;
      if (parsedData.data) notificationData.data = parsedData.data;
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON:', parseError);
      try {
        const textData = event.data.text();
        console.log('Fallback text data:', textData);
        if (textData && textData.length > 0) {
          notificationData.body = textData;
        }
      } catch (textError) {
        console.warn('⚠️ Failed to get text data:', textError);
      }
    }
  } else {
    console.warn('⚠️ event.data is null or undefined!');
  }

  // Ensure we have title and body
  const title = notificationData.title || '⏰ Reminder';
  const body = notificationData.body || 'You have a reminder waiting';
  const icon = notificationData.icon || '/favicon.ico';
  const badge = notificationData.badge || '/favicon.ico';
  const tag = notificationData.tag || 'reminder-' + Date.now();
  const data = notificationData.data || {};

  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    vibrate: [500, 200, 500],
    actions: [
      { action: 'open', title: '📖 Open App' },
      { action: 'dismiss', title: '✖️ Dismiss' }
    ],
    requireInteraction: true,
    dir: 'auto',
    lang: 'en-US',
    timestamp: Date.now()
  };

  console.log(`🎯 WILL DISPLAY: Title="${title}"`);
  console.log(`📋 Body="${body}"`);
  console.log(`🔔 Full notification options:`, options);
  
  // Send message to all open clients about the notification
  self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {
    clientList.forEach(client => {
      console.log(`📨 Sending message to client`);
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        title: title,
        body: body,
        data: data
      });
    });
    console.log(`📨 Notified ${clientList.length} open client(s)`);
  });
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ NOTIFICATION DISPLAYED ON SCREEN');
        console.log(`   Title: "${title}"`);
        console.log(`   Body: "${body}"` );
        console.log(`   Tag: "${tag}"`);
        console.log('   ⏰ Notification should now be visible on your screen!');
      })
      .catch((error) => {
        console.error('❌ Failed to display notification:', error);
        console.error('   Retrying with minimal options...');
        // Retry with minimal options
        return self.registration.showNotification(title, {
          body: body,
          requireInteraction: true,
          icon: '/favicon.ico',
          tag: tag
        }).then(() => {
          console.log('✅ Fallback notification displayed');
        });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  console.log('📋 Notification tag:', event.notification.tag);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Try to focus existing window
        for (let client of clientList) {
          if ('focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notification: event.notification
            });
            return client.focus();
          }
        }
        // If no window found, open new one
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
  console.log('⏰ User closed the notification');
  console.log('📋 Was notification title:', event.notification.title);
  console.log('📋 Was notification body:', event.notification.body);
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
