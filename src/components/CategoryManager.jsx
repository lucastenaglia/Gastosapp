import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Save } from 'lucide-react'

const CategoryManager = ({ onClose, currentCategories, onUpdateCategories }) => {
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [newCategory, setNewCategory] = useState({ value: '', label: '', emoji: '' })

  // Inicializar categorías
  useEffect(() => {
    setCategories([...currentCategories])
  }, [currentCategories])

  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label || !newCategory.emoji) {
      alert('Por favor completa todos los campos')
      return
    }

    // Verificar que el valor no esté duplicado
    if (categories.some(cat => cat.value === newCategory.value)) {
      alert('Ya existe una categoría con ese valor')
      return
    }

    const categoryToAdd = {
      id: Date.now().toString(),
      value: newCategory.value.toLowerCase(),
      label: newCategory.label,
      emoji: newCategory.emoji
    }

    const updatedCategories = [...categories, categoryToAdd]
    setCategories(updatedCategories)
    onUpdateCategories(updatedCategories)

    // Limpiar formulario
    setNewCategory({ value: '', label: '', emoji: '' })
  }

  const handleEditCategory = (category) => {
    setEditingId(category.id)
    setEditForm({
      value: category.value,
      label: category.label,
      emoji: category.emoji
    })
  }

  const handleSaveEdit = () => {
    if (!editForm.value || !editForm.label || !editForm.emoji) {
      alert('Por favor completa todos los campos')
      return
    }

    // Verificar que el valor no esté duplicado (excluyendo la categoría actual)
    if (categories.some(cat => cat.id !== editingId && cat.value === editForm.value)) {
      alert('Ya existe una categoría con ese valor')
      return
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingId
        ? { ...cat, value: editForm.value.toLowerCase(), label: editForm.label, emoji: editForm.emoji }
        : cat
    )

    setCategories(updatedCategories)
    onUpdateCategories(updatedCategories)
    setEditingId(null)
    setEditForm({})
  }

  const handleDeleteCategory = (categoryId) => {
    // Verificar que no sea una categoría del sistema (las primeras 8)
    const category = categories.find(cat => cat.id === categoryId)
    if (category && ['comida', 'super', 'auto', 'entretenimiento', 'salud', 'ropa', 'hogar', 'otros'].includes(category.value)) {
      alert('No se pueden eliminar las categorías del sistema')
      return
    }

    if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Los gastos existentes mantendrán la categoría.')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      setCategories(updatedCategories)
      onUpdateCategories(updatedCategories)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gestionar Categorías</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Formulario para agregar nueva categoría */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nueva Categoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor (sin espacios)</label>
                <input
                  type="text"
                  value={newCategory.value}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="ej: transporte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="ej: Transporte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                <input
                  type="text"
                  value={newCategory.emoji}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="🚌"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Categoría</span>
            </button>
          </div>

          {/* Lista de categorías existentes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Categorías Existentes</h3>
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  {editingId === category.id ? (
                    // Modo edición
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={editForm.value}
                        onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={editForm.label}
                        onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={editForm.emoji}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emoji: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    // Modo visualización
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{category.label}</p>
                        <p className="text-sm text-gray-500">{category.value}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {editingId === category.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Guardar cambios"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Cancelar edición"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Las categorías del sistema (Comida, Super, Auto, etc.) no se pueden eliminar. 
              Solo puedes editar su nombre y emoji.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
