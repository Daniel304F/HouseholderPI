import { NavLink } from "react-router-dom";

export default function Header() {
    return ( 
        <header className="bg-gray-900 border-b border-gray-800">
                <div className="flex flex-row justify-between items-center h-16 p-0.5">

                    <div className="flex items-center space-x-3">
                        <img 
                            src="./householderPI.svg" 
                            alt="householderPI ICON" 
                            className="h-16 w-16"
                        />
                        <h1 className="text-xl font-bold text-white">
                            HouseHolderPI
                        </h1>
                    </div>


                    <nav className="flex items-center space-x-4">
                        <NavLink 
                            to="/signup" 
                            className={({isActive}) => 
                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                        ? 'text-cyan-400 bg-gray-800' 
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`
                            }
                        >
                            Registrieren
                        </NavLink>
                        <NavLink 
                            to="/login" 
                            className={({isActive}) => 
                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-cyan-500 text-gray-900' 
                                        : 'bg-cyan-500 text-gray-900 hover:bg-cyan-400'
                                }`
                            }
                        >
                            Anmelden
                        </NavLink>
                    </nav>
                </div>
        </header>     
    )
}