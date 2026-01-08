import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useNavigate } from 'react-router-dom'
import { type LoginRequest, authApi, type AuthResponse } from '../api/auth'

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (response: AuthResponse) => {
            // Tokens speichern
            localStorage.setItem(
                'accessToken',
                response.data.tokens.accessToken
            )
            localStorage.setItem(
                'refreshToken',
                response.data.tokens.refreshToken
            )

            queryClient.setQueryData(['user'], response.data.user)

            navigate('/')
        },
        onError: (error) => {
            console.error('Login failed', error)
        },
    })
}
