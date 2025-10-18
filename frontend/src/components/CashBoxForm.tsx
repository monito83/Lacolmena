import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';

interface CashBox {
  id: string;
  name: string;
  description?: string;
  color: string;
  currency: string;
  box_type: 'caja' | 'banco' | 'tarjeta' | 'otros';
  payment_method: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CashBoxFormProps {
  cashBox?: CashBox;
  mode: 'create' | 'edit';
  onSave: (cashBoxData: Omit<CashBox, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const CashBoxForm: React.FC<CashBoxFormProps> = ({ cashBox, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    currency: 'ARS',
    box_type: 'caja' as 'caja' | 'banco' | 'tarjeta' | 'otros',
    payment_method: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const predefinedColors = [
    '#6B7280', // Gris
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#8B5CF6', // Púrpura
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#14B8A6', // Turquesa
    '#F97316', // Naranja
    '#84CC16', // Lima
    '#06B6D4', // Cian
    '#64748B', // Gris oscuro
    '#EC4899', // Rosa
    '#8B5A2B', // Marrón
    '#1F2937', // Negro
    '#FBBF24'  // Amarillo dorado
  ];

  useEffect(() => {
    if (mode === 'edit' && cashBox) {
      setFormData({
        name: cashBox.name || '',
        description: cashBox.description || '',
        color: cashBox.color || '#6B7280',
        is_active: cashBox.is_active !== undefined ? cashBox.is_active : true
      });
    }
  }, [mode, cashBox]);

  const handleInputChange = (field: string, value: string | boolean) => {
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

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la caja es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.currency) {
      newErrors.currency = 'La moneda es requerida';
    }

    if (!formData.box_type) {
      newErrors.box_type = 'El tipo de caja es requerido';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'El método de pago es requerido';
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
        name: formData.name.trim(),
        description: formData.description && formData.description.trim() !== '' ? formData.description.trim() : undefined,
        color: formData.color,
        currency: formData.currency,
        box_type: formData.box_type,
        payment_method: formData.payment_method,
        is_active: formData.is_active
      };
      
      console.log('Datos a enviar:', cleanData);
      
      await onSave(cleanData);
    } catch (error) {
      console.error('Error al guardar caja:', error);
      setSubmitError('Error al guardar la caja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="waldorf-title text-2xl" style={{ color: 'oklch(0.30 0.05 270)' }}>
              {mode === 'create' ? 'Nueva Caja' : 'Editar Caja'}
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.name ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: errors.name ? '#ef4444' : 'oklch(0.90 0.05 270)'
                }}
                placeholder="Ej: Caja Compras, Caja Campo, Caja Música..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
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
                placeholder="Descripción de la caja..."
              />
            </div>

            {/* Currency and Box Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.currency ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.currency ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="ARS">ARS (Pesos Argentinos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Caja *
                </label>
                <select
                  value={formData.box_type}
                  onChange={(e) => handleInputChange('box_type', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.box_type ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.box_type ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="caja">Caja (Efectivo)</option>
                  <option value="banco">Banco</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otros">Otros</option>
                </select>
                {errors.box_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.box_type}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.payment_method ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: errors.payment_method ? '#ef4444' : 'oklch(0.90 0.05 270)'
                }}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              {errors.payment_method && (
                <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="space-y-3">
                {/* Color picker */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                    style={{ borderColor: 'oklch(0.90 0.05 270)' }}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="#6B7280"
                  />
                </div>

                {/* Predefined colors */}
                <div>
                  <p className="waldorf-body-text text-sm text-gray-600 mb-2">Colores predefinidos:</p>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange('color', color)}
                        className={`w-8 h-8 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        } hover:border-gray-500 transition-colors`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Color preview */}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="waldorf-body-text text-sm text-gray-600">Vista previa:</span>
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ 
                      backgroundColor: formData.color,
                      borderColor: 'oklch(0.90 0.05 270)'
                    }}
                  />
                  <span className="waldorf-body-text text-sm font-mono">{formData.color}</span>
                </div>
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="waldorf-body-text text-sm text-gray-700">
                Caja activa
              </label>
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

export default CashBoxForm;

