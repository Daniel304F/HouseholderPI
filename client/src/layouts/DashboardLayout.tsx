import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    ClipboardList,
    Users,
    UserCircle,
    BarChart3,
    Settings,
} from 'lucide-react'
import { useSidebar } from '../hooks/useSidebar'
import { useViewport } from '../hooks/useViewport'
import {
    Sidebar,
    SidebarSection,
    SidebarNavItem,
} from '../components/navigation/Sidebar'
import { TabNavigation } from '../components/navigation/TabNavigation'

interface DashboardLayoutProps {
    children: ReactNode
}

const mainNavItems = [
    {
        id: 'tasks',
        label: 'Meine Aufgaben',
        path: '/dashboard/tasks',
        icon: ClipboardList,
    },
    {
        id: 'groups',
        label: 'Meine Gruppen',
        path: '/dashboard/groups',
        icon: Users,
    },
    {
        id: 'friends',
        label: 'Meine Freunde',
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

const secondaryNavItems = [
    {
        id: 'settings',
        label: 'Einstellungen',
        path: '/dashboard/settings',
        icon: Settings,
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

    const tabItems = mainNavItems.map((item) => ({
        ...item,
        icon: <item.icon size={16} />,
    }))

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Mobile Tab Navigation */}
            {isMobile && <TabNavigation items={tabItems} />}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop only */}
                {!isMobile && (
                    <Sidebar
                        width={width}
                        isCollapsed={isCollapsed}
                        isResizing={isResizing}
                        onToggle={toggle}
                        onResizeStart={startResizing}
                    >
                        <div className="flex h-full flex-col gap-6">
                            {/* Main Navigation */}
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

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Secondary Navigation */}
                            <SidebarSection>
                                {secondaryNavItems.map((item) => (
                                    <SidebarNavItem
                                        key={item.id}
                                        icon={<item.icon size={18} />}
                                        label={item.label}
                                        isActive={isActive(item.path)}
                                        onClick={() => navigate(item.path)}
                                    />
                                ))}
                            </SidebarSection>
                        </div>
                    </Sidebar>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className={`h-full ${isMobile ? 'p-4 pb-20' : 'p-6'}`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
