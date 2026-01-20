import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Homepage } from './pages/Homepage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { GuestRoute } from './pages/GuestRoute'

// Lazy load dashboard pages (optional, für bessere Performance)
// import { Tasks } from './pages/dashboard/Tasks'
// import { Groups } from './pages/dashboard/Groups'
// import { Friends } from './pages/dashboard/Friends'
// import { Stats } from './pages/dashboard/Stats'
// import { Settings } from './pages/dashboard/Settings'

// Placeholder-Komponenten (ersetze diese durch echte Pages)
const Tasks = () => <div>Meine Aufgaben</div>
const Groups = () => <div>Meine Gruppen</div>
const Friends = () => <div>Meine Freunde</div>
const Stats = () => <div>Statistiken</div>
const Settings = () => <div>Einstellungen</div>

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
