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
        <header className="shadow-brand-500/5 sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 shadow-lg backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/60">
            <div className="mx-auto max-w-7xl px-4 pr-8">
                <div className="flex h-16 items-center justify-between gap-6">
                    <div
                        className="group flex cursor-pointer items-center gap-2"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/householderPI.svg"
                            alt="HouseHolder Logo"
                            className="h-8 w-8"
                        />
                        <span className="group-hover:text-brand-600 dark:group-hover:text-brand-300 text-xl font-semibold tracking-tight text-neutral-900 transition-colors duration-200 dark:text-neutral-100">
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
                            <div className="flex items-center gap-3 border-l border-neutral-200 pl-4 dark:border-neutral-800">
                                <div className="from-brand-400/80 via-brand-500/80 to-brand-600/80 shadow-brand-500/25 ring-brand-100/60 dark:from-brand-700 dark:via-brand-600 dark:to-brand-500 dark:ring-brand-900/40 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-white shadow-md ring-4">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
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
