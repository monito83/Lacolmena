import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Payment {
  id: string;
  family_id: string;
  student_id: string;
  commitment_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  month_paid?: string;
  notes?: string;
  families: {
    family_name: string;
    contact_email: string;
  };
  students: {
    first_name: string;
    last_name: string;
    grade: string;
  };
  fraternal_commitments: {
    academic_year: string;
    agreed_amount: number;
  };
}

interface MonthlyPaymentStatus {
  id: string;
  family_id: string;
  student_id: string;
  commitment_id: string;
  year: number;
  month: number;
  expected_amount: number;
  paid_amount: number;
  status: 'pendiente' | 'parcial' | 'completo' | 'excedido';
  due_date?: string;
  notes?: string;
  families: {
    family_name: string;
    contact_email: string;
  };
  students: {
    first_name: string;
    last_name: string;
    grade: string;
  };
  fraternal_commitments: {
    academic_year: string;
    agreed_amount: number;
  };
}

const PaymentTrackingModule: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<MonthlyPaymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'payments' | 'monthly'>('payments');

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');

      const [paymentsRes, monthlyRes] = await Promise.all([
        fetch(`${apiUrl}/financial/payments?year=${selectedYear}&month=${selectedMonth}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/financial/monthly-payment-status?year=${selectedYear}&month=${selectedMonth}${selectedStatus ? `&status=${selectedStatus}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.data || []);
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        setMonthlyStatus(monthlyData.data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const getStatistics = () => {
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpected = monthlyStatus.reduce((sum, status) => sum + status.expected_amount, 0);
    const totalPaid = monthlyStatus.reduce((sum, status) => sum + status.paid_amount, 0);
    
    const pendingCount = monthlyStatus.filter(s => s.status === 'pendiente').length;
    const partialCount = monthlyStatus.filter(s => s.status === 'parcial').length;
    const completeCount = monthlyStatus.filter(s => s.status === 'completo').length;

    return {
      totalPayments,
      totalExpected,
      totalPaid,
      pendingCount,
      partialCount,
      completeCount,
      collectionRate: totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0
    };
  };

  const stats = getStatistics();

  // Filtrar datos según búsqueda
  const filteredPayments = payments.filter(payment => 
    payment.families.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMonthlyStatus = monthlyStatus.filter(status => 
    status.families.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.students.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.students.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'parcial': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pendiente': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'excedido': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completo': return 'bg-green-100 text-green-800';
      case 'parcial': return 'bg-yellow-100 text-yellow-800';
      case 'pendiente': return 'bg-red-100 text-red-800';
      case 'excedido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Pagos</h1>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Registrar Pago</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalPaid.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Esperado</p>
              <p className="text-2xl font-bold text-blue-600">${stats.totalExpected.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Cobranza</p>
              <p className="text-2xl font-bold text-purple-600">{stats.collectionRate.toFixed(1)}%</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros y Tabs */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por familia o estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('es', { month: 'long' })}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="completo">Completo</option>
                <option value="excedido">Excedido</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagos Registrados
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'monthly'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Estado Mensual
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de Tabs */}
      {activeTab === 'payments' ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagos Registrados</h2>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron pagos para los filtros seleccionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Familia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.families.family_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.students.first_name} {payment.students.last_name}
                          <div className="text-xs text-gray-500">{payment.students.grade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString('es')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.reference_number || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado Mensual de Pagos</h2>
            {filteredMonthlyStatus.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron registros para los filtros seleccionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Familia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mes/Año
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Esperado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMonthlyStatus.map((status) => (
                      <tr key={status.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {status.families.family_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {status.students.first_name} {status.students.last_name}
                          <div className="text-xs text-gray-500">{status.students.grade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(status.year, status.month - 1).toLocaleDateString('es', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${status.expected_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${status.paid_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(status.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTrackingModule;
