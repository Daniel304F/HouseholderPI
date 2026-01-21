import { apiClient } from '../lib/axios'

// Types
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'

export interface Friend {
    id: string
    friendId: string
    friendName: string
    friendEmail: string
    friendAvatar?: string
    status: FriendshipStatus
    isRequester: boolean
    createdAt: string
    updatedAt: string
}

export interface FriendRequest {
    id: string
    from: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    createdAt: string
}

export interface SentRequest {
    id: string
    to: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    createdAt: string
}

export interface SendFriendRequestPayload {
    email: string
}

export interface RespondToRequestPayload {
    accept: boolean
}

// API Response types
interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

// API Functions
export const friendsApi = {
    /**
     * Get all friends
     */
    getFriends: async (): Promise<Friend[]> => {
        const response = await apiClient.get<ApiResponse<Friend[]>>('/friends')
        return response.data.data
    },

    /**
     * Get received friend requests
     */
    getRequests: async (): Promise<FriendRequest[]> => {
        const response =
            await apiClient.get<ApiResponse<FriendRequest[]>>(
                '/friends/requests'
            )
        return response.data.data
    },

    /**
     * Get sent friend requests
     */
    getSentRequests: async (): Promise<SentRequest[]> => {
        const response = await apiClient.get<ApiResponse<SentRequest[]>>(
            '/friends/requests/sent'
        )
        return response.data.data
    },

    /**
     * Send a friend request by email
     */
    sendRequest: async (payload: SendFriendRequestPayload): Promise<void> => {
        await apiClient.post('/friends/request', payload)
    },

    /**
     * Accept or reject a friend request
     */
    respondToRequest: async (
        requestId: string,
        payload: RespondToRequestPayload
    ): Promise<void> => {
        await apiClient.post(`/friends/requests/${requestId}/respond`, payload)
    },

    /**
     * Cancel a sent friend request
     */
    cancelRequest: async (requestId: string): Promise<void> => {
        await apiClient.delete(`/friends/requests/${requestId}`)
    },

    /**
     * Remove a friend
     */
    removeFriend: async (friendId: string): Promise<void> => {
        await apiClient.delete(`/friends/${friendId}`)
    },
}
