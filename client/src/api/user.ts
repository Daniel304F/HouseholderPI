import { apiClient } from '../lib/axios'
import type { User } from './auth'

export interface UpdateProfileRequest {
    name?: string
    avatar?: string | null
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface ChangeEmailRequest {
    newEmail: string
    password: string
}

export interface DeleteAccountRequest {
    password: string
    confirmation: 'DELETE'
}

export interface UpdateProfileResponse {
    success: boolean
    data: User
}

interface ApiResponse {
    success: boolean
    message?: string
}

export const userApi = {
    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const response = await apiClient.patch<UpdateProfileResponse>(
            '/user/profile',
            data
        )
        return response.data.data
    },

    removeAvatar: async (): Promise<User> => {
        const response = await apiClient.delete<UpdateProfileResponse>(
            '/user/avatar'
        )
        return response.data.data
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await apiClient.post<ApiResponse>('/user/change-password', data)
    },

    changeEmail: async (data: ChangeEmailRequest): Promise<User> => {
        const response = await apiClient.post<UpdateProfileResponse>(
            '/user/change-email',
            data
        )
        return response.data.data
    },

    deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
        await apiClient.delete<ApiResponse>('/user/account', { data })
    },
}
