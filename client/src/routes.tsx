import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Homepage } from './pages/Homepage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

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
            {
                path: '/register',
                element: <Register />,
            },
            // {
            //     path: '/dashboard',
            //     element: <ProtectedRoute><Dashboard /></ProtectedRoute>
            // },
        ],
    },
]
