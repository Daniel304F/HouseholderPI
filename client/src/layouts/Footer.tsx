import { Home, Users, BarChart3, Settings, Mail, Phone, MapPin } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { NavLink } from "react-router-dom";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const navigationLinks = [
    { name: 'Aufgaben', href: '/aufgaben', icon: Home },
    { name: 'Gruppen', href: '/gruppen', icon: Users },
    { name: 'Statistiken', href: '/statistiken', icon: BarChart3 },
    { name: 'Einstellungen', href: '/einstellungen', icon: Settings },
  ];

  const legalLinks = [
    { name: 'Datenschutz',  },
    { name: 'Impressum', },
    { name: 'AGB', },
    { name: 'Hilfe', },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gradient-to-r from-blue-600 to-purple-700 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
                    <img 
                            src="./householderPI.svg" 
                            alt="householderPI ICON" 
                            className="h-16 w-16"
                    />
              <span className="text-xl font-bold">HouseHolderPI</span>
            </div>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Deine zentrale Plattform für Haushaltsmanagement. 
              Verwalte Aufgaben, organisiere Gruppen und behalte 
              den Überblick über deine Aktivitäten.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <Mail className="w-4 h-4" />
                <span>support@householderpl.de</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <Phone className="w-4 h-4" />
                <span>+49 (0) 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <MapPin className="w-4 h-4" />
                <span>Münster, Deutschland</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.href}
                    className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors duration-200 text-sm group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <p
                    className="text-blue-100 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    {link.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* GitHub & Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Entwicklung</h3>
            
            {/* GitHub Link */}
            <div className="mb-6">
              <a
                href="https://github.com/Daniel304F"
                className="w-10 h-10bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all duration-200 hover:scale-110 inline-flex"
                title="GitHub Repository"
                target="_blank"
                rel="noopener noreferrer"
              >
              <FaGithub className="w-12 h-12" />
              </a>
              <p className="text-blue-100 text-sm mt-2">
                Schaue dir den Code auf GitHub an
              </p>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="font-medium text-white mb-2 text-sm">Newsletter abonnieren</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Deine E-Mail"
                  className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">
                  Abonnieren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            
            <div className="text-blue-100 text-sm">
              © {currentYear} HouseHolderPl. Alle Rechte vorbehalten.
            </div>

            <div className="flex items-center space-x-6 text-sm text-blue-100">
              <span>Version 0.1.0</span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center space-x-1">
                <span>Entwickelt in</span>
                <span className="text-red-300">♥</span>
                <span>Deutschland</span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;