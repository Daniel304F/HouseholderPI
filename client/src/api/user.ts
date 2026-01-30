import { apiClient } from '../lib/axios'
import type { User } from './auth'

export interface UpdateProfileRequest {
    name?: string
    avatar?: string | null
}

export interface UpdateProfileResponse {
    success: boolean
    data: User
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
}
