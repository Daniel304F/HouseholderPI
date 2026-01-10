import { useLocation, useNavigate } from 'react-router-dom'
import { useNavItems, LogoutNavItem } from './navItems'
import { HeaderNavigationItem } from './HeaderNavigationItem'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { NavItem } from '../NavItem'

export const HeaderNavigation = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const navItems = useNavItems()
    const { isAuthenticated, logout, user } = useAuth()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <header className="border-default bg-surface sticky top-0 z-50 border-b shadow-lg">
            <div className="mx-auto max-w-7xl px-4 pr-8">
                <div className="flex h-16 items-center justify-between">
                    <div
                        className="flex cursor-pointer items-center gap-2"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/householderPI.svg"
                            alt="HouseHolder Logo"
                            className="h-8 w-8"
                        />
                        <span className="text-primary text-xl font-semibold">
                            HouseHolder
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-1">
                            {navItems.map((item) => (
                                <HeaderNavigationItem
                                    key={item.id}
                                    {...item}
                                    onClick={handleNavigate}
                                    isActive={location.pathname === item.path}
                                />
                            ))}

                            {isAuthenticated && (
                                <NavItem onClick={handleLogout}>
                                    <LogoutNavItem.icon
                                        size={20}
                                        className="transition-all duration-200"
                                        strokeWidth={2}
                                    />
                                    <span className="text-sm font-medium">
                                        {LogoutNavItem.label}
                                    </span>
                                </NavItem>
                            )}
                        </nav>

                        {isAuthenticated && user && (
                            <div className="border-l border-neutral-200 pl-4 dark:border-neutral-700">
                                <div className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}
