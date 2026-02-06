import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ScreenLoader } from '../components/ui'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
    redirectTo?: string
}

export const ProtectedRoute = ({
    children,
    redirectTo = '/login',
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <ScreenLoader />
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    return <>{children}</>
}
