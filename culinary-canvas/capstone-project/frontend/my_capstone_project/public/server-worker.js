self.addEventListener('push', function(event){
    const data = event.data.json();
    const options ={
        body: data.body,
        icon: './bell.png',
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
});

self.addEventListener('install', (event) => {
    console.log('Service worker installed')
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated')
})
