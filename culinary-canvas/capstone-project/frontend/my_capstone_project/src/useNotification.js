import { useState, useEffect } from "react";

const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

export const useNotifications = (userId) => {
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const response = await fetch(`${backendAddress}/status/${userId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setIsSubscribed(data.isSubscribed)
            } catch (error) {
                console.error('Error checking subscription status: ', error)
            }
        };

        checkSubscription();
    }, []);

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./server-worker.js');
                return registration
            } catch (error) {
                console.error('Service worker registration failed: ', error)
                return null;
            }
        }
        else {
            console.log('Service workers are not supported in this browser');
            return null;
        }
    }

    const waitForServiceWorkerActivation = (registration) => {
        return new Promise((resolve, reject) => {
            if (registration.active) {
                resolve(registration)
            } else if (registration.installing) {
                const serviceWorker = registration.installing;
                serviceWorker.addEventListener('statechange', function () {
                    if (serviceWorker.state === 'activated') {
                        resolve(registration)
                    } else if (serviceWorker.state === 'redundant') {
                        reject(new Error('service worker became redundant'))
                    }
                });
            } else {
                reject(new Error('No service worker found in registration'))
            }
        })
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray;
    }

    const subscribeToNotifications = async () => {
        try {
            if ('serviceWorker' in navigator) {
                let registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    registration = await registerServiceWorker();
                }
                try {
                    await waitForServiceWorkerActivation(registration)
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                    });

                    const response = await fetch(`${backendAddress}/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            subscription: JSON.stringify(subscription)
                        }),
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        throw new Error('Failed to subscribe')
                    }
                    setIsSubscribed(true)
                } catch (error) {
                    console.error('Failed to subscribe to notifications: ', error)
                    throw error
                };
            }
        }
        catch (error) {
            console.log("Error in push notifications", error)
            return null;
        }
    };

    return { isSubscribed, subscribeToNotifications }
}
