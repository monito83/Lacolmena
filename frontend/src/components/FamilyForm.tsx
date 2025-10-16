import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, User, FileText } from 'lucide-react';

interface Family {
  id: string;
  family_name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  is_active: boolean;
}

interface FamilyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (family: Omit<Family, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  family?: Family | null;
  mode: 'create' | 'edit';
}

const FamilyForm: React.FC<FamilyFormProps> = ({ isOpen, onClose, onSave, family, mode }) => {
  const [formData, setFormData] = useState({
    family_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-llenar formulario cuando se edita
  useEffect(() => {
    if (mode === 'edit' && family) {
      setFormData({
        family_name: family.family_name || '',
        contact_email: family.contact_email || '',
        contact_phone: family.contact_phone || '',
        address: family.address || '',
        emergency_contact_name: family.emergency_contact_name || '',
        emergency_contact_phone: family.emergency_contact_phone || '',
        notes: family.notes || '',
        is_active: family.is_active
      });
    } else {
      // Resetear formulario para crear
      setFormData({
        family_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
        is_active: true
      });
    }
    setErrors({});
  }, [isOpen, mode, family]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.family_name.trim()) {
      newErrors.family_name = 'El nombre de la familia es requerido';
    }

    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'El email no tiene un formato válido';
    }

    if (formData.contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'El teléfono no tiene un formato válido';
    }

    if (formData.emergency_contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'El teléfono de emergencia no tiene un formato válido';
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar familia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'oklch(0.99 0.01 270)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
          <h2 className="text-2xl waldorf-title" style={{ color: 'oklch(0.30 0.15 270)' }}>
            {mode === 'create' ? 'Nueva Familia' : 'Editar Familia'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="space-y-4">
            <h3 className="text-lg waldorf-title" style={{ color: 'oklch(0.40 0.10 270)' }}>
              Información Principal
            </h3>

            {/* Nombre de Familia */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Nombre de la Familia *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
                <input
                  type="text"
                  value={formData.family_name}
                  onChange={(e) => handleInputChange('family_name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.family_name ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.family_name ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Ej: Familia García"
                />
              </div>
              {errors.family_name && (
                <p className="mt-1 text-sm text-red-600">{errors.family_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Email de Contacto
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 280)' }} />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.contact_email ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.contact_email ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="ejemplo@email.com"
                />
              </div>
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.contact_phone ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.contact_phone ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h3 className="text-lg waldorf-title" style={{ color: 'oklch(0.40 0.10 270)' }}>
              Contacto de Emergencia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Contacto Emergencia */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              {/* Teléfono Contacto Emergencia */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      errors.emergency_contact_phone ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: errors.emergency_contact_phone ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="+54 11 8765-4321"
                  />
                </div>
                {errors.emergency_contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium waldorf-body-text mb-2">
              Notas Adicionales
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
                placeholder="Información adicional sobre la familia..."
              />
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded focus:ring-purple-400"
            />
            <label htmlFor="is_active" className="waldorf-body-text">
              Familia activa
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg waldorf-body-text hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'oklch(0.90 0.05 270)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white font-medium waldorf-title hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'oklch(0.60 0.15 270)' }}
            >
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear Familia' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyForm;
