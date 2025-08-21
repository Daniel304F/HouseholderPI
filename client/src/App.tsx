import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Sidebar from './layouts/Sidebar';
import { useState } from 'react';
import { HouseHolderButton } from './components/HouseHolderButton';


  function AppShell() {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const openSidebar = () => {
        setSidebarOpen(true);
    }

    const closeSidebar = () => {
        setSidebarOpen(false);
    }
return (
  <div className="min-h-screen flex flex-col text-gray-800">
    <Header/>
    <main className="pt-16 min-h-[calc(100vh-4rem)] relative">
      <div className="absolute left-0 top-4">
        {!sidebarOpen ? <HouseHolderButton className='ml-2' title="Deine Bereiche" onClick={openSidebar} /> : <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
      </div>
      <Outlet />
    </main>

    <Footer />
  </div>
);

}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />
}