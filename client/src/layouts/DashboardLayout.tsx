import { type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, Users, UserCircle, BarChart3 } from 'lucide-react'
import { useSidebar } from '../hooks/useSidebar'
import { useViewport } from '../hooks/useViewport'
import { cn } from '../utils/cn'
import {
    Sidebar,
    SidebarSection,
    SidebarNavItem,
} from '../components/navigation/Sidebar'

interface DashboardLayoutProps {
    children?: ReactNode
}

const mainNavItems = [
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

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isMobile } = useViewport()

    const { width, isCollapsed, isResizing, toggle, startResizing } =
        useSidebar({
            defaultWidth: 260,
            minWidth: 200,
            maxWidth: 400,
            storageKey: 'dashboard-sidebar',
        })

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-full flex-1 overflow-hidden">
            {/* Sidebar - Desktop only */}
            {!isMobile && (
                <Sidebar
                    width={width}
                    isCollapsed={isCollapsed}
                    isResizing={isResizing}
                    onToggle={toggle}
                    onResizeStart={startResizing}
                >
                    <SidebarSection title="Menü">
                        {mainNavItems.map((item) => (
                            <SidebarNavItem
                                key={item.id}
                                icon={<item.icon size={18} />}
                                label={item.label}
                                isActive={isActive(item.path)}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </SidebarSection>
                </Sidebar>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className={cn('h-full', isMobile ? 'p-4 pb-20' : 'p-6')}>
                    {children ?? <Outlet />}
                </div>
            </main>
        </div>
    )
}
