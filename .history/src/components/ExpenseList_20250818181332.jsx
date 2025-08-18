import { useState } from 'react'
import { Trash2, Edit, Calendar, DollarSign, Share2, Users } from 'lucide-react'

const ExpenseList = ({ expenses, onDelete, onEdit, onShare, currentUser, loading, householdMembers = [], filteredPerson = null, onClearFilter = null, onFilterCategory = null, filteredCategory = null }) => {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const categoryIcons = {
    comida: '🍽️',
    super: '🛒',
    auto: '🚗',
    entretenimiento: '🎮',
    salud: '💊',
    ropa: '👕',
    hogar: '🏠',
    otros: '📦'
  }

  const categoryColors = {
    comida: 'bg-orange-100 text-orange-800',
    super: 'bg-red-100 text-red-800',
    auto: 'bg-blue-100 text-blue-800',
    entretenimiento: 'bg-purple-100 text-purple-800',
    salud: 'bg-green-100 text-green-800',
    ropa: 'bg-pink-100 text-pink-800',
    hogar: 'bg-yellow-100 text-yellow-800',
    otros: 'bg-gray-100 text-gray-800'
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      person: expense.person || 'lucas',
      date: expense.date
    })
  }

  const handleSaveEdit = (id) => {
    onEdit(id, {
      ...editForm,
      amount: parseFloat(editForm.amount)
    })
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para obtener el nombre real de la persona
  const getPersonDisplayName = (personName) => {
    if (!personName) return 'lucas'
    
    // Buscar en los miembros del hogar para obtener el nombre real
    const member = householdMembers.find(member => {
      const memberName = member.user?.name?.toLowerCase() || ''
      const personLower = personName.toLowerCase()
      
      // Mapear nombres antiguos
      if (personLower === 'aldi' && memberName.includes('aldana')) return true
      if (personLower === 'lucas' && memberName.includes('lucas')) return true
      
      // Mapear nombres exactos
      return memberName === personLower || memberName.includes(personLower)
    })
    
    if (member && member.user?.name) {
      return member.user.name.split(' ')[0] // Solo primer nombre
    }
    
    return personName
  }

  // Función para obtener el emoji de la persona
  const getPersonEmoji = (personName) => {
    if (!personName) return '👤'
    
    const displayName = getPersonDisplayName(personName).toLowerCase()
    
    if (displayName.includes('lucas')) return '👨'
    if (displayName.includes('aldana')) return '👩'
    if (personName === 'auto') return '🚗'
    
    return '👤'
  }

  // Función para manejar el clic en un gasto y filtrar por categoría
  const handleExpenseClick = (expense) => {
    if (onFilterCategory && !editingId) {
      onFilterCategory(expense.category)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando gastos...
          </h3>
          <p className="text-gray-600">
            Conectando con la base de datos
          </p>
        </div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay gastos registrados
          </h3>
          <p className="text-gray-600">
            Comienza agregando tu primer gasto para llevar el control
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de Gastos
          {filteredCategory && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Filtrado: {filteredCategory})
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          {filteredCategory && onFilterCategory && (
            <button
              onClick={() => onFilterCategory(null)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            >
              <span>✕</span>
              <span>Limpiar Categoría</span>
            </button>
          )}
          {filteredPerson && onClearFilter && (
            <button
              onClick={onClearFilter}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            >
              <span>✕</span>
              <span>Limpiar Filtro</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {expenses.map(expense => (
          <div 
            key={expense.id} 
            className={`border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 ${expense.isShared ? 'border-blue-300 bg-blue-50' : ''} ${onFilterCategory ? 'cursor-pointer' : ''}`}
            onClick={() => handleExpenseClick(expense)}
          >
            {editingId === expense.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="input-field"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="input-field"
                    step="1"
                    min="0"
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="input-field"
                  >
                    <option value="comida">🍽️ Comida</option>
                    <option value="super">🛒 Super</option>
                    <option value="auto">🚗 Auto</option>
                    <option value="entretenimiento">🎮 Entretenimiento</option>
                    <option value="salud">💊 Salud</option>
                    <option value="ropa">👕 Ropa</option>
                    <option value="hogar">🏠 Hogar</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editForm.person}
                    onChange={(e) => setEditForm({...editForm, person: e.target.value})}
                    className="input-field"
                  >
                    <option value="lucas">👨 Lucas</option>
                    <option value="aldi">👩 Aldi</option>
                  </select>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(expense.id)}
                    className="btn-primary text-sm flex-1"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary text-sm flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header con icono, descripción y monto */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${categoryColors[expense.category]}`}>
                      <span className="text-lg">{categoryIcons[expense.category]}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {expense.description}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">{formatDate(expense.date)}</span>
                          <span className="sm:hidden">{new Date(expense.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize text-xs sm:text-sm">{expense.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center space-x-1 text-gray-600">
                          <span>{getPersonEmoji(expense.person)}</span>
                          <span className="capitalize text-xs sm:text-sm">{getPersonDisplayName(expense.person)}</span>
                        </span>
                        {expense.isShared && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center space-x-1 text-blue-600">
                              <Users className="h-3 w-3" />
                              <span className="text-xs">Compartido por {expense.sharedBy?.name || 'Usuario'}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-lg font-semibold text-gray-900">
                      ${expense.amount}
                    </span>
                    
                    <div className="flex space-x-1">
                      {/* Botón de compartir - solo para gastos propios */}
                      {!expense.isShared && onShare && (
                        <button
                          onClick={() => onShare(expense)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Compartir"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Botón de editar - solo si tiene permisos */}
                      {(expense.permissions?.canEdit || !expense.isShared) && (
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Botón de eliminar - solo si tiene permisos */}
                      {(expense.permissions?.canDelete || !expense.isShared) && (
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Información adicional en móvil */}
                <div className="sm:hidden flex items-center justify-between text-sm text-gray-600 border-t pt-2">
                  <span className="flex items-center space-x-1">
                    <span>{getPersonEmoji(expense.person)}</span>
                    <span className="capitalize">{getPersonDisplayName(expense.person)}</span>
                  </span>
                  <span className="text-xs">
                    {new Date(expense.date).toLocaleDateString('es-ES', { year: 'numeric' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpenseList 