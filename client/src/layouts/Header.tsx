import { NavLink } from 'react-router-dom'

export default function Header() {
    return (
        <header className="shrink-0 border-b border-blue-900 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-lg">
            <div className="flex h-16 flex-row items-center justify-between p-0.5">
                <div className="flex items-center space-x-3">
                    <img
                        src="./householderPI.svg"
                        alt="householderPI ICON"
                        className="h-16 w-16"
                    />
                    <h1 className="text-3xl font-bold text-white">
                        HouseHolder
                    </h1>
                </div>

                <nav className="m-3 flex items-center space-x-4">
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
            </div>
        </header>
    )
}
