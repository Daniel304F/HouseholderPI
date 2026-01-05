import { Outlet } from 'react-router-dom'
import { HeaderProvider } from '../contexts/HeaderContext'
import { useViewport } from '../hooks/useViewport'
import { HeaderNavigation } from '../components/navigation/HeaderNavigation'
import { Footer } from '../components/Footer'

export const AppLayout = () => {
    const { isMobile } = useViewport()

    return (
        <HeaderProvider>
            <div className="flex h-screen w-full flex-col">
                {!isMobile && <HeaderNavigation />}

                <main className="hide-scrollbar w-full flex-1 overflow-y-auto">
                    <div
                        className={`mx-auto max-w-5xl ${isMobile ? 'pb-20' : 'p-4'}`}
                    >
                        <Outlet />
                    </div>
                    {!isMobile && <Footer />}
                </main>
            </div>
        </HeaderProvider>
    )
}
