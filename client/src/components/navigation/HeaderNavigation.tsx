import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Settings, BarChart3, LogOut } from 'lucide-react'
import { useNavItems, LogoutNavItem } from './navItems'
import { HeaderNavigationItem } from './HeaderNavigationItem'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { NavItem } from '../NavItem'
import { cn } from '../../utils/cn'

export const HeaderNavigation = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const navItems = useNavItems()
    const { isAuthenticated, logout, user } = useAuth()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
        }

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showProfileMenu])

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
                            <div className="relative flex items-center gap-3 border-l border-neutral-200 pl-4 dark:border-neutral-800" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400/80 via-brand-500/80 to-brand-600/80 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100/60 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/30 dark:from-brand-700 dark:via-brand-600 dark:to-brand-500 dark:ring-brand-900/40"
                                    title={user.name}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className={cn(
                                        'absolute right-0 top-full mt-2 w-48',
                                        'rounded-xl border border-neutral-200 bg-white shadow-lg',
                                        'dark:border-neutral-700 dark:bg-neutral-800',
                                        'py-1 z-50'
                                    )}>
                                        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                                            <p className="font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/dashboard/settings')
                                                setShowProfileMenu(false)
                                            }}
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-2',
                                                'text-sm text-neutral-700 dark:text-neutral-300',
                                                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                                                'transition-colors'
                                            )}
                                        >
                                            <Settings className="size-4" />
                                            Einstellungen
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/dashboard/stats')
                                                setShowProfileMenu(false)
                                            }}
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-2',
                                                'text-sm text-neutral-700 dark:text-neutral-300',
                                                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                                                'transition-colors'
                                            )}
                                        >
                                            <BarChart3 className="size-4" />
                                            Statistiken
                                        </button>
                                        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-1">
                                            <button
                                                onClick={() => {
                                                    handleLogout()
                                                    setShowProfileMenu(false)
                                                }}
                                                className={cn(
                                                    'flex w-full items-center gap-3 px-4 py-2',
                                                    'text-sm text-red-600 dark:text-red-400',
                                                    'hover:bg-red-50 dark:hover:bg-red-900/20',
                                                    'transition-colors'
                                                )}
                                            >
                                                <LogOut className="size-4" />
                                                Ausloggen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}
