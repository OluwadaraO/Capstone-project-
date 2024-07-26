self.addEventListener('push', function(event){
    const data = event.data.json();
    const options ={
        body: data.body,
        icon: './bell.png',
        silent: false,
        tag: 'notification-' + Date.now(),
        requireInteraction: true,
        priority: 'high'
    };
    self.registration.pushManager.getSubscription()
        .then(subscription => {
            if(subscription){
                console.log('Push notification status: ', subscription.options.userVisibleOnly);
            }
            return self.registration.showNotification(data.title, options);
        })
});

self.addEventListener('notificationclick', function(event) {
    event.notifcation.close();
    event.waitUntil(
        clients.openWindow('/')
    )
})
self.addEventListener('install', (event) => {
    console.log('Service worker installed')
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated')
})
