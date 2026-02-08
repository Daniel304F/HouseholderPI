import { lazy, Suspense, type ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { ScreenLoader } from './components/ui'
import { AppLayout } from './layouts/AppLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { GuestRoute } from './pages/GuestRoute'
import { ProtectedRoute } from './pages/ProtectedRoute'

const Homepage = lazy(() =>
    import('./pages/Homepage').then((module) => ({ default: module.Homepage }))
)
const Login = lazy(() =>
    import('./pages/Login').then((module) => ({ default: module.Login }))
)
const Register = lazy(() =>
    import('./pages/Register').then((module) => ({ default: module.Register }))
)
const Groups = lazy(() =>
    import('./pages/dashboard/Groups').then((module) => ({ default: module.Groups }))
)
const GroupDetail = lazy(() =>
    import('./pages/dashboard/GroupDetail').then((module) => ({
        default: module.GroupDetail,
    }))
)
const Friends = lazy(() =>
    import('./pages/dashboard/Friends').then((module) => ({ default: module.Friends }))
)
const MyTasks = lazy(() =>
    import('./pages/dashboard/MyTasks').then((module) => ({ default: module.MyTasks }))
)
const PersonalStats = lazy(() =>
    import('./pages/dashboard/PersonalStats').then((module) => ({
        default: module.PersonalStats,
    }))
)
const GroupStats = lazy(() =>
    import('./pages/dashboard/GroupStats').then((module) => ({ default: module.GroupStats }))
)
const Settings = lazy(() =>
    import('./pages/dashboard/Settings').then((module) => ({ default: module.Settings }))
)
const TaskHistory = lazy(() =>
    import('./pages/dashboard/TaskHistory').then((module) => ({
        default: module.TaskHistory,
    }))
)

const renderLazyRoute = (Component: ComponentType) => (
    <Suspense fallback={<ScreenLoader />}>
        <Component />
    </Suspense>
)

export const routes: RouteObject[] = [
    {
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: renderLazyRoute(Homepage),
            },
            {
                path: '/login',
                element: <GuestRoute>{renderLazyRoute(Login)}</GuestRoute>,
            },
            {
                path: '/register',
                element: <GuestRoute>{renderLazyRoute(Register)}</GuestRoute>,
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
                        element: renderLazyRoute(MyTasks),
                    },
                    {
                        path: 'groups',
                        element: renderLazyRoute(Groups),
                    },
                    {
                        path: 'groups/:groupId',
                        element: renderLazyRoute(GroupDetail),
                    },
                    {
                        path: 'groups/:groupId/stats',
                        element: renderLazyRoute(GroupStats),
                    },
                    {
                        path: 'friends',
                        element: renderLazyRoute(Friends),
                    },
                    {
                        path: 'stats',
                        element: renderLazyRoute(PersonalStats),
                    },
                    {
                        path: 'settings',
                        element: renderLazyRoute(Settings),
                    },
                    {
                        path: 'history',
                        element: renderLazyRoute(TaskHistory),
                    },
                ],
            },
        ],
    },
]
