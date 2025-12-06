import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    Home,
    Users,
    BarChart3,
    Settings,
    User,
    ChevronRight,
    X,
    Menu,
} from 'lucide-react'

interface SidebarProps {
    isOpen?: boolean
    onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const menuItems = [
        {
            icon: Home,
            label: 'Aufgaben',
            to: '/aufgaben',
        },
        {
            icon: Users,
            label: 'Gruppen',
            to: '/gruppen',
        },
        {
            icon: BarChart3,
            label: 'Statistiken',
            to: '/statistiken',
        },
        {
            icon: User,
            label: 'Profil',
            to: '/profil',
        },
        {
            icon: Settings,
            label: 'Einstellungen',
            to: '/einstellungen',
        },
    ]

    return (
        <>
            <div
                className={`absolute transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex w-full items-center justify-between border-b border-neutral-200 p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary-500 flex h-6 w-6 items-center justify-center rounded">
                            <Menu className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-neutral-800">
                            Deine Bereiche
                        </span>
                    </div>
                    {isOpen && (
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 transition-colors hover:bg-neutral-100"
                        >
                            <X className="h-5 w-5 text-neutral-800" />
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.to}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            onClose()
                                        }
                                    }}
                                    className={({ isActive }) =>
                                        `group flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                                            isActive
                                                ? 'border-primary-500 bg-primary-100 text-primary-700 border-l-4'
                                                : 'hover:bg-primary-50 hover:text-primary-600 text-neutral-700'
                                        }`
                                    }
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                    <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t border-neutral-200 p-4">
                    <div className="flex items-center space-x-3 rounded-lg bg-neutral-50 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                            <User className="h-4 w-4 text-neutral-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-700">
                                Max Mustermann
                            </p>
                            <p className="text-xs text-neutral-500">
                                max@example.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar
