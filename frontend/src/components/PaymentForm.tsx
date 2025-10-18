import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: any) => void;
  families: any[];
  students: any[];
  commitments: any[];
  cashBoxes: any[];
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  families,
  students,
  commitments,
  cashBoxes
}) => {
  const [formData, setFormData] = useState({
    family_id: '',
    student_id: '',
    commitment_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'efectivo',
    cash_box_id: '',
    reference_number: '',
    month_paid: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar estudiantes cuando se selecciona una familia
  const filteredStudents = students.filter(student => 
    student.family_id === formData.family_id
  );

  // Filtrar compromisos cuando se selecciona un estudiante
  const filteredCommitments = commitments.filter(commitment => 
    commitment.student_id === formData.student_id
  );

  // Filtrar cajas basadas en el método de pago
  const filteredCashBoxes = cashBoxes.filter(cashBox => 
    cashBox.payment_method === formData.payment_method && cashBox.is_active
  );

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        family_id: '',
        student_id: '',
        commitment_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'efectivo',
        cash_box_id: '',
        reference_number: '',
        month_paid: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.family_id) newErrors.family_id = 'Familia es requerida';
    if (!formData.student_id) newErrors.student_id = 'Estudiante es requerido';
    if (!formData.commitment_id) newErrors.commitment_id = 'Compromiso es requerido';
    if (!formData.amount) newErrors.amount = 'Monto es requerido';
    if (!formData.payment_date) newErrors.payment_date = 'Fecha de pago es requerida';
    if (!formData.payment_method) newErrors.payment_method = 'Método de pago es requerido';
    if (!formData.cash_box_id) newErrors.cash_box_id = 'Caja es requerida';

    // Validar que el monto sea un número positivo
    if (formData.amount && (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)) {
      newErrors.amount = 'El monto debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Familia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Familia *
            </label>
            <select
              name="family_id"
              value={formData.family_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.family_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar familia</option>
              {families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.family_name}
                </option>
              ))}
            </select>
            {errors.family_id && (
              <p className="text-red-500 text-xs mt-1">{errors.family_id}</p>
            )}
          </div>

          {/* Estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante *
            </label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              disabled={!formData.family_id}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.student_id ? 'border-red-500' : 'border-gray-300'
              } ${!formData.family_id ? 'bg-gray-100' : ''}`}
            >
              <option value="">Seleccionar estudiante</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.grade}
                </option>
              ))}
            </select>
            {errors.student_id && (
              <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>
            )}
          </div>

          {/* Compromiso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compromiso Fraterno *
            </label>
            <select
              name="commitment_id"
              value={formData.commitment_id}
              onChange={handleInputChange}
              disabled={!formData.student_id}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.commitment_id ? 'border-red-500' : 'border-gray-300'
              } ${!formData.student_id ? 'bg-gray-100' : ''}`}
            >
              <option value="">Seleccionar compromiso</option>
              {filteredCommitments.map(commitment => (
                <option key={commitment.id} value={commitment.id}>
                  {commitment.academic_year} - ${commitment.agreed_amount.toLocaleString()}
                </option>
              ))}
            </select>
            {errors.commitment_id && (
              <p className="text-red-500 text-xs mt-1">{errors.commitment_id}</p>
            )}
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.payment_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.payment_date && (
                <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>
              )}
            </div>
          </div>

          {/* Método de Pago y Mes Pagado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.payment_method ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              {errors.payment_method && (
                <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes Pagado
              </label>
              <input
                type="month"
                name="month_paid"
                value={formData.month_paid}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: YYYY-MM (ej: 2024-03)</p>
            </div>
          </div>

          {/* Caja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caja *
            </label>
            <select
              name="cash_box_id"
              value={formData.cash_box_id}
              onChange={handleInputChange}
              disabled={!formData.payment_method}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.cash_box_id ? 'border-red-500' : 'border-gray-300'
              } ${!formData.payment_method ? 'bg-gray-100' : ''}`}
            >
              <option value="">Seleccionar caja</option>
              {filteredCashBoxes.map(cashBox => (
                <option key={cashBox.id} value={cashBox.id}>
                  {cashBox.name} ({cashBox.currency})
                </option>
              ))}
            </select>
            {errors.cash_box_id && (
              <p className="text-red-500 text-xs mt-1">{errors.cash_box_id}</p>
            )}
            {formData.payment_method && filteredCashBoxes.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                No hay cajas configuradas para este método de pago. Configura cajas en el módulo de Cajas.
              </p>
            )}
          </div>

          {/* Número de Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Referencia
            </label>
            <input
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleInputChange}
              placeholder="Número de comprobante o transferencia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Observaciones adicionales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
