import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, User, Calendar, BookOpen, Heart, FileText } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender?: string;
  family_id: string;
  grade?: string;
  enrollment_date: string;
  medical_notes?: string;
  special_needs?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Family {
  id: string;
  family_name: string;
}

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  student?: Student | null;
  mode: 'create' | 'edit';
  families: Family[];
}

const StudentForm: React.FC<StudentFormProps> = ({ isOpen, onClose, onSave, student, mode, families }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    family_id: '',
    grade: '',
    enrollment_date: '',
    medical_notes: '',
    special_needs: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-llenar formulario cuando se edita
  useEffect(() => {
    if (mode === 'edit' && student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        birth_date: student.birth_date || '',
        gender: student.gender || '',
        family_id: student.family_id || '',
        grade: student.grade || '',
        enrollment_date: student.enrollment_date || '',
        medical_notes: student.medical_notes || '',
        special_needs: student.special_needs || '',
        is_active: student.is_active
      });
    } else {
      // Resetear formulario para crear
      setFormData({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        family_id: '',
        grade: '',
        enrollment_date: '',
        medical_notes: '',
        special_needs: '',
        is_active: true
      });
    }
    setErrors({});
  }, [isOpen, mode, student]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'La fecha de nacimiento no puede ser futura';
      }
    }

    if (!formData.family_id) {
      newErrors.family_id = 'Debe seleccionar una familia';
    }

    if (!formData.enrollment_date) {
      newErrors.enrollment_date = 'La fecha de inscripción es requerida';
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
      console.error('Error al guardar niño:', error);
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return ` (${age} años)`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'oklch(0.99 0.01 270)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
          <h2 className="text-2xl waldorf-title" style={{ color: 'oklch(0.30 0.15 270)' }}>
            {mode === 'create' ? 'Nuevo Niño' : 'Editar Niño'}
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
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg waldorf-title" style={{ color: 'oklch(0.40 0.10 270)' }}>
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      errors.first_name ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: errors.first_name ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="Ej: Ana"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Apellido *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      errors.last_name ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: errors.last_name ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="Ej: García"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Fecha de Nacimiento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      errors.birth_date ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: errors.birth_date ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                    }}
                  />
                </div>
                {formData.birth_date && (
                  <p className="mt-1 text-xs text-gray-600">{calculateAge(formData.birth_date)}</p>
                )}
                {errors.birth_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                )}
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Género
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Grado */}
              <div>
                <label className="block text-sm font-medium waldorf-body-text mb-2">
                  Grado
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 280)' }} />
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'oklch(0.99 0.01 270)',
                      borderColor: 'oklch(0.90 0.05 270)'
                    }}
                    placeholder="Ej: 3° grado"
                  />
                </div>
              </div>
            </div>

            {/* Familia */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Familia *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 330)' }} />
                <select
                  value={formData.family_id}
                  onChange={(e) => handleInputChange('family_id', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.family_id ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.family_id ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                  }}
                >
                  <option value="">Seleccionar familia</option>
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.family_name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.family_id && (
                <p className="mt-1 text-sm text-red-600">{errors.family_id}</p>
              )}
            </div>

            {/* Fecha de Inscripción */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Fecha de Inscripción *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 120)' }} />
                <input
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => handleInputChange('enrollment_date', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                    errors.enrollment_date ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: errors.enrollment_date ? 'oklch(0.60 0.15 30)' : 'oklch(0.90 0.05 270)'
                  }}
                />
              </div>
              {errors.enrollment_date && (
                <p className="mt-1 text-sm text-red-600">{errors.enrollment_date}</p>
              )}
            </div>
          </div>

          {/* Información Médica */}
          <div className="space-y-4">
            <h3 className="text-lg waldorf-title" style={{ color: 'oklch(0.40 0.10 270)' }}>
              Información Médica
            </h3>

            {/* Notas Médicas */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Notas Médicas
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 h-4 w-4" style={{ color: 'oklch(0.60 0.10 330)' }} />
                <textarea
                  value={formData.medical_notes}
                  onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Información médica relevante..."
                />
              </div>
            </div>

            {/* Necesidades Especiales */}
            <div>
              <label className="block text-sm font-medium waldorf-body-text mb-2">
                Necesidades Especiales
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                <textarea
                  value={formData.special_needs}
                  onChange={(e) => handleInputChange('special_needs', e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  style={{ 
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                  placeholder="Necesidades educativas especiales..."
                />
              </div>
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
              Niño activo
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
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear Niño' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
