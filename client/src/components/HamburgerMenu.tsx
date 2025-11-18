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
                className="p-2 text-white hover:text-indigo-200 sm:hidden"
                aria-label="Toggle navigation"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Hier später je nach User Kontext unterschiedliche Navigationsfelder -> eigene Gruppen, Statistiken etc. anzeigen */}
            <nav className="hidden items-center space-x-4 sm:flex">
                <NavLink
                    to="/signup"
                    className="rounded-lg bg-white px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                    Registrieren
                </NavLink>
                <NavLink
                    to="/login"
                    className="rounded-lg bg-white px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                    Anmelden
                </NavLink>
            </nav>

            {/* Geöffnet wenn Bildschirm Klein ist */}
            {isMenuOpen && (
                <div
                    className={`absolute top-16 ${isMenuOpen ? 'right-0' : '-right-64'} flex h-1/4 flex-col gap-4 rounded-md bg-amber-300 pt-2 transition-all duration-300 ease-out`}
                >
                    <NavLink
                        to="/signup"
                        onClick={toggleMenu}
                        className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        Registrieren
                    </NavLink>
                    <NavLink
                        to="/login"
                        onClick={toggleMenu}
                        className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        Anmelden
                    </NavLink>
                </div>
            )}
        </>
    )
}
