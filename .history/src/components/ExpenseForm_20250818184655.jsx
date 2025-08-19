import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

const ExpenseForm = ({ onSubmit, onClose, currentUser, household, householdMembers = [], categories = [] }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: categories.length > 0 ? categories[0].value : 'comida',
    person: currentUser?.name?.toLowerCase() || 'usuario',
    date: new Date().toISOString().split('T')[0]
  })

  // Verificar si estamos en modo hogar
  const isHouseholdMode = !!household && householdMembers.length > 0

  // Usar las categorías recibidas como prop, o las por defecto si no hay
  const defaultCategories = [
    { value: 'comida', label: '🍽️ Comida' },
    { value: 'super', label: '🛒 Super' },
    { value: 'auto', label: '🚗 Auto' },
    { value: 'entretenimiento', label: '🎮 Entretenimiento' },
    { value: 'salud', label: '💊 Salud' },
    { value: 'ropa', label: '👕 Ropa' },
    { value: 'hogar', label: '🏠 Hogar' },
    { value: 'otros', label: '📦 Otros' }
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) {
      alert('Por favor completa todos los campos')
      return
    }
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    })
    
    setFormData({
      description: '',
      amount: '',
      category: categories.length > 0 ? categories[0].value : 'comida',
      person: currentUser?.name?.toLowerCase() || 'usuario',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Actualizar person cuando cambie el usuario
  useEffect(() => {
    if (currentUser?.name) {
      setFormData(prev => ({
        ...prev,
        person: currentUser.name.toLowerCase()
      }))
    }
  }, [currentUser])

  // Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nuevo Gasto</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ej: Almuerzo en restaurante"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                step="1"
                min="0"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {displayCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              {isHouseholdMode ? (
                <select
                  name="person"
                  value={formData.person}
                  onChange={handleChange}
                  className="input-field"
                >
                  {householdMembers.map(member => {
                    const firstName = member.user?.name?.split(' ')[0] || 'Usuario'
                    const value = member.user?.name?.toLowerCase() || 'usuario'
                    return (
                      <option key={member.user_id} value={value}>
                        👤 {firstName}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <div className="input-field bg-gray-50 text-gray-700 cursor-not-allowed">
                  👤 {currentUser?.name || 'Usuario'}
                </div>
              )}
              <input
                type="hidden"
                name="person"
                value={formData.person}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ExpenseForm 