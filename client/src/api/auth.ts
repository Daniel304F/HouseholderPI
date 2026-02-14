import { apiClient } from '../lib/axios'

export interface User {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    data: {
        user: User
        accessToken: string
    }
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data)
        return response.data
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            '/auth/register',
            data
        )
        return response.data
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout')
    },

    getMe: async (): Promise<User> => {
        const response = await apiClient.get<{ success: boolean; data: User }>(
            '/auth/me'
        )
        return response.data.data
    },

    refreshToken: async (): Promise<{ accessToken: string }> => {
        const response = await apiClient.post<{
            success: boolean
            data: { accessToken: string }
        }>('/auth/refresh')
        return response.data.data
    },
}
