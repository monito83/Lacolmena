import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Users, GraduationCap } from 'lucide-react';
import { FraternalCommitment } from '../../types';

interface FraternalCommitmentFormProps {
  commitment?: FraternalCommitment | null;
  families: any[];
  students: any[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

const FraternalCommitmentForm: React.FC<FraternalCommitmentFormProps> = ({
  commitment,
  families,
  students,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    family_id: '',
    student_id: '',
    academic_year: '2024-2025',
    agreed_amount: '',
    suggested_amount: '',
    payment_frequency: 'mensual' as 'mensual' | 'trimestral' | 'anual',
    commitment_date: '',
    review_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const mode = commitment ? 'edit' : 'create';

  useEffect(() => {
    if (commitment) {
      setFormData({
        family_id: commitment.family_id,
        student_id: commitment.student_id,
        academic_year: commitment.academic_year,
        agreed_amount: commitment.agreed_amount.toString(),
        suggested_amount: commitment.suggested_amount?.toString() || '',
        payment_frequency: commitment.payment_frequency,
        commitment_date: commitment.commitment_date,
        review_date: commitment.review_date || '',
        notes: commitment.notes || ''
      });
    } else {
      // Valores por defecto para nuevo compromiso
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        commitment_date: today,
        academic_year: '2024-2025'
      }));
    }
  }, [commitment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.family_id.trim()) {
      newErrors.family_id = 'Debe seleccionar una familia';
    }

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Debe seleccionar un estudiante';
    }

    if (!formData.academic_year.trim()) {
      newErrors.academic_year = 'El año académico es requerido';
    }

    if (!formData.agreed_amount.trim()) {
      newErrors.agreed_amount = 'El monto acordado es requerido';
    } else if (isNaN(parseFloat(formData.agreed_amount)) || parseFloat(formData.agreed_amount) <= 0) {
      newErrors.agreed_amount = 'El monto debe ser un número válido mayor a 0';
    }

    if (formData.suggested_amount && (isNaN(parseFloat(formData.suggested_amount)) || parseFloat(formData.suggested_amount) <= 0)) {
      newErrors.suggested_amount = 'El monto sugerido debe ser un número válido mayor a 0';
    }

    if (!formData.commitment_date.trim()) {
      newErrors.commitment_date = 'La fecha de compromiso es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        ...formData,
        agreed_amount: parseFloat(formData.agreed_amount),
        suggested_amount: formData.suggested_amount && formData.suggested_amount.trim() !== '' 
          ? parseFloat(formData.suggested_amount) 
          : undefined,
        review_date: formData.review_date && formData.review_date.trim() !== '' 
          ? formData.review_date 
          : undefined,
        notes: formData.notes && formData.notes.trim() !== '' 
          ? formData.notes 
          : undefined
      };

      await onSave(cleanData);
      onClose();
    } catch (error) {
      console.error('Error al guardar compromiso fraterno:', error);
      setSubmitError('Error al guardar el compromiso fraterno');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar estudiantes por familia seleccionada
  const filteredStudents = formData.family_id 
    ? students.filter(student => student.family_id === formData.family_id)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl waldorf-title">
              {mode === 'create' ? 'Nuevo Compromiso Fraterno' : 'Editar Compromiso Fraterno'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Familia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Familia *
              </label>
              <select
                value={formData.family_id}
                onChange={(e) => handleInputChange('family_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.family_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar familia</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.family_name}
                  </option>
                ))}
              </select>
              {errors.family_id && (
                <p className="mt-1 text-sm text-red-600">{errors.family_id}</p>
              )}
            </div>

            {/* Estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="inline h-4 w-4 mr-1" />
                Estudiante *
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => handleInputChange('student_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.student_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.family_id}
              >
                <option value="">Seleccionar estudiante</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} {student.grade && `(${student.grade})`}
                  </option>
                ))}
              </select>
              {errors.student_id && (
                <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
              )}
            </div>

            {/* Año Académico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Año Académico *
              </label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.academic_year ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 2024-2025"
              />
              {errors.academic_year && (
                <p className="mt-1 text-sm text-red-600">{errors.academic_year}</p>
              )}
            </div>

            {/* Monto Acordado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Monto Acordado *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.agreed_amount}
                onChange={(e) => handleInputChange('agreed_amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.agreed_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.agreed_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.agreed_amount}</p>
              )}
            </div>

            {/* Monto Sugerido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Monto Sugerido
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.suggested_amount}
                onChange={(e) => handleInputChange('suggested_amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.suggested_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00 (opcional)"
              />
              {errors.suggested_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.suggested_amount}</p>
              )}
            </div>

            {/* Frecuencia de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Pago *
              </label>
              <select
                value={formData.payment_frequency}
                onChange={(e) => handleInputChange('payment_frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            {/* Fecha de Compromiso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha de Compromiso *
              </label>
              <input
                type="date"
                value={formData.commitment_date}
                onChange={(e) => handleInputChange('commitment_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.commitment_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.commitment_date && (
                <p className="mt-1 text-sm text-red-600">{errors.commitment_date}</p>
              )}
            </div>

            {/* Fecha de Revisión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha de Revisión
              </label>
              <input
                type="date"
                value={formData.review_date}
                onChange={(e) => handleInputChange('review_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Información adicional sobre el compromiso..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-pink-300 hover:bg-pink-400 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : mode === 'create' ? 'Crear Compromiso' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FraternalCommitmentForm;
