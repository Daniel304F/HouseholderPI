import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'
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
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-brand-500 h-10 w-10 animate-spin" />
                    <p className="text-text-muted text-sm">Wird geladen...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    return <>{children}</>
}
