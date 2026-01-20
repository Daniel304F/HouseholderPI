import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, Users, UserCircle, BarChart3 } from 'lucide-react'
import { HeaderProvider } from '../contexts/HeaderContext'
import { useViewport } from '../hooks/useViewport'
import { HeaderNavigation } from '../components/navigation/HeaderNavigation'
import { MobileHeader } from '../components/navigation/MobileHeader'
import { BottomNavigation } from '../components/navigation/BottomNavigation'
import { Footer } from '../components/Footer'

const bottomNavItems = [
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
