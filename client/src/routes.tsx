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
import { GroupDetail } from './pages/dashboard/GroupDetail'
import { Friends } from './pages/dashboard/Friends'
import { MyTasks } from './pages/dashboard/MyTasks'
import { PersonalStats } from './pages/dashboard/PersonalStats'
import { GroupStats } from './pages/dashboard/GroupStats'

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
                        element: <MyTasks />,
                    },
                    {
                        path: 'groups',
                        element: <Groups />,
                    },
                    {
                        path: 'groups/:groupId',
                        element: <GroupDetail />,
                    },
                    {
                        path: 'groups/:groupId/stats',
                        element: <GroupStats />,
                    },
                    {
                        path: 'friends',
                        element: <Friends />,
                    },
                    {
                        path: 'stats',
                        element: <PersonalStats />,
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
