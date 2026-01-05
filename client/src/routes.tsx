import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Homepage } from './pages/Homepage'

export const routes: RouteObject[] = [
    {
        element: <AppLayout></AppLayout>,
        children: [
            {
                path: '/',
                element: <Homepage />,
            },
            // {
            //     path: '/login',
            //     element: <LoginPage />
            // },
            // {
            //     path: '/register',
            //     element: <RegisterPage />
            // },
            // {
            //     path: '/dashboard',
            //     element: <ProtectedRoute><Dashboard /></ProtectedRoute>
            // },
        ],
    },
]
