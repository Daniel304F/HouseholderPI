import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Header from './layouts/Header'
import Footer from './layouts/Footer'
// import Sidebar from './layouts/Sidebar'
// import { useState } from 'react'
// import { HouseHolderButton } from './components/HouseHolderButton'

function AppShell() {
    // const [sidebarOpen, setSidebarOpen] = useState(true)

    // const openSidebar = () => {
    //     setSidebarOpen(true)
    // }

    // const closeSidebar = () => {
    //     setSidebarOpen(false)
    // }
    return (
        <>
            <Header />
            <main className="flex-grow">
                {/* <div className="absolute top-4 left-0">
                    {!sidebarOpen ? (
                        <HouseHolderButton
                            className="ml-2"
                            title="Deine Bereiche"
                            onClick={openSidebar}
                        />
                    ) : (
                        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
                    )}
                </div> */}
                <Outlet />
            </main>

            <Footer />
        </>
    )
}

const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/login', element: <Login /> },
            { path: '/signup', element: <Signup /> },
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />
}
