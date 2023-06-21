// <importScripts are injected here>

// <start boilerplate>
workbox.core.setCacheNameDetails({ prefix: "sharedo-sample-mobile-app" });

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
// <end boilerplate>

const dispatchUiAction = (action, args = {}) => {
    const channel = new BroadcastChannel("sw-bridge-dispatch-action");
    const message = { action, args };

    channel.postMessage(message);
}

self.addEventListener('push', function (e) {

    if (!e.data) return;
    var data = e.data.json();

    var options = {
        body: data.body,
        icon: "/img/icons/android-chrome-maskable-512x512.png",
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            sharedoId: data.sharedoId,
        },
        // actions: [...]
    };
    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );

    dispatchUiAction("incrementUnreadNotifications");
    dispatchUiAction("setStaleNotifications", true);
});

self.addEventListener('notificationclick', function (e) {
    var rootUrl = self.location.origin;

    const promiseChain = clients.openWindow(rootUrl);
    e.waitUntil(promiseChain);

    e.notification.close();
});
