import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Heart, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'oklch(0.98 0.02 270)' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16" style={{ color: 'oklch(0.70 0.12 330)' }} />
          </div>
          <h1 className="text-4xl waldorf-title mb-2">
            La Colmena
          </h1>
          <p className="text-lg waldorf-body-text mb-8">
            Sistema de Gestión Escolar - Pedagogía Waldorf
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="card fade-in-up">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl waldorf-title mb-2">
                Ingresar al Sistema
              </h2>
              <p className="waldorf-body-text">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium waldorf-body-text mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 waldorf-body-text focus:ring-purple-400"
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: 'oklch(0.85 0.05 270)'
                    }}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium waldorf-body-text mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 waldorf-body-text focus:ring-purple-400"
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: 'oklch(0.85 0.05 270)'
                    }}
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.05 30)' }}>
                  <p className="text-sm waldorf-body-text" style={{ color: 'oklch(0.60 0.15 30)' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors waldorf-body-text focus:ring-purple-400"
                style={{ 
                  backgroundColor: isLoading ? 'oklch(0.70 0.05 270)' : 'oklch(0.70 0.12 330)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ingresando...
                  </div>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Información adicional */}
            <div className="text-center">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 166.78)' }}>
                <p className="text-sm waldorf-body-text" style={{ color: 'oklch(0.60 0.10 166.78)' }}>
                  <strong>Credenciales de prueba:</strong><br />
                  Email: admin@lacolmena.edu<br />
                  Contraseña: admin123
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm waldorf-body-text" style={{ color: 'oklch(0.60 0.05 270)' }}>
            © 2024 La Colmena - Escuela Waldorf
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


