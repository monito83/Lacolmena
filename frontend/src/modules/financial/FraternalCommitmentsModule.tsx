import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Eye,
  Search,
  Calendar,
  DollarSign,
  Heart
} from 'lucide-react';
import type { FraternalCommitment } from '../../types';
import FraternalCommitmentForm from '../../components/FraternalCommitmentForm';

const FraternalCommitmentsModule: React.FC = () => {
  const [commitments, setCommitments] = useState<FraternalCommitment[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommitment, setSelectedCommitment] = useState<FraternalCommitment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar compromisos fraternos
  const loadCommitments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/financial/fraternal-commitments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommitments(data.data || []);
      } else {
        console.error('Error al cargar compromisos fraternos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar familias y estudiantes
  const loadFamiliesAndStudents = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');

      const [familiesRes, studentsRes] = await Promise.all([
        fetch(`${apiUrl}/families`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (familiesRes.ok) {
        const familiesData = await familiesRes.json();
        setFamilies(familiesData || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData || []);
      }
    } catch (error) {
      console.error('Error al cargar familias y estudiantes:', error);
    }
  };

  useEffect(() => {
    loadCommitments();
    loadFamiliesAndStudents();
  }, []);

  const handleCreateCommitment = async (commitmentData: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/financial/fraternal-commitments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitmentData)
      });

      if (response.ok) {
        loadCommitments(); // Recargar la lista
        setShowCreateModal(false);
      } else {
        throw new Error('Error al crear compromiso fraterno');
      }
    } catch (error) {
      console.error('Error al crear compromiso fraterno:', error);
    }
  };

  const handleEditCommitment = async (commitmentData: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/financial/fraternal-commitments?id=${selectedCommitment?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitmentData)
      });

      if (response.ok) {
        loadCommitments(); // Recargar la lista
        setShowModal(false);
        setSelectedCommitment(null);
      } else {
        throw new Error('Error al actualizar compromiso fraterno');
      }
    } catch (error) {
      console.error('Error al actualizar compromiso fraterno:', error);
    }
  };

  const handleOpenEditModal = (commitment: FraternalCommitment) => {
    setSelectedCommitment(commitment);
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedCommitment(null);
    setShowCreateModal(true);
  };

  const handleCloseModals = () => {
    setShowModal(false);
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setSelectedCommitment(null);
  };

  const handleOpenDetailsModal = (commitment: FraternalCommitment) => {
    setSelectedCommitment(commitment);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'suspendido': return 'bg-yellow-100 text-yellow-800';
      case 'modificado': return 'bg-blue-100 text-blue-800';
      case 'finalizado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'suspendido': return 'Suspendido';
      case 'modificado': return 'Modificado';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };

  const filteredCommitments = commitments.filter(commitment =>
    commitment.families?.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commitment.students?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commitment.students?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commitment.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-pink-500" />
          <h1 className="text-3xl waldorf-title text-gray-900">
            Compromisos Fraternos
          </h1>
        </div>
        <p className="waldorf-body-text text-gray-600">
          Gestión de los compromisos de aporte de las familias de la comunidad educativa
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por familia, estudiante o año académico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-pink-300 hover:bg-pink-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Compromiso</span>
        </button>
      </div>

      {/* Lista de compromisos */}
      {filteredCommitments.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl waldorf-title mb-2">No hay compromisos fraternos</h3>
          <p className="waldorf-body-text">Comienza creando un nuevo compromiso fraterno.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCommitments.map((commitment) => (
            <div key={commitment.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {commitment.families?.family_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commitment.status)}`}>
                      {getStatusText(commitment.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Estudiante</p>
                      <p className="font-medium">
                        {commitment.students?.first_name} {commitment.students?.last_name}
                      </p>
                      {commitment.students?.grade && (
                        <p className="text-xs text-gray-400">{commitment.students.grade}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Año Académico</p>
                      <p className="font-medium">{commitment.academic_year}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Monto Acordado</p>
                      <p className="font-medium text-green-600">
                        ${commitment.agreed_amount.toLocaleString()}
                      </p>
                      {commitment.suggested_amount && (
                        <p className="text-xs text-gray-400">
                          Sugerido: ${commitment.suggested_amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Compromiso: {new Date(commitment.commitment_date).toLocaleDateString()}</span>
                    </div>
                    {commitment.review_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Revisión: {new Date(commitment.review_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Frecuencia: {commitment.payment_frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenDetailsModal(commitment)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(commitment)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedCommitment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl waldorf-title">Detalles del Compromiso Fraterno</h2>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="waldorf-body-text"><strong>Familia:</strong> {selectedCommitment.families?.family_name}</p>
                  <p className="waldorf-body-text"><strong>Estudiante:</strong> {selectedCommitment.students?.first_name} {selectedCommitment.students?.last_name}</p>
                  <p className="waldorf-body-text"><strong>Año Académico:</strong> {selectedCommitment.academic_year}</p>
                  <p className="waldorf-body-text"><strong>Monto Acordado:</strong> ${selectedCommitment.agreed_amount.toLocaleString()}</p>
                  {selectedCommitment.suggested_amount && (
                    <p className="waldorf-body-text"><strong>Monto Sugerido:</strong> ${selectedCommitment.suggested_amount.toLocaleString()}</p>
                  )}
                  <p className="waldorf-body-text"><strong>Frecuencia:</strong> {selectedCommitment.payment_frequency}</p>
                  <p className="waldorf-body-text"><strong>Estado:</strong> {getStatusText(selectedCommitment.status)}</p>
                  <p className="waldorf-body-text"><strong>Fecha de Compromiso:</strong> {new Date(selectedCommitment.commitment_date).toLocaleDateString()}</p>
                  {selectedCommitment.review_date && (
                    <p className="waldorf-body-text"><strong>Fecha de Revisión:</strong> {new Date(selectedCommitment.review_date).toLocaleDateString()}</p>
                  )}
                  {selectedCommitment.notes && (
                    <div>
                      <p className="waldorf-body-text"><strong>Notas:</strong></p>
                      <p className="waldorf-body-text text-gray-600">{selectedCommitment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar compromiso */}
      {(showModal || showCreateModal) && (
        <FraternalCommitmentForm
          commitment={selectedCommitment}
          families={families}
          students={students}
          onSave={showCreateModal ? handleCreateCommitment : handleEditCommitment}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default FraternalCommitmentsModule;
