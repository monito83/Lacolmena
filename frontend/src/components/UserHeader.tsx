import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

const UserHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'maestro':
        return 'Maestro';
      case 'familia':
        return 'Familia';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'oklch(0.70 0.12 330)';
      case 'maestro':
        return 'oklch(0.70 0.12 240)';
      case 'familia':
        return 'oklch(0.70 0.12 166.78)';
      default:
        return 'oklch(0.70 0.12 270)';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-3 rounded-xl transition-colors hover:bg-opacity-80"
        style={{ backgroundColor: 'oklch(0.96 0.02 330)' }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: getRoleColor(user.role) }}>
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium waldorf-body-text">
            {user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user.email}
          </p>
          <p className="text-xs waldorf-body-text" style={{ color: getRoleColor(user.role) }}>
            {getRoleDisplay(user.role)}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 waldorf-body-text" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: getRoleColor(user.role) }}>
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium waldorf-body-text">
                  {user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user.email}
                </p>
                <p className="text-sm waldorf-body-text" style={{ color: getRoleColor(user.role) }}>
                  {getRoleDisplay(user.role)}
                </p>
                <p className="text-xs waldorf-body-text" style={{ color: 'oklch(0.60 0.05 270)' }}>
                  {user.email}
                </p>
              </div>
            </div>

            {user.profile && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
                <p className="text-xs waldorf-body-text" style={{ color: 'oklch(0.60 0.05 270)' }}>
                  {user.profile.phone && `📞 ${user.profile.phone}`}
                  {user.profile.address && (
                    <span className="block">📍 {user.profile.address}</span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors waldorf-body-text"
                onClick={() => {
                  setShowDropdown(false);
                  // Aquí podrías abrir un modal de configuración
                }}
              >
                <Settings className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                <span>Configuración</span>
              </button>

              <button
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors waldorf-body-text"
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
              >
                <LogOut className="h-4 w-4" style={{ color: 'oklch(0.60 0.15 30)' }} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserHeader;


