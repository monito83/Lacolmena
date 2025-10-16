import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Heart,
  Phone,
  Mail,
  MapPin,
  User,
  DollarSign
} from 'lucide-react';

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
  created_at: string;
  updated_at: string;
}

const FamiliesModule: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar familias
  useEffect(() => {
    loadFamilies();
  }, [searchTerm, showActiveOnly]);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (showActiveOnly) params.append('is_active', 'true');
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/families?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilies(data || []);
      } else {
        console.error('Error al cargar familias');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta familia?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/families/${familyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadFamilies(); // Recargar la lista
      } else {
        console.error('Error al desactivar familia');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'oklch(0.70 0.12 120)' : 'oklch(0.70 0.12 30)';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activa' : 'Inactiva';
  };

  const getTotalStudents = (_family: Family) => {
    // Por ahora retornamos 0, se implementará cuando tengamos la relación con estudiantes
    return 0;
  };

  const getTotalCommitments = (_family: Family) => {
    // Por ahora retornamos 0, se implementará cuando tengamos la relación con compromisos fraternos
    return 0;
  };

  const getTotalMonthlyAmount = (_family: Family) => {
    // Por ahora retornamos 0, se implementará cuando tengamos la relación con compromisos fraternos
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl waldorf-title mb-2">
              Gestión de Familias
            </h1>
            <p className="waldorf-body-text text-lg">
              Administra las familias de la comunidad educativa
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8" style={{ color: 'oklch(0.70 0.12 330)' }} />
            <span className="text-sm waldorf-body-text">Sistema Fraterno</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'oklch(0.60 0.10 240)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre de familia, contacto o email..."
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
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded"
                style={{ accentColor: 'oklch(0.70 0.12 330)' }}
              />
              <span className="waldorf-body-text">Solo activas</span>
            </label>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl text-white font-medium transition-colors"
              style={{ backgroundColor: 'oklch(0.70 0.12 330)' }}
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Familia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de familias */}
      <div className="card fade-in-up">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'oklch(0.70 0.12 330)' }}></div>
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4" style={{ color: 'oklch(0.70 0.05 270)' }} />
            <h3 className="text-xl waldorf-title mb-2">No hay familias</h3>
            <p className="waldorf-body-text">Comienza agregando una nueva familia a la comunidad.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {families.map((family) => (
              <div
                key={family.id}
                className="p-6 rounded-xl border transition-colors hover:shadow-md"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl waldorf-title">{family.family_name}</h3>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: family.is_active ? 'oklch(0.92 0.05 120)' : 'oklch(0.92 0.05 30)',
                          color: getStatusColor(family.is_active)
                        }}
                      >
                        {getStatusText(family.is_active)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Email */}
                      {family.contact_email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 280)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text">{family.contact_email}</p>
                            <p className="text-xs waldorf-body-text opacity-75">Email</p>
                          </div>
                        </div>
                      )}

                      {/* Teléfono */}
                      {family.contact_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text">{family.contact_phone}</p>
                            <p className="text-xs waldorf-body-text opacity-75">Teléfono</p>
                          </div>
                        </div>
                      )}

                      {/* Contacto de Emergencia */}
                      {family.emergency_contact_name && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text font-medium">{family.emergency_contact_name}</p>
                            <p className="text-xs waldorf-body-text opacity-75">Contacto de Emergencia</p>
                          </div>
                        </div>
                      )}

                      {/* Dirección */}
                      {family.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                          <div>
                            <p className="text-sm waldorf-body-text">{family.address}</p>
                            <p className="text-xs waldorf-body-text opacity-75">Dirección</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.02 166.78)' }}>
                        <Users className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 166.78)' }} />
                        <div>
                          <p className="text-lg waldorf-title">{getTotalStudents(family)}</p>
                          <p className="text-xs waldorf-body-text">Estudiantes</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.02 330)' }}>
                        <Heart className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 330)' }} />
                        <div>
                          <p className="text-lg waldorf-title">{getTotalCommitments(family)}</p>
                          <p className="text-xs waldorf-body-text">Compromisos</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.02 120)' }}>
                        <DollarSign className="h-5 w-5" style={{ color: 'oklch(0.60 0.10 120)' }} />
                        <div>
                          <p className="text-lg waldorf-title">{formatCurrency(getTotalMonthlyAmount(family))}</p>
                          <p className="text-xs waldorf-body-text">Mensual</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedFamily(family);
                        setShowFamilyModal(true);
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'oklch(0.96 0.02 240)' }}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 240)' }} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFamily(family);
                        // Aquí podrías abrir un modal de edición
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'oklch(0.96 0.02 30)' }}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" style={{ color: 'oklch(0.60 0.10 30)' }} />
                    </button>
                    {family.is_active && (
                      <button
                        onClick={() => handleDeleteFamily(family.id)}
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
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de familia (placeholder) */}
      {showFamilyModal && selectedFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl waldorf-title">Detalles de la Familia</h2>
              <button
                onClick={() => setShowFamilyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="waldorf-body-text"><strong>Familia:</strong> {selectedFamily.family_name}</p>
              {selectedFamily.contact_email && (
                <p className="waldorf-body-text"><strong>Email:</strong> {selectedFamily.contact_email}</p>
              )}
              {selectedFamily.contact_phone && (
                <p className="waldorf-body-text"><strong>Teléfono:</strong> {selectedFamily.contact_phone}</p>
              )}
              {selectedFamily.emergency_contact_name && (
                <p className="waldorf-body-text"><strong>Contacto de Emergencia:</strong> {selectedFamily.emergency_contact_name}</p>
              )}
              {selectedFamily.emergency_contact_phone && (
                <p className="waldorf-body-text"><strong>Teléfono de Emergencia:</strong> {selectedFamily.emergency_contact_phone}</p>
              )}
              {selectedFamily.address && (
                <p className="waldorf-body-text"><strong>Dirección:</strong> {selectedFamily.address}</p>
              )}
              {selectedFamily.notes && (
                <p className="waldorf-body-text"><strong>Notas:</strong> {selectedFamily.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear familia (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl waldorf-title">Nueva Familia</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <p className="waldorf-body-text">Formulario de creación de familia (en desarrollo)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliesModule;
