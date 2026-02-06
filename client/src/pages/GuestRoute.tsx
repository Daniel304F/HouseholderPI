import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ScreenLoader } from '../components/ui'
import type { ReactNode } from 'react'

interface GuestRouteProps {
    children: ReactNode
    redirectTo?: string
}

export const GuestRoute = ({
    children,
    redirectTo = '/dashboard',
}: GuestRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    const from =
        (location.state as { from?: Location })?.from?.pathname || redirectTo

    if (isLoading) {
        return <ScreenLoader />
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />
    }

    return <>{children}</>
}
