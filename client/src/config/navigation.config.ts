import { ClipboardList, Users, UserCircle, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
    id: string
    label: string
    path: string
    icon: LucideIcon
}

/**
 * Hauptnavigation für Dashboard
 * Wird in AppLayout (BottomNavigation) und DashboardLayout (Sidebar) verwendet
 */
export const dashboardNavItems: NavItem[] = [
    {
        id: 'tasks',
        label: 'Aufgaben',
        path: '/dashboard/tasks',
        icon: ClipboardList,
    },
    {
        id: 'groups',
        label: 'Gruppen',
        path: '/dashboard/groups',
        icon: Users,
    },
    {
        id: 'friends',
        label: 'Freunde',
        path: '/dashboard/friends',
        icon: UserCircle,
    },
    {
        id: 'stats',
        label: 'Statistiken',
        path: '/dashboard/stats',
        icon: BarChart3,
    },
]
