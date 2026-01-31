import { apiClient } from '../lib/axios'

export interface Comment {
    id: string
    taskId: string
    groupId: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    createdAt: string
    updatedAt: string
    editedAt: string | null
}

export interface CreateCommentInput {
    content: string
}

export interface UpdateCommentInput {
    content: string
}

export const commentsApi = {
    getComments: async (groupId: string, taskId: string): Promise<Comment[]> => {
        const response = await apiClient.get<{ success: boolean; data: Comment[] }>(
            `/groups/${groupId}/tasks/${taskId}/comments`
        )
        return response.data.data
    },

    createComment: async (
        groupId: string,
        taskId: string,
        data: CreateCommentInput
    ): Promise<Comment> => {
        const response = await apiClient.post<{ success: boolean; data: Comment }>(
            `/groups/${groupId}/tasks/${taskId}/comments`,
            data
        )
        return response.data.data
    },

    updateComment: async (
        groupId: string,
        taskId: string,
        commentId: string,
        data: UpdateCommentInput
    ): Promise<Comment> => {
        const response = await apiClient.patch<{ success: boolean; data: Comment }>(
            `/groups/${groupId}/tasks/${taskId}/comments/${commentId}`,
            data
        )
        return response.data.data
    },

    deleteComment: async (
        groupId: string,
        taskId: string,
        commentId: string
    ): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/tasks/${taskId}/comments/${commentId}`)
    },
}
