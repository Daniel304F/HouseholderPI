import { Home, LogIn } from 'lucide-react'

interface NavItem {
    id: string
    label: string
    path: string
    icon: React.ComponentType<{
        size?: number
        className?: string
        fill?: string
        strokeWidth?: number
    }>
    canFill: boolean
}

export const navItems: NavItem[] = [
    { id: 'home', label: 'Home', path: '/', icon: Home, canFill: true },
    {
        id: 'login',
        label: 'Login',
        path: '/login',
        icon: LogIn,
        canFill: false,
    },
]
