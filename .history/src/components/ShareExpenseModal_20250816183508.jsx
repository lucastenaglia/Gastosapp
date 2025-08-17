import { useState } from 'react'
import { X, Share2, UserPlus } from 'lucide-react'

const ShareExpenseModal = ({ expense, onShare, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    email: '',
    canEdit: false,
    canDelete: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email.trim()) {
      setError('Por favor ingresa el email del usuario')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onShare(expense.id, formData.email, formData.canEdit, formData.canDelete)
      setFormData({ email: '', canEdit: false, canDelete: false })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al compartir el gasto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Compartir Gasto
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Gasto a compartir:</p>
            <p className="font-medium text-gray-900">{expense?.description}</p>
            <p className="text-sm text-gray-600">${expense?.amount?.toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del usuario
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Permisos:</label>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="canEdit"
                  name="canEdit"
                  checked={formData.canEdit}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="canEdit" className="text-sm text-gray-700">
                  Puede editar el gasto
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="canDelete"
                  name="canDelete"
                  checked={formData.canDelete}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="canDelete" className="text-sm text-gray-700">
                  Puede eliminar el gasto
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoading ? 'Compartiendo...' : 'Compartir'}</span>
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

export default ShareExpenseModal
