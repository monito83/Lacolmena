import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Palette
} from 'lucide-react';
import CategoryForm from '../../components/CategoryForm';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CategoriesModule: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchCategories();
  }, [filterActive]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== null) params.append('is_active', filterActive.toString());

      const response = await fetch(`${apiUrl}/transaction-categories?${params}`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${apiUrl}/transaction-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) throw new Error('Error al crear categoría');
      
      await fetchCategories();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  const handleEditCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`${apiUrl}/transaction-categories?id=${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) throw new Error('Error al actualizar categoría');
      
      await fetchCategories();
      setShowCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta categoría?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/transaction-categories?id=${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al desactivar categoría');
      
      await fetchCategories();
    } catch (error) {
      console.error('Error al desactivar categoría:', error);
    }
  };

  const handleOpenEditModal = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setShowCreateModal(true);
  };

  const handleCloseModals = () => {
    setShowCategoryModal(false);
    setShowCreateModal(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'oklch(0.98 0.01 270)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
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
          <h1 className="waldorf-title text-3xl mb-2" style={{ color: 'oklch(0.30 0.05 270)' }}>
            Gestión de Categorías
          </h1>
          <p className="waldorf-body-text text-gray-600">
            Administra las categorías para organizar las transacciones financieras
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
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

            <div className="flex gap-2">
              <select
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
                className="px-3 py-2 border rounded-lg waldorf-body-text focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ 
                  backgroundColor: 'oklch(0.99 0.01 270)',
                  borderColor: 'oklch(0.90 0.05 270)'
                }}
              >
                <option value="">Todas</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
              </select>

              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-purple-300 text-gray-800 rounded-lg hover:bg-purple-400 transition-colors flex items-center gap-2 waldorf-body-text font-medium"
              >
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg p-8 text-center shadow-sm border" style={{ borderColor: 'oklch(0.90 0.05 270)' }}>
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="waldorf-body-text text-gray-500">No hay categorías registradas</p>
            </div>
          ) : (
            categories.map((category) => (
              <div 
                key={category.id} 
                className={`bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md ${
                  !category.is_active ? 'opacity-60' : ''
                }`}
                style={{ borderColor: 'oklch(0.90 0.05 270)' }}
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="waldorf-title text-lg" style={{ color: 'oklch(0.30 0.05 270)' }}>
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(category)}
                      className="text-purple-600 hover:text-purple-900 p-1"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title={category.is_active ? "Desactivar" : "Activar"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Category Description */}
                {category.description && (
                  <p className="waldorf-body-text text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                )}

                {/* Category Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-3 w-3 text-gray-400" />
                    <span className="waldorf-body-text text-xs font-mono text-gray-500">
                      {category.color}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs waldorf-body-text ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.is_active ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CategoryForm
            mode="create"
            onSave={handleCreateCategory}
            onClose={handleCloseModals}
          />
        )}

        {showCategoryModal && selectedCategory && (
          <CategoryForm
            category={selectedCategory}
            mode="edit"
            onSave={handleEditCategory}
            onClose={handleCloseModals}
          />
        )}
      </div>
    </div>
  );
};

export default CategoriesModule;
