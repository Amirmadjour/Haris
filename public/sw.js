self.addEventListener('push', (event) => {
  const data = event.data?.json();
  const title = data?.title || 'New Splunk Alert';
  const options = {
    body: data?.body || 'New alert received',
    data: data?.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});