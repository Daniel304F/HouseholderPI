import { Outlet } from 'react-router-dom'
import { HeaderProvider } from '../contexts/HeaderContext'
import { useViewport } from '../hooks/useViewport'
import { HeaderNavigation } from '../components/navigation/HeaderNavigation'

export const AppLayout = () => {
    const { isMobile } = useViewport()

    return (
        <HeaderProvider>
            <div className="flex h-screen w-full flex-col">
                {!isMobile && <HeaderNavigation />}

                <main
                    className={`mx-auto max-w-5xl flex-1 overflow-y-auto ${isMobile ? 'pb-20' : 'p-4'} hide-scrollbar`}
                >
                    <Outlet />
                </main>
            </div>
        </HeaderProvider>
    )
}
