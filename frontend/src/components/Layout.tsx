import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  DollarSign, 
  Settings, 
  Menu, 
  X,
  Heart,
  GraduationCap,
  Tag,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from './UserHeader';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  submenu?: NavigationItem[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user } = useAuth();

  // No mostrar el layout si no hay usuario autenticado
  if (!user) {
    return null;
  }

  const navigation: NavigationItem[] = [
    { name: 'Panel Principal', href: '/', icon: Home },
    { name: 'Familias', href: '/familias', icon: Users },
    { name: 'Niños', href: '/estudiantes', icon: Users },
    { name: 'Maestros', href: '/maestros', icon: GraduationCap },
    { 
      name: 'Financiero', 
      icon: DollarSign,
      submenu: [
        { name: 'Transacciones', href: '/financiero', icon: DollarSign },
        { name: 'Compromisos Fraternos', href: '/compromisos-fraternos', icon: Heart },
        { name: 'Categorías', href: '/categorias', icon: Tag },
        { name: 'Cajas', href: '/cajas', icon: Building2 }
      ]
    },
    { name: 'Académico', href: '/academico', icon: Users },
    { name: 'Administrativo', href: '/administrativo', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  const isSubmenuExpanded = (menuName: string) => {
    return expandedMenus.has(menuName);
  };

  const isParentActive = (submenu: NavigationItem[]) => {
    return submenu.some(item => item.href && isActive(item.href));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
                   <Heart className="h-8 w-8" style={{ color: 'oklch(0.70 0.12 330)' }} />
                     <span className="text-xl waldorf-title">La Colmena</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                        isParentActive(item.submenu)
                          ? 'text-pink-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      style={isParentActive(item.submenu) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      {isSubmenuExpanded(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isSubmenuExpanded(item.name) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href!}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isActive(subItem.href!)
                                ? 'text-pink-600'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            style={isActive(subItem.href!) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                          >
                            <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive(item.href!)
                        ? 'text-pink-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    style={isActive(item.href!) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-md">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
                   <Heart className="h-8 w-8" style={{ color: 'oklch(0.70 0.12 330)' }} />
                     <span className="text-xl waldorf-title">La Colmena</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                        isParentActive(item.submenu)
                          ? 'text-pink-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      style={isParentActive(item.submenu) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      {isSubmenuExpanded(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isSubmenuExpanded(item.name) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href!}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isActive(subItem.href!)
                                ? 'text-pink-600'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            style={isActive(subItem.href!) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                          >
                            <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href!}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive(item.href!)
                        ? 'text-pink-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    style={isActive(item.href!) ? { backgroundColor: 'oklch(0.92 0.05 330)' } : {}}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              }
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
                   <div className="text-xs waldorf-body-text text-center">
                     <p>Sistema de Gestión</p>
                     <p>Pedagogía Waldorf</p>
                   </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header móvil */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200 shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
                   <Heart className="h-6 w-6" style={{ color: 'oklch(0.70 0.12 330)' }} />
            <span className="text-lg waldorf-title">La Colmena</span>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Header principal */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <h1 className="text-2xl waldorf-title">Sistema de Gestión</h1>
          </div>
          <UserHeader />
        </div>

        {/* Contenido */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
