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

export interface FriendProfile {
    id: string
    name: string
    email: string
    avatar?: string
    bio?: string
    achievements: string[]
    friendSince: string
}

export interface DirectMessageAttachment {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
}

export interface DirectMessage {
    id: string
    senderId: string
    recipientId: string
    senderName: string
    senderAvatar?: string
    content: string
    attachments: DirectMessageAttachment[]
    createdAt: string
    updatedAt: string
    readAt: string | null
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

interface ListApiResponse<T> {
    success: boolean
    data: T[]
    hasMore?: boolean
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

    /**
     * Get friend's public profile
     */
    getFriendProfile: async (friendId: string): Promise<FriendProfile> => {
        const response = await apiClient.get<ApiResponse<FriendProfile>>(
            `/friends/${friendId}/profile`
        )
        return response.data.data
    },

    /**
     * Get direct messages with friend
     */
    getDirectMessages: async (
        friendId: string,
        limit: number = 50,
        before?: string
    ): Promise<{ messages: DirectMessage[]; hasMore: boolean }> => {
        const params = new URLSearchParams({ limit: String(limit) })
        if (before) {
            params.append('before', before)
        }

        const response = await apiClient.get<ListApiResponse<DirectMessage>>(
            `/friends/${friendId}/messages?${params.toString()}`
        )

        return {
            messages: response.data.data,
            hasMore: Boolean(response.data.hasMore),
        }
    },

    /**
     * Send direct message with optional image
     */
    sendDirectMessage: async (
        friendId: string,
        content: string,
        image?: File
    ): Promise<DirectMessage> => {
        const formData = new FormData()
        if (content.trim().length > 0) {
            formData.append('content', content.trim())
        }
        if (image) {
            formData.append('image', image)
        }

        const response = await apiClient.post<ApiResponse<DirectMessage>>(
            `/friends/${friendId}/messages`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.data
    },
}
