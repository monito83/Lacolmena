import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './modules/dashboard/Dashboard';
import FamiliesModule from './modules/families/FamiliesModule';
import AcademicModule from './modules/academic/AcademicModule';
import FinancialModule from './modules/financial/FinancialModule';
import CategoriesModule from './modules/financial/CategoriesModule';
import CashBoxesModule from './modules/financial/CashBoxesModule';
import AdminModule from './modules/admin/AdminModule';
import StudentsModule from './modules/students/StudentsModule';
import TeachersModule from './modules/teachers/TeachersModule';
import './App.css';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// Componente interno que maneja las rutas
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'oklch(0.98 0.02 270)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="waldorf-body-text">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Si está autenticado, mostrar la aplicación
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.98 0.02 270)' }}>
      <Layout>
               <Routes>
                 <Route path="/" element={
                   <ProtectedRoute>
                     <Dashboard />
                   </ProtectedRoute>
                 } />
                 <Route path="/familias" element={
                   <ProtectedRoute>
                     <FamiliesModule />
                   </ProtectedRoute>
                 } />
                <Route path="/estudiantes" element={
                  <ProtectedRoute>
                    <StudentsModule />
                  </ProtectedRoute>
                } />
                <Route path="/maestros" element={
                  <ProtectedRoute>
                    <TeachersModule />
                  </ProtectedRoute>
                } />
                <Route path="/financiero" element={
                  <ProtectedRoute>
                    <FinancialModule />
                  </ProtectedRoute>
                } />
                <Route path="/categorias" element={
                  <ProtectedRoute>
                    <CategoriesModule />
                  </ProtectedRoute>
                } />
                <Route path="/cajas" element={
                  <ProtectedRoute>
                    <CashBoxesModule />
                  </ProtectedRoute>
                } />
                <Route path="/academico" element={
                  <ProtectedRoute>
                    <AcademicModule />
                  </ProtectedRoute>
                } />
                 <Route path="/financiero" element={
                   <ProtectedRoute>
                     <FinancialModule />
                   </ProtectedRoute>
                 } />
                 <Route path="/administrativo" element={
                   <ProtectedRoute requiredRoles={['admin']}>
                     <AdminModule />
                   </ProtectedRoute>
                 } />
               </Routes>
      </Layout>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;