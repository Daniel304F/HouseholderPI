import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Homepage } from './pages/Homepage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { GuestRoute } from './pages/GuestRoute'
import { Dashboard } from './pages/Dashboard'

export const routes: RouteObject[] = [
    {
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <Homepage />,
            },
            {
                path: '/login',
                element: (
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                ),
            },
            {
                path: '/register',
                element: (
                    <GuestRoute>
                        <Register />
                    </GuestRoute>
                ),
            },
            {
                path: '/dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]
