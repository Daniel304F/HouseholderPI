import { Home, LogIn, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

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

const publicNavItems: NavItem[] = [
    { id: 'home', label: 'Home', path: '/', icon: Home, canFill: true },
]

const guestNavItems: NavItem[] = [
    {
        id: 'login',
        label: 'Login',
        path: '/login',
        icon: LogIn,
        canFill: false,
    },
]

const authNavItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        canFill: true,
    },
]

export const useNavItems = (): NavItem[] => {
    const { isAuthenticated } = useAuth()

    return [
        ...publicNavItems,
        ...(isAuthenticated ? authNavItems : guestNavItems),
    ]
}

export const LogoutNavItem = {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    canFill: false,
}

export type { NavItem }
