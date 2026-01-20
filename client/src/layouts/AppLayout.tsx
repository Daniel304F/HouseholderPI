import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Settings } from 'lucide-react'
import { HeaderProvider } from '../contexts/HeaderContext'
import { useViewport } from '../hooks/useViewport'
import { HeaderNavigation } from '../components/navigation/HeaderNavigation'
import { BottomNavigation } from '../components/navigation/BottomNavigation'
import { Footer } from '../components/Footer'

const bottomNavItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 'settings',
        label: 'Einstellungen',
        path: '/dashboard/settings',
        icon: Settings,
    },
]

export const AppLayout = () => {
    const { isMobile } = useViewport()
    const location = useLocation()
    const navigate = useNavigate()

    const isDashboard = location.pathname.startsWith('/dashboard')

    return (
        <HeaderProvider>
            <div className="flex h-screen w-full flex-col">
                {!isMobile && <HeaderNavigation />}

                <main
                    className={`hide-scrollbar flex flex-1 flex-col ${
                        isDashboard ? 'overflow-hidden' : 'overflow-y-auto'
                    }`}
                >
                    <div
                        className={`mx-auto w-full flex-grow ${
                            isDashboard
                                ? 'w-full'
                                : `max-w-5xl ${isMobile ? 'pb-20' : 'p-4'}`
                        }`}
                    >
                        <Outlet />
                    </div>

                    {!isMobile && <Footer />}
                </main>

                {isMobile && (
                    <BottomNavigation
                        items={bottomNavItems.map((item) => ({
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
