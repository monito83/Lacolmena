import React, { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'oklch(0.98 0.02 270)' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'oklch(0.70 0.12 330)' }} />
          <p className="waldorf-body-text">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    // En lugar de redirigir, mostraremos el componente de login
    // ya que manejamos esto en el App.tsx
    return null;
  }

  // Verificar roles si se especifican
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'oklch(0.98 0.02 270)' }}>
        <div className="max-w-md w-full text-center">
          <div className="card fade-in-up">
            <div className="p-8">
              <h2 className="text-2xl waldorf-title mb-4">
                Acceso Denegado
              </h2>
              <p className="waldorf-body-text mb-6">
                No tienes permisos para acceder a esta sección.
              </p>
              <p className="text-sm waldorf-body-text" style={{ color: 'oklch(0.60 0.05 270)' }}>
                Tu rol actual: <strong>{user.role}</strong><br />
                Roles requeridos: <strong>{requiredRoles.join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;


