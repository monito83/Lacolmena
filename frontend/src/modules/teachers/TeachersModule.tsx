import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Users
} from 'lucide-react';
import TeacherForm from '../../components/TeacherForm';

interface Teacher {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string; // Es nullable en la BD
  specializations?: string[]; // ARRAY en la BD
  birth_date?: string;
  hire_date: string;
  is_active: boolean;
  bio?: string;
  photo_url?: string;
  address?: string;
  assigned_grade?: string;
  created_at: string;
  updated_at: string;
}

const TeachersModule: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, [searchTerm, showActiveOnly]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (showActiveOnly) params.append('is_active', 'true');

      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/teachers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        const teachersData = responseData.data || responseData;

        if (Array.isArray(teachersData)) {
          setTeachers(teachersData);
        } else {
          console.error('La estructura de datos de maestros no es válida:', responseData);
          setTeachers([]);
        }
      } else {
        console.error('Error al cargar maestros');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este maestro?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/teachers?id=${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadTeachers(); // Recargar la lista
      } else {
        console.error('Error al desactivar maestro');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateTeacher = async (teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/teachers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
      });

      if (response.ok) {
        loadTeachers();
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Error al crear maestro (${response.status})`);
      }
    } catch (error) {
      console.error('Error al crear maestro:', error);
      throw error;
    }
  };

  const handleEditTeacher = async (teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedTeacher) return;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/teachers?id=${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
      });

      if (response.ok) {
        loadTeachers();
        setShowTeacherModal(false);
        setSelectedTeacher(null);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Error al actualizar maestro (${response.status})`);
      }
    } catch (error) {
      console.error('Error al actualizar maestro:', error);
      throw error;
    }
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedTeacher(null);
    setShowCreateModal(true);
  };

  const handleCloseModals = () => {
    setShowTeacherModal(false);
    setShowCreateModal(false);
    setSelectedTeacher(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'oklch(0.50 0.15 140)' : 'oklch(0.60 0.10 30)';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };


  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'oklch(0.60 0.15 270)' }}></div>
              <p className="waldorf-body-text">Cargando maestros...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl waldorf-title mb-2" style={{ color: 'oklch(0.30 0.15 270)' }}>
            Gestión de Maestros
          </h1>
          <p className="waldorf-body-text text-lg" style={{ color: 'oklch(0.50 0.10 270)' }}>
            Administra los maestros de la comunidad educativa
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
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

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded focus:ring-purple-400"
              />
              <span className="waldorf-body-text">Solo activos</span>
            </label>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg text-white font-medium waldorf-title flex items-center space-x-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'oklch(0.60 0.15 270)' }}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Maestro</span>
            </button>
          </div>
        </div>

        {/* Teachers List */}
        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4" style={{ color: 'oklch(0.70 0.05 270)' }} />
            <h3 className="text-xl waldorf-title mb-2">No hay maestros</h3>
            <p className="waldorf-body-text">Comienza agregando un nuevo maestro a la comunidad.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="p-6 rounded-xl border transition-colors hover:shadow-md"
                style={{
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl waldorf-title">{teacher.first_name} {teacher.last_name}</h3>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: teacher.is_active ? 'oklch(0.92 0.05 120)' : 'oklch(0.92 0.05 30)',
                          color: getStatusColor(teacher.is_active)
                        }}
                      >
                        {getStatusText(teacher.is_active)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <GraduationCap className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 270)' }} />
                      <span className="waldorf-body-text text-sm">
                        {Array.isArray(teacher.specializations)
                          ? teacher.specializations.join(', ')
                          : teacher.specializations || 'Sin especialización'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  {teacher.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 280)' }} />
                      <span className="waldorf-body-text text-sm">{teacher.email}</span>
                    </div>
                  )}

                  {teacher.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                      <span className="waldorf-body-text text-sm">{teacher.phone}</span>
                    </div>
                  )}

                  {teacher.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                      <span className="waldorf-body-text text-sm">{teacher.address}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                    <div>
                      <p className="waldorf-body-text text-xs opacity-75">Edad</p>
                      <p className="waldorf-title text-sm">{calculateAge(teacher.birth_date || '')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                    <div>
                      <p className="waldorf-body-text text-xs opacity-75">Grado</p>
                      <p className="waldorf-title text-sm">{teacher.assigned_grade || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {teacher.bio && (
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.02 270)' }}>
                    <p className="waldorf-body-text text-sm italic">"{teacher.bio}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(teacher)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 280)' }} />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Desactivar"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <TeacherForm
          mode="create"
          onSave={handleCreateTeacher}
          onClose={handleCloseModals}
        />
      )}

      {showTeacherModal && selectedTeacher && (
        <TeacherForm
          teacher={selectedTeacher}
          mode="edit"
          onSave={handleEditTeacher}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default TeachersModule;
