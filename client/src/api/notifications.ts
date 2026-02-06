import { apiClient } from '../lib/axios'

export interface PushSubscriptionPayload {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export const notificationsApi = {
    subscribe: async (subscription: PushSubscriptionPayload): Promise<void> => {
        await apiClient.post('/notifications/subscribe', subscription)
    },
}
