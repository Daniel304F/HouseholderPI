import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
    authApi,
    type User,
    type LoginRequest,
    type RegisterRequest,
} from '../api/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const capitalizeFirstLetter = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1)

const normalizeUser = (user: User): User => ({
    ...user,
    name: capitalizeFirstLetter(user.name),
})

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const queryClient = useQueryClient()

    const isAuthenticated = !!user

    // Token-Validierung beim App-Start
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem('accessToken')

            if (!accessToken) {
                setIsLoading(false)
                return
            }

            try {
                const userData = await authApi.getMe()
                setUser(normalizeUser(userData))
            } catch {
                // Token ungültig - aufräumen
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const login = useCallback(
        async (data: LoginRequest) => {
            const response = await authApi.login(data)
            // console.log('Login response:', response)
            console.log('data:', response.data)

            const { user, accessToken } = response.data

            localStorage.setItem('accessToken', accessToken)

            setUser(normalizeUser(user))
            queryClient.setQueryData(['user'], normalizeUser(user))
        },
        [queryClient]
    )

    const register = useCallback(
        async (data: RegisterRequest) => {
            const response = await authApi.register(data)

            const { user, accessToken } = response.data

            localStorage.setItem('accessToken', accessToken)

            setUser(normalizeUser(user))
            queryClient.setQueryData(['user'], normalizeUser(user))
        },
        [queryClient]
    )

    const logout = useCallback(async () => {
        try {
            await authApi.logout()
        } catch {
        } finally {
            localStorage.removeItem('accessToken')
            setUser(null)
            queryClient.clear()
        }
    }, [queryClient])

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth muss innerhalb eines AuthProviders verwendet werden'
        )
    }

    return context
}
