import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Homepage } from './pages/Homepage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { GuestRoute } from './pages/GuestRoute'
import { Groups } from './pages/dashboard/Groups'

// Placeholder-Komponenten (ersetze diese durch echte Pages)
const Tasks = () => <div className="p-4">Meine Aufgaben - Coming Soon</div>
const Friends = () => <div className="p-4">Meine Freunde - Coming Soon</div>
const Stats = () => <div className="p-4">Statistiken - Coming Soon</div>
const Settings = () => <div className="p-4">Einstellungen - Coming Soon</div>

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
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Navigate to="tasks" replace />,
                    },
                    {
                        path: 'tasks',
                        element: <Tasks />,
                    },
                    {
                        path: 'groups',
                        element: <Groups />,
                    },
                    {
                        path: 'friends',
                        element: <Friends />,
                    },
                    {
                        path: 'stats',
                        element: <Stats />,
                    },
                    {
                        path: 'settings',
                        element: <Settings />,
                    },
                ],
            },
        ],
    },
]
