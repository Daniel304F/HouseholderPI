import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function HamburgerMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen((prevState) => {
            return !prevState
        })
    }
    return (
        <>
            <button
                onClick={toggleMenu}
                className="hover:text-primary-200 p-2 text-white sm:hidden"
                aria-label="Toggle navigation"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Hier später je nach User Kontext unterschiedliche Navigationsfelder -> eigene Gruppen, Statistiken etc. anzeigen */}
            <nav className="hidden items-center space-x-4 sm:flex">
                <NavLink
                    to="/signup"
                    className="text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg bg-white px-4 py-2 font-semibold transition"
                >
                    Registrieren
                </NavLink>
                <NavLink
                    to="/login"
                    className="text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg bg-white px-4 py-2 font-semibold transition"
                >
                    Anmelden
                </NavLink>
            </nav>

            {/* Geöffnet wenn Bildschirm Klein ist */}
            {isMenuOpen && (
                <div
                    className={`absolute top-16 ${isMenuOpen ? 'right-0' : '-right-64'} bg-accent-300 flex h-1/4 flex-col gap-4 rounded-md pt-2 transition-all duration-300 ease-out`}
                >
                    <NavLink
                        to="/signup"
                        onClick={toggleMenu}
                        className="text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg bg-white px-4 py-2 text-center font-semibold transition"
                    >
                        Registrieren
                    </NavLink>
                    <NavLink
                        to="/login"
                        onClick={toggleMenu}
                        className="text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg bg-white px-4 py-2 text-center font-semibold transition"
                    >
                        Anmelden
                    </NavLink>
                </div>
            )}
        </>
    )
}
