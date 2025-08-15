import { NavLink } from "react-router-dom";

export default function Header() {
    return ( 
        <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 border-b border-blue-900 shadow-lg">
                <div className="flex flex-row justify-between items-center h-16 p-0.5">

                    <div className="flex items-center space-x-3">
                        <img 
                            src="./householderPI.svg" 
                            alt="householderPI ICON" 
                            className="h-16 w-16"
                        />
                        <h1 className="text-3xl font-bold text-white">
                            HouseHolderPI
                        </h1>
                    </div>


                    <nav className="flex items-center space-x-4 m-3">
                        <NavLink 
                            to="/signup"
                            className="px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                            Registrieren
                        </NavLink>
                        <NavLink 
                            to="/login" 
                            className="px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition"
                        
                        >
                            Anmelden
                        </NavLink>
                    </nav>
                </div>
        </header>     
    )
}