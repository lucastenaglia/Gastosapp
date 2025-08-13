import { useState } from 'react'
import { Trash2, Edit, Calendar, DollarSign } from 'lucide-react'

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Historial de Gastos
      </h2>
      
      <div className="space-y-4">
        {expenses.map(expense => (
          <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            {editingId === expense.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="input-field"
                />
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="input-field flex-1"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="input-field flex-1"
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(expense.id)}
                    className="btn-primary text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${categoryColors[expense.category]}`}>
                    <span className="text-lg">{categoryIcons[expense.category]}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {expense.description}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(expense.date)}</span>
                      </span>
                      <span className="capitalize">{expense.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </span>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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