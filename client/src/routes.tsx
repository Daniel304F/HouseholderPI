import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Homepage } from './pages/Homepage'
import { Login } from './pages/Login'

export const routes: RouteObject[] = [
    {
        element: <AppLayout></AppLayout>,
        children: [
            {
                path: '/',
                element: <Homepage />,
            },
            {
                path: '/login',
                element: <Login />,
            },
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
