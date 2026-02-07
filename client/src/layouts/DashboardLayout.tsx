import type { ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../hooks/useSidebar'
import { useViewport } from '../hooks/useViewport'
import { cn } from '../utils/cn'
import {
    Sidebar,
    SidebarSection,
    SidebarNavItem,
} from '../components/navigation/Sidebar'
import { dashboardNavItems } from '../config/navigation.config'

interface DashboardLayoutProps {
    children?: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isMobile, isTablet } = useViewport()

    const { width, isCollapsed, isResizing, toggle, startResizing } =
        useSidebar({
            defaultWidth: isTablet ? 220 : 260,
            minWidth: 180,
            maxWidth: 400,
            storageKey: 'dashboard-sidebar',
        })

    const isActive = (path: string) => location.pathname === path

    // Mobile keeps space for bottom navigation.
    const contentPadding = isMobile
        ? 'p-4 pb-20'
        : isTablet
          ? 'p-4 lg:p-6'
          : 'p-6'

    return (
        <div className="flex h-full flex-1">
            {!isMobile && (
                <Sidebar
                    width={width}
                    isCollapsed={isCollapsed}
                    isResizing={isResizing}
                    onToggle={toggle}
                    onResizeStart={startResizing}
                >
                    <SidebarSection title="Menue">
                        {dashboardNavItems.map((item) => (
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

            <main className={cn('h-full flex-1 overflow-y-auto', contentPadding)}>
                {children ?? <Outlet />}
            </main>
        </div>
    )
}
