import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    type LoginRequest,
    authApi,
    type AuthResponse,
    type RegisterRequest,
} from '../api/auth'

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (response: AuthResponse) => {
            localStorage.setItem('accessToken', response.data.accessToken)
            queryClient.setQueryData(['user'], response.data.user)
            navigate('/')
        },
        onError: (error) => {
            console.error('Login failed', error)
        },
    })
}

export const useRegister = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (response: AuthResponse) => {
            localStorage.setItem('accessToken', response.data.accessToken)
            queryClient.setQueryData(['user'], response.data.user)
            navigate('/')
        },
    })
}
