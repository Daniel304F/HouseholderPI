import { Outlet } from "react-router-dom";
import { HeaderProvider } from "../contexts/HeaderContext";
import { useViewport } from "../hooks/useViewport"
import { HeaderNavigation } from "../components/navigation/HeaderNavigation";

export const AppLayout = () => {
    const {isMobile} = useViewport();

    return (<HeaderProvider>
        <div className="w-full h-screen flex flex-col">
            {!isMobile && <HeaderNavigation />}

            <main className={`flex-1 max-w-5xl mx-auto overflow-y-auto ${isMobile ? 'pb-20' : 'p-4'}`}>
                <Outlet />
            </main>
        </div>
    </HeaderProvider>)
}