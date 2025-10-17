import React, { useState, useEffect } from 'react';
import { X, Save, Palette } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryFormProps {
  category?: Category;
  mode: 'create' | 'edit';
  onSave: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const predefinedColors = [
    '#10B981', // Verde
    '#3B82F6', // Azul
    '#F59E0B', // Amarillo
    '#8B5CF6', // Púrpura
    '#EF4444', // Rojo
    '#6B7280', // Gris
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
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#6B7280',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    }
  }, [mode, category]);

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
      newErrors.name = 'El nombre de la categoría es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
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
        is_active: formData.is_active
      };
      
      console.log('Datos a enviar:', cleanData);
      
      await onSave(cleanData);
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setSubmitError('Error al guardar la categoría');
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
              {mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
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
                placeholder="Ej: Materiales, Sueldos, Donaciones..."
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
                placeholder="Descripción de la categoría..."
              />
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
                  <Palette className="h-4 w-4 text-gray-400" />
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
                Categoría activa
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

export default CategoryForm;
