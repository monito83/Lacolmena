import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';

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

interface TransactionFormProps {
  transaction?: Transaction;
  mode: 'create' | 'edit';
  onSave: (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    currency: 'ARS',
    transaction_type: 'income' as 'income' | 'expense',
    cash_box: 'general',
    category: '',
    description: '',
    transaction_date: '',
    reference_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [categories, setCategories] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [cashBoxes, setCashBoxes] = useState<Array<{id: string, name: string, color: string}>>([]);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (mode === 'edit' && transaction) {
      setFormData({
        concept: transaction.concept || '',
        amount: transaction.amount?.toString() || '',
        currency: transaction.currency || 'ARS',
        transaction_type: transaction.transaction_type || 'income',
        cash_box: transaction.cash_box || 'general',
        category: transaction.category || '',
        description: transaction.description || '',
        transaction_date: transaction.transaction_date || '',
        reference_number: transaction.reference_number || ''
      });
    }
  }, [mode, transaction]);

  useEffect(() => {
    // Cargar categorías
    fetch(`${apiUrl}/transaction-categories?is_active=true`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error cargando categorías:', err));

    // Cargar cajas
    fetch(`${apiUrl}/cash-boxes?is_active=true`)
      .then(res => res.json())
      .then(data => setCashBoxes(data))
      .catch(err => console.error('Error cargando cajas:', err));
  }, [apiUrl]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.concept.trim()) {
      newErrors.concept = 'El concepto es requerido';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'El monto es requerido';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser un número positivo';
    }

    if (!formData.transaction_date.trim()) {
      newErrors.transaction_date = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cleanData = {
        concept: formData.concept.trim(),
        amount: Number(formData.amount),
        currency: formData.currency,
        transaction_type: formData.transaction_type,
        cash_box: formData.cash_box === 'general' ? undefined : formData.cash_box,
        category: formData.category && formData.category.trim() !== '' ? formData.category.trim() : undefined,
        description: formData.description && formData.description.trim() !== '' ? formData.description.trim() : undefined,
        transaction_date: formData.transaction_date,
        reference_number: formData.reference_number && formData.reference_number.trim() !== '' ? formData.reference_number.trim() : undefined
      };
      
      console.log('Datos a enviar:', cleanData);
      
      await onSave(cleanData);
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      setSubmitError('Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="waldorf-title text-2xl" style={{ color: 'oklch(0.30 0.05 270)' }}>
              {mode === 'create' ? 'Nueva Transacción' : 'Editar Transacción'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded waldorf-body-text">
              {submitError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Concept and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={formData.concept}
                  onChange={(e) => handleInputChange('concept', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.concept ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.concept ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Ej: Pago de cuota, Compra materiales..."
                />
                {errors.concept && (
                  <p className="text-red-500 text-sm mt-1">{errors.concept}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      errors.amount ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: errors.amount ? '#ef4444' : 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Transaction Type and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transacción *
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Egreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares Americanos (USD)</option>
                </select>
              </div>
            </div>

            {/* Cash Box and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caja
                </label>
                <select
                  value={formData.cash_box}
                  onChange={(e) => handleInputChange('cash_box', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="">Seleccionar caja</option>
                  {cashBoxes.map(box => (
                    <option key={box.id} value={box.name}>
                      {box.name.charAt(0).toUpperCase() + box.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.transaction_date ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.transaction_date ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                />
                {errors.transaction_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.transaction_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Ej: FACT-001, TRANS-123..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
                placeholder="Descripción adicional de la transacción..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors waldorf-body-text"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 waldorf-body-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
