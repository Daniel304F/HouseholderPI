import { apiClient } from '../lib/axios'

export interface MessageAttachment {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
}

export interface MessageReaction {
    emoji: string
    userIds: string[]
}

export interface Message {
    id: string
    groupId: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    attachments: MessageAttachment[]
    reactions: MessageReaction[]
    createdAt: string
    updatedAt: string
    editedAt: string | null
}

interface MessagesResponse {
    success: boolean
    data: Message[]
    hasMore: boolean
}

interface MessageResponse {
    success: boolean
    data: Message
}

export const messagesApi = {
    /**
     * Get messages for a group with pagination
     */
    getMessages: async (
        groupId: string,
        limit: number = 50,
        before?: string
    ): Promise<{ messages: Message[]; hasMore: boolean }> => {
        const params = new URLSearchParams({ limit: limit.toString() })
        if (before) {
            params.append('before', before)
        }
        const response = await apiClient.get<MessagesResponse>(
            `/groups/${groupId}/messages?${params.toString()}`
        )
        return { messages: response.data.data, hasMore: response.data.hasMore }
    },

    /**
     * Send a new message
     */
    sendMessage: async (groupId: string, content: string): Promise<Message> => {
        const response = await apiClient.post<MessageResponse>(
            `/groups/${groupId}/messages`,
            { content }
        )
        return response.data.data
    },

    /**
     * Send a message with optional image attachment
     */
    sendImageMessage: async (
        groupId: string,
        image: File,
        content?: string
    ): Promise<Message> => {
        const formData = new FormData()
        formData.append('image', image)
        if (content && content.trim().length > 0) {
            formData.append('content', content.trim())
        }

        const response = await apiClient.post<MessageResponse>(
            `/groups/${groupId}/messages/image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.data
    },

    /**
     * Update a message
     */
    updateMessage: async (
        groupId: string,
        messageId: string,
        content: string
    ): Promise<Message> => {
        const response = await apiClient.patch<MessageResponse>(
            `/groups/${groupId}/messages/${messageId}`,
            { content }
        )
        return response.data.data
    },

    /**
     * Delete a message
     */
    deleteMessage: async (groupId: string, messageId: string): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/messages/${messageId}`)
    },

    /**
     * Add a reaction to a message
     */
    addReaction: async (
        groupId: string,
        messageId: string,
        emoji: string
    ): Promise<Message> => {
        const response = await apiClient.post<MessageResponse>(
            `/groups/${groupId}/messages/${messageId}/reactions`,
            { emoji }
        )
        return response.data.data
    },

    /**
     * Remove user's reaction from a message
     */
    removeReaction: async (
        groupId: string,
        messageId: string,
        emoji: string
    ): Promise<Message> => {
        const response = await apiClient.delete<MessageResponse>(
            `/groups/${groupId}/messages/${messageId}/reactions`,
            { data: { emoji } }
        )
        return response.data.data
    },
}
