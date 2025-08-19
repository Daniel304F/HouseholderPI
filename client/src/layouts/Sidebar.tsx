import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Settings, User, ChevronRight, X, Menu } from 'lucide-react';


interface SidebarProps {
  isOpen?: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const menuItems = [
    { 
      icon: Home, 
      label: 'Aufgaben', 
      to: '/aufgaben' 
    },
    { 
      icon: Users, 
      label: 'Gruppen', 
      to: '/gruppen' 
    },
    { 
      icon: BarChart3, 
      label: 'Statistiken', 
      to: '/statistiken' 
    },
    { 
      icon: User, 
      label: 'Profil', 
      to: '/profil' 
    },
    { 
      icon: Settings, 
      label: 'Einstellungen', 
      to: '/einstellungen' 
    },
  ];

  return (
    <>

      <div className={`absolute bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center w-full justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
          <Menu className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-800">Deine Bereiche</span>
      </div>
            {isOpen && 
            <button 
                onClick={onClose}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
                <X className="w-5 h-5 text-gray-800" />
            </button>}
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
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Max Mustermann</p>
              <p className="text-xs text-gray-500">max@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;