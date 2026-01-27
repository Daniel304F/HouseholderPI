import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HeaderProvider } from '../contexts/HeaderContext'
import { useViewport } from '../hooks/useViewport'
import { cn } from '../utils/cn'
import { HeaderNavigation } from '../components/navigation/HeaderNavigation'
import { MobileHeader } from '../components/navigation/MobileHeader'
import { BottomNavigation } from '../components/navigation/BottomNavigation'
import { Footer } from '../components/Footer'
import { dashboardNavItems } from '../config/navigation.config'

export const AppLayout = () => {
    const { isMobile } = useViewport()
    const location = useLocation()
    const navigate = useNavigate()

    const isDashboard = location.pathname.startsWith('/dashboard')

    return (
        <HeaderProvider>
            <div className="flex h-screen w-full flex-col">
                {!isMobile && <HeaderNavigation />}
                {isMobile && isDashboard && (
                    <MobileHeader settingsPath="/dashboard/settings" />
                )}

                <main
                    className={cn(
                        'hide-scrollbar flex flex-1 flex-col overflow-y-auto',
                        isDashboard ? 'min-h-0' : ''
                    )}
                >
                    <div
                        className={cn(
                            'mx-auto w-full flex-grow',
                            isDashboard
                                ? 'w-full'
                                : cn('max-w-5xl', isMobile ? 'pb-20' : 'p-4')
                        )}
                    >
                        <Outlet />
                    </div>

                    {!isMobile && <Footer />}
                </main>

                {isMobile && (
                    <BottomNavigation
                        items={dashboardNavItems.map((item) => ({
                            ...item,
                            icon: <item.icon size={22} />,
                        }))}
                        activePath={location.pathname}
                        onNavigate={navigate}
                    />
                )}
            </div>
        </HeaderProvider>
    )
}
