import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Server base URL without /api for static files like uploads
export const SERVER_BASE_URL = BASE_URL.replace(/\/api$/, '')

// Helper to get full URL for uploads
export const getUploadUrl = (path: string | undefined | null): string => {
    if (!path) return ''
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    // Otherwise prepend server base URL
    return `${SERVER_BASE_URL}${path}`
}

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

                const accessToken = response.data?.data?.accessToken as
                    | string
                    | undefined
                if (!accessToken) {
                    throw new Error('Refresh endpoint returned no access token')
                }

                localStorage.setItem('accessToken', accessToken)

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                }

                return apiClient(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export interface ApiError {
    message: string
    status: number
    errors?: Record<string, string[]>
}

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
    return axios.isAxiosError(error)
}

export const getErrorMessage = (error: unknown): string => {
    if (isApiError(error)) {
        return error.response?.data?.message || 'Ein Fehler ist aufgetreten.'
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'Ein unbekannter Fehler ist aufgetreten.'
}
