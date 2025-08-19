import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './layouts/Header';


  function AppShell() {
  return (
    <div className="text-gray-800 min-h-dvh">
      <Header></Header>
      <main className="p-4 relative">
        <Outlet /> 
      </main>
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