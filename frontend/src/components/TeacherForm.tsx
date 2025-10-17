import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, GraduationCap, Calendar } from 'lucide-react';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  photo_url?: string;
  birth_date?: string;
  assigned_grade?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeacherFormProps {
  teacher?: Teacher;
  mode: 'create' | 'edit';
  onSave: (teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    bio: '',
    photo_url: '',
    birth_date: '',
    assigned_grade: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && teacher) {
      setFormData({
        first_name: teacher.first_name || '',
        last_name: teacher.last_name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
        specialization: teacher.specialization || '',
        bio: teacher.bio || '',
        photo_url: teacher.photo_url || '',
        birth_date: teacher.birth_date || '',
        assigned_grade: teacher.assigned_grade || '',
        is_active: teacher.is_active
      });
    }
  }, [mode, teacher]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
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
      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        ...formData,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : undefined,
        address: formData.address && formData.address.trim() !== '' ? formData.address : undefined,
        specialization: formData.specialization && formData.specialization.trim() !== '' ? formData.specialization : undefined,
        bio: formData.bio && formData.bio.trim() !== '' ? formData.bio : undefined,
        photo_url: formData.photo_url && formData.photo_url.trim() !== '' ? formData.photo_url : undefined,
        birth_date: formData.birth_date && formData.birth_date.trim() !== '' ? formData.birth_date : undefined,
        assigned_grade: formData.assigned_grade && formData.assigned_grade.trim() !== '' ? formData.assigned_grade : undefined
      };
      
      await onSave(cleanData);
      onClose();
    } catch (error) {
      console.error('Error al guardar maestro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Nuevo Maestro' : 'Editar Maestro'}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Agregar un nuevo maestro al sistema' : 'Modificar información del maestro'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.first_name ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.first_name ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Nombre del maestro"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.last_name ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.last_name ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Apellido del maestro"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.email ? '#ef4444' : 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="maestro@lacolmena.edu"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialización
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Ej: Matemáticas, Lengua, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grado Asignado
                </label>
                <input
                  type="text"
                  value={formData.assigned_grade}
                  onChange={(e) => handleInputChange('assigned_grade', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Ej: 3° grado, Jardín, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
                placeholder="Información adicional sobre el maestro..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Foto
              </label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => handleInputChange('photo_url', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Estado</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Maestro activo
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Crear Maestro' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
