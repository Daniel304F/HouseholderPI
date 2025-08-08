import { NavLink, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';


  function AppShell() {
  return (
    <div className="min-h-dvh">
      <nav className="p-3 border-b flex gap-3">
        <NavLink to="/" className="hover:underline">Home</NavLink>
        <NavLink to="/login" className="hover:underline">Login</NavLink>
        <NavLink to="/signup" className="hover:underline">Signup</NavLink>
      </nav>
      <main className="p-4">
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