import { useState, useCallback, useEffect } from 'react'
import { notificationsApi } from '../api/notifications'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

const isPushSupported =
    'serviceWorker' in navigator && 'PushManager' in window

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        isPushSupported ? Notification.permission : 'denied'
    )
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Check existing subscription on mount
    useEffect(() => {
        if (!isPushSupported || permission !== 'granted') return

        navigator.serviceWorker.ready.then(async (registration) => {
            const subscription =
                await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        })
    }, [permission])

    const subscribeToPush = useCallback(async (): Promise<boolean> => {
        if (!isPushSupported || !VAPID_PUBLIC_KEY) return false

        setIsLoading(true)
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register(
                '/service-worker.js'
            )
            await navigator.serviceWorker.ready

            // Request permission
            const result = await Notification.requestPermission()
            setPermission(result)
            if (result !== 'granted') return false

            // Create push subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            })

            // Extract keys and send to backend
            const subscriptionJson = subscription.toJSON()
            await notificationsApi.subscribe({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscriptionJson.keys!.p256dh!,
                    auth: subscriptionJson.keys!.auth!,
                },
            })

            setIsSubscribed(true)
            return true
        } catch (error) {
            console.error('Push subscription failed:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isSupported: isPushSupported,
        permission,
        isSubscribed,
        isLoading,
        subscribeToPush,
    }
}

/**
 * Stille Re-Subscription für bereits autorisierte Geräte.
 * Wird nach Login/Auth-Init aufgerufen, ohne Permission-Dialog.
 */
export const silentResubscribe = async (): Promise<void> => {
    if (!isPushSupported || !VAPID_PUBLIC_KEY) return
    if (Notification.permission !== 'granted') return

    try {
        const registration = await navigator.serviceWorker.register(
            '/service-worker.js'
        )
        await navigator.serviceWorker.ready

        const existing = await registration.pushManager.getSubscription()
        const subscription =
            existing ??
            (await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            }))

        const subscriptionJson = subscription.toJSON()
        await notificationsApi.subscribe({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscriptionJson.keys!.p256dh!,
                auth: subscriptionJson.keys!.auth!,
            },
        })
    } catch (error) {
        console.error('Silent push resubscription failed:', error)
    }
}
