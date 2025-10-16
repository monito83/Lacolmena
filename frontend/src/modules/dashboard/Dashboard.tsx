import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Heart,
  Calendar,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Datos de ejemplo - después los traeremos de la API
  const metrics = {
    totalChildren: 98,
    totalTeachers: 18,
    activeFamilies: 45,
    totalCommitments: 42,
    monthlyIncome: 1850000,
    monthlyExpenses: 1650000,
    totalExpectedIncome: 2200000,
    totalPaidIncome: 1850000,
    pendingIncome: 350000,
    pendingPayments: 5,
    upcomingReviews: 3
  };

  const recentActivities = [
    {
      id: 1,
      type: 'payment',
      description: 'Nuevo aporte recibido de la familia García',
      amount: 8500,
      date: '2024-01-15',
      status: 'success'
    },
    {
      id: 2,
      type: 'enrollment',
      description: 'Nueva matrícula: María Fernández',
      date: '2024-01-14',
      status: 'info'
    },
    {
      id: 3,
      type: 'review',
      description: 'Revisión de compromiso fraterno pendiente',
      family: 'Familia López',
      date: '2024-01-13',
      status: 'warning'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl waldorf-title mb-2">
              Panel Principal
            </h1>
            <p className="waldorf-body-text text-lg">
              Sistema de Gestión Integral - Pedagogía Waldorf
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Heart className="h-8 w-8" style={{ color: 'oklch(0.70 0.12 330)' }} />
            <span className="text-sm waldorf-body-text">Sistema Fraterno</span>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Estudiantes */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 166.78)' }}>
              <GraduationCap className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Total</span>
          </div>
          <h3 className="text-3xl waldorf-title mb-1">{metrics.totalChildren}</h3>
          <p className="waldorf-body-text">Niños y Niñas</p>
        </div>

        {/* Total Familias */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 330)' }}>
              <Users className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 330)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Activas</span>
          </div>
          <h3 className="text-3xl waldorf-title mb-1">{metrics.activeFamilies}</h3>
          <p className="waldorf-body-text">Familias</p>
        </div>

        {/* Total Maestros */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 240)' }}>
              <BookOpen className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 240)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Total</span>
          </div>
          <h3 className="text-3xl waldorf-title mb-1">{metrics.totalTeachers}</h3>
          <p className="waldorf-body-text">Maestros</p>
        </div>

        {/* Compromisos Fraternos */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 280)' }}>
              <Heart className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 280)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Activos</span>
          </div>
          <h3 className="text-3xl waldorf-title mb-1">{metrics.totalCommitments}</h3>
          <p className="waldorf-body-text">Compromisos Fraternos</p>
        </div>
      </div>

      {/* Métricas Financieras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingresos del Mes */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 120)' }}>
              <TrendingUp className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 120)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Este Mes</span>
          </div>
          <h3 className="text-2xl waldorf-title mb-1">{formatCurrency(metrics.monthlyIncome)}</h3>
          <p className="waldorf-body-text">Ingresos Recibidos</p>
        </div>

        {/* Gastos del Mes */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 30)' }}>
              <DollarSign className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 30)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Este Mes</span>
          </div>
          <h3 className="text-2xl waldorf-title mb-1">{formatCurrency(metrics.monthlyExpenses)}</h3>
          <p className="waldorf-body-text">Gastos Realizados</p>
        </div>

        {/* Saldo Pendiente */}
        <div className="metric-card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'oklch(0.92 0.05 350)' }}>
              <Clock className="h-6 w-6" style={{ color: 'oklch(0.60 0.10 350)' }} />
            </div>
            <span className="text-sm waldorf-body-text">Pendiente</span>
          </div>
          <h3 className="text-2xl waldorf-title mb-1">{formatCurrency(metrics.pendingIncome)}</h3>
          <p className="waldorf-body-text">Aportes por Recibir</p>
        </div>
      </div>

      {/* Alertas y recordatorios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl waldorf-title">
              Recordatorios
            </h3>
            <AlertCircle className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 30)' }} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 30)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'oklch(0.60 0.10 30)' }}></div>
                <span className="text-sm waldorf-body-text font-medium">
                  {metrics.pendingPayments} pagos pendientes
                </span>
              </div>
              <span className="text-xs waldorf-body-text opacity-75">Revisar</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 166.78)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'oklch(0.60 0.10 166.78)' }}></div>
                <span className="text-sm waldorf-body-text font-medium">
                  {metrics.upcomingReviews} revisiones de compromiso
                </span>
              </div>
              <span className="text-xs waldorf-body-text opacity-75">Próximas</span>
            </div>
          </div>
        </div>

        <div className="card fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl waldorf-title">
              Actividad Reciente
            </h3>
            <Calendar className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 rounded-xl transition-colors" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm waldorf-body-text font-medium">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-xs waldorf-body-text opacity-75 font-medium">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                  <p className="text-xs waldorf-body-text opacity-75">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estado del Sistema Fraterno */}
      <div className="card fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl waldorf-title">Estado del Sistema Fraterno</h2>
          <Heart className="h-6 w-6" style={{ color: 'oklch(0.70 0.12 330)' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 120)' }}>
            <h3 className="text-2xl waldorf-title mb-2">{formatCurrency(metrics.totalExpectedIncome)}</h3>
            <p className="waldorf-body-text">Total Esperado</p>
          </div>
          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 166.78)' }}>
            <h3 className="text-2xl waldorf-title mb-2">{formatCurrency(metrics.totalPaidIncome)}</h3>
            <p className="waldorf-body-text">Total Recibido</p>
          </div>
          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 350)' }}>
            <h3 className="text-2xl waldorf-title mb-2">{formatCurrency(metrics.pendingIncome)}</h3>
            <p className="waldorf-body-text">Pendiente</p>
          </div>
        </div>
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.02 330)' }}>
          <p className="waldorf-body-text text-lg">
            El equilibrio fraterno se mantiene gracias al compromiso solidario de todas las familias.
            Cada aporte, grande o pequeño, contribuye al bienestar de toda la comunidad educativa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
