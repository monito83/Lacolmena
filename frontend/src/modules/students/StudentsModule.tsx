import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Heart,
  GraduationCap,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';
import StudentForm from '../../components/StudentForm';

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
  families?: {
    id: string;
    family_name: string;
    contact_email?: string;
    contact_phone?: string;
  };
}

interface Family {
  id: string;
  family_name: string;
  contact_email?: string;
  contact_phone?: string;
}

const StudentsModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar estudiantes y familias
  useEffect(() => {
    loadStudents();
    loadFamilies();
  }, [searchTerm, selectedFamily, showActiveOnly]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedFamily) params.append('family_id', selectedFamily);
      if (showActiveOnly) params.append('is_active', 'true');

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data || []);
      } else {
        console.error('Error al cargar estudiantes');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilies = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/families`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilies(data || []);
      }
    } catch (error) {
      console.error('Error al cargar familias:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este estudiante?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/students?id=${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadStudents(); // Recargar la lista
      } else {
        console.error('Error al desactivar estudiante');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        loadStudents(); // Recargar la lista
      } else {
        throw new Error('Error al crear estudiante');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleEditStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedStudent) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/students?id=${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        loadStudents(); // Recargar la lista
        setSelectedStudent(null);
      } else {
        throw new Error('Error al actualizar estudiante');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setShowCreateModal(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'oklch(0.70 0.12 120)' : 'oklch(0.70 0.12 30)';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case 'masculino':
        return <UserCheck className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />;
      case 'femenino':
        return <UserCheck className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 330)' }} />;
      default:
        return <User className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />;
    }
  };

  const getAgeIcon = (age: number) => {
    if (age <= 5) return <Heart className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />;
    if (age <= 11) return <BookOpen className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 120)' }} />;
    return <GraduationCap className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4" style={{ color: 'oklch(0.70 0.12 120)' }} />
    ) : (
      <XCircle className="h-4 w-4" style={{ color: 'oklch(0.70 0.12 30)' }} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl waldorf-title mb-2">
              Gestión de Niños
            </h1>
            <p className="waldorf-body-text text-lg">
              Administra los niños de la comunidad educativa
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8" style={{ color: 'oklch(0.70 0.12 240)' }} />
            <span className="text-sm waldorf-body-text">Educación Waldorf</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card fade-in-up">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 waldorf-body-text focus:ring-purple-400"
                style={{
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.85 0.05 270)'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtro por familia */}
            <div className="min-w-0 flex-1">
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 waldorf-body-text focus:ring-purple-400"
                style={{
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.85 0.05 270)'
                }}
              >
                <option value="">Todas las familias</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.family_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro activos */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded"
                style={{ accentColor: 'oklch(0.70 0.12 330)' }}
              />
              <span className="waldorf-body-text">Solo activos</span>
            </label>

            {/* Botón crear */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl text-white font-medium transition-colors"
              style={{ backgroundColor: 'oklch(0.70 0.12 240)' }}
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Niño</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="card fade-in-up">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'oklch(0.70 0.12 240)' }}></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4" style={{ color: 'oklch(0.70 0.05 270)' }} />
            <h3 className="text-xl waldorf-title mb-2">No hay estudiantes</h3>
            <p className="waldorf-body-text">Comienza agregando un nuevo estudiante a la comunidad.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => {
              const age = calculateAge(student.birth_date);
              return (
                <div
                  key={student.id}
                  className="p-6 rounded-xl border transition-colors hover:shadow-md"
                  style={{
                    backgroundColor: 'oklch(0.99 0.01 270)',
                    borderColor: 'oklch(0.90 0.05 270)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl waldorf-title">
                          {student.first_name} {student.last_name}
                        </h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                          style={{
                            backgroundColor: student.is_active ? 'oklch(0.92 0.05 120)' : 'oklch(0.92 0.05 30)',
                            color: getStatusColor(student.is_active)
                          }}
                        >
                          {getStatusIcon(student.is_active)}
                          <span>{getStatusText(student.is_active)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Edad */}
                        <div className="flex items-center space-x-2">
                          {getAgeIcon(age)}
                          <div>
                            <p className="text-sm waldorf-body-text font-medium">{age} años</p>
                            <p className="text-xs waldorf-body-text opacity-75">Edad</p>
                          </div>
                        </div>

                        {/* Género */}
                        <div className="flex items-center space-x-2">
                          {getGenderIcon(student.gender)}
                          <div>
                            <p className="text-sm waldorf-body-text capitalize">
                              {student.gender || 'No especificado'}
                            </p>
                            <p className="text-xs waldorf-body-text opacity-75">Género</p>
                          </div>
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text">{formatDate(student.birth_date)}</p>
                            <p className="text-xs waldorf-body-text opacity-75">Nacimiento</p>
                          </div>
                        </div>

                        {/* Familia */}
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 330)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text">
                              {student.families?.family_name || 'Sin familia asignada'}
                            </p>
                            <p className="text-xs waldorf-body-text opacity-75">Familia</p>
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      {(student.special_needs || student.medical_notes) && (
                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.02 30)' }}>
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                            <span className="text-sm waldorf-body-text font-medium">Información importante</span>
                          </div>
                          <div className="space-y-1">
                            {student.special_needs && (
                              <p className="text-xs waldorf-body-text">
                                <strong>Necesidades especiales:</strong> {student.special_needs}
                              </p>
                            )}
                            {student.medical_notes && (
                              <p className="text-xs waldorf-body-text">
                                <strong>Notas médicas:</strong> {student.medical_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentModal(true);
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'oklch(0.96 0.02 240)' }}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'oklch(0.96 0.02 30)' }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                      </button>
                      {student.is_active && (
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: 'oklch(0.96 0.02 30)' }}
                          title="Desactivar"
                        >
                          <Trash2 className="h-4 w-4" style={{ color: 'oklch(0.60 0.15 30)' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalles de estudiante */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl waldorf-title">Detalles del Estudiante</h2>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="waldorf-body-text">
                <strong>Nombre completo:</strong> {selectedStudent.first_name} {selectedStudent.last_name}
              </p>
              <p className="waldorf-body-text">
                <strong>Edad:</strong> {calculateAge(selectedStudent.birth_date)} años
              </p>
              <p className="waldorf-body-text">
                <strong>Fecha de nacimiento:</strong> {formatDate(selectedStudent.birth_date)}
              </p>
              <p className="waldorf-body-text">
                <strong>Género:</strong> {selectedStudent.gender || 'No especificado'}
              </p>
              <p className="waldorf-body-text">
                <strong>Familia:</strong> {selectedStudent.families?.family_name || 'Sin familia asignada'}
              </p>
              <p className="waldorf-body-text">
                <strong>Fecha de inscripción:</strong> {formatDate(selectedStudent.enrollment_date)}
              </p>
              {selectedStudent.grade && (
                <p className="waldorf-body-text">
                  <strong>Grado:</strong> {selectedStudent.grade}
                </p>
              )}
              {selectedStudent.special_needs && (
                <p className="waldorf-body-text">
                  <strong>Necesidades especiales:</strong> {selectedStudent.special_needs}
                </p>
              )}
              {selectedStudent.medical_notes && (
                <p className="waldorf-body-text">
                  <strong>Notas médicas:</strong> {selectedStudent.medical_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar estudiante */}
      <StudentForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedStudent(null);
        }}
        onSave={selectedStudent ? handleEditStudent : handleCreateStudent}
        student={selectedStudent}
        mode={selectedStudent ? 'edit' : 'create'}
        families={families}
      />
    </div>
  );
};

export default StudentsModule;
