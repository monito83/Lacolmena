import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Tag,
  Eye
} from 'lucide-react';
import TransactionForm from '../../components/TransactionForm';

interface Transaction {
  id: string;
  concept: string;
  amount: number;
  currency: string;
  transaction_type: 'income' | 'expense';
  cash_box?: string;
  category?: string;
  description?: string;
  transaction_date: string;
  reference_number?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

const FinancialModule: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    transaction_type: '',
    cash_box: '',
    category: '',
    currency: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters.cash_box) params.append('cash_box', filters.cash_box);
      if (filters.category) params.append('category', filters.category);
      if (filters.currency) params.append('currency', filters.currency);

      const response = await fetch(`${apiUrl}/transactions?${params}`);
      if (!response.ok) throw new Error('Error al cargar transacciones');
      
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) throw new Error('Error al crear transacción');
      
      await fetchTransactions();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error al crear transacción:', error);
    }
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedTransaction) return;
    
    try {
      const response = await fetch(`${apiUrl}/transactions?id=${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) throw new Error('Error al actualizar transacción');
      
      await fetchTransactions();
      setShowTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/transactions?id=${transactionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar transacción');
      
      await fetchTransactions();
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    }
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedTransaction(null);
    setShowCreateModal(true);
  };

  const handleCloseModals = () => {
    setShowTransactionModal(false);
    setShowCreateModal(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'oklch(0.50 0.15 140)' : 'oklch(0.60 0.15 30)';
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalByCurrency = (currency: string) => {
    const income = transactions
      .filter(t => t.transaction_type === 'income' && t.currency === currency)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.transaction_type === 'expense' && t.currency === currency)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  };

  if (loading) {
  return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
              ))}
          </div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const arsTotals = getTotalByCurrency('ARS');
  const usdTotals = getTotalByCurrency('USD');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="waldorf-title text-3xl mb-2" style={{ color: 'oklch(0.30 0.05 270)' }}>
            Gestión Financiera
          </h1>
          <p className="waldorf-body-text text-gray-600">
            Administra ingresos, egresos y transacciones de La Colmena
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="waldorf-body-text text-sm text-gray-600">Ingresos ARS</p>
                <p className="waldorf-title text-2xl" style={{ color: 'oklch(0.50 0.15 140)' }}>
                  {formatCurrency(arsTotals.income, 'ARS')}
                </p>
      </div>
              <TrendingUp className="h-8 w-8" style={{ color: 'oklch(0.50 0.15 140)' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="waldorf-body-text text-sm text-gray-600">Egresos ARS</p>
                <p className="waldorf-title text-2xl" style={{ color: 'oklch(0.60 0.15 30)' }}>
                  {formatCurrency(arsTotals.expenses, 'ARS')}
                </p>
        </div>
              <TrendingDown className="h-8 w-8" style={{ color: 'oklch(0.60 0.15 30)' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="waldorf-body-text text-sm text-gray-600">Ingresos USD</p>
                <p className="waldorf-title text-2xl" style={{ color: 'oklch(0.50 0.15 140)' }}>
                  {formatCurrency(usdTotals.income, 'USD')}
                </p>
        </div>
              <DollarSign className="h-8 w-8" style={{ color: 'oklch(0.50 0.15 140)' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="waldorf-body-text text-sm text-gray-600">Balance ARS</p>
                <p className={`waldorf-title text-2xl ${arsTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(arsTotals.balance, 'ARS')}
                </p>
        </div>
              <Building2 className="h-8 w-8" style={{ color: 'oklch(0.40 0.10 270)' }} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.transaction_type}
                onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
                className="px-3 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                <option value="">Todos los tipos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Egresos</option>
              </select>

              <select
                value={filters.cash_box}
                onChange={(e) => setFilters(prev => ({ ...prev, cash_box: e.target.value }))}
                className="px-3 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                <option value="">Todas las cajas</option>
                <option value="general">General</option>
                <option value="compras">Compras</option>
                <option value="campo">Campo</option>
                <option value="musica">Música</option>
              </select>

              <select
                value={filters.currency}
                onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                className="px-3 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                <option value="">Todas las monedas</option>
                <option value="ARS">Pesos</option>
                <option value="USD">Dólares</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 waldorf-body-text"
            >
              <Plus className="h-4 w-4" />
              Nueva Transacción
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="waldorf-body-text text-gray-500">No hay transacciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Caja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider waldorf-body-text">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
                  {transactions.map((transaction) => {
                    const IconComponent = getTransactionIcon(transaction.transaction_type);
                    const iconColor = getTransactionColor(transaction.transaction_type);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="waldorf-title text-sm font-medium text-gray-900">
                              {transaction.concept}
                            </div>
                            {transaction.description && (
                              <div className="waldorf-body-text text-sm text-gray-500">
                                {transaction.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" style={{ color: iconColor }} />
                            <span className="waldorf-body-text text-sm capitalize">
                              {transaction.transaction_type === 'income' ? 'Ingreso' : 'Egreso'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="waldorf-title text-sm font-medium" style={{ color: iconColor }}>
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="waldorf-body-text text-sm">
                            {transaction.cash_box || 'General'}
                          </div>
                          {transaction.category && (
                            <div className="waldorf-body-text text-xs text-gray-500">
                              {transaction.category}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="waldorf-body-text text-sm">
                            {new Date(transaction.transaction_date).toLocaleDateString('es-ES')}
          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(transaction)}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
          </button>
        </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
      </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <TransactionForm
            mode="create"
            onSave={handleCreateTransaction}
            onClose={handleCloseModals}
          />
        )}

        {showTransactionModal && selectedTransaction && (
          <TransactionForm
            transaction={selectedTransaction}
            mode="edit"
            onSave={handleEditTransaction}
            onClose={handleCloseModals}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialModule;