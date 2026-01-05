import { useLocation, useNavigate } from 'react-router-dom'
import { navItems } from './navItems'
import { HeaderNavigationItem } from './HeaderNavigationItem'
import { ThemeToggle } from '../ThemeToggle'

export const HeaderNavigation = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    return (
        <header className="border-default bg-surface sticky top-0 border-b shadow-lg">
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
                        </nav>

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}
