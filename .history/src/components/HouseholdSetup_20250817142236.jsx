import { useState } from 'react'
import { X, Home, Users, Plus, ArrowLeft } from 'lucide-react'

const HouseholdSetup = ({ onSetup, onClose, isOpen, currentUser, onReturnToHousehold, hasExistingHousehold, onInviteUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    action: 'create', // 'create', 'join', 'return', 'invite'
    invitedEmails: [] // Array de emails para invitar
  })
  const [newInvitedEmail, setNewInvitedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.action === 'return') {
      try {
        await onReturnToHousehold()
        onClose()
      } catch (err) {
        setError(err.message || 'Error al volver al hogar')
      }
      return
    }

    if (formData.action === 'invite') {
      if (!formData.email.trim()) {
        setError('Por favor ingresa el email del usuario a invitar')
        return
      }
      
      setIsLoading(true)
      setError('')
      
      try {
        await onInviteUser(formData.email)
        setFormData({ email: '', action: 'create', invitedEmails: [] })
        onClose()
      } catch (err) {
        setError(err.message || 'Error al invitar al usuario')
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!formData.email.trim()) {
      setError('Por favor ingresa el email del propietario del hogar')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Si es crear hogar, pasar también los emails invitados
      if (formData.action === 'create') {
        await onSetup(formData.email, formData.action, formData.invitedEmails)
      } else {
        await onSetup(formData.email, formData.action)
      }
      setFormData({ email: '', action: 'create', invitedEmails: [] })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al configurar el hogar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addInvitedEmail = () => {
    if (newInvitedEmail.trim() && !formData.invitedEmails.includes(newInvitedEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        invitedEmails: [...prev.invitedEmails, newInvitedEmail.trim()]
      }))
      setNewInvitedEmail('')
    }
  }

  const removeInvitedEmail = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      invitedEmails: prev.invitedEmails.filter(email => email !== emailToRemove)
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
              <Home className="h-5 w-5 text-blue-600" />
              Configurar Hogar
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>¿Qué es un hogar?</strong><br />
              Un hogar permite que múltiples usuarios vean y editen la misma lista de gastos en tiempo real.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción
              </label>
              <div className="space-y-2">
                {hasExistingHousehold && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="action"
                      value="return"
                      checked={formData.action === 'return'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Volver al hogar existente
                    </span>
                  </label>
                )}
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="create"
                    checked={formData.action === 'create'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Crear nuevo hogar</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="join"
                    checked={formData.action === 'join'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Unirse a hogar existente</span>
                </label>

                {hasExistingHousehold && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="action"
                      value="invite"
                      checked={formData.action === 'invite'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Invitar usuario a hogar existente</span>
                  </label>
                )}
              </div>
            </div>

            {formData.action !== 'return' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.action === 'create' ? 'Email del propietario' : 
                   formData.action === 'join' ? 'Email del propietario del hogar' :
                   'Email del usuario a invitar'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={formData.action === 'create' ? 'tu@email.com' : 
                              formData.action === 'join' ? 'propietario@email.com' :
                              'usuario@email.com'}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.action === 'create' 
                    ? 'Tu email será el propietario del nuevo hogar'
                    : formData.action === 'join'
                    ? 'Ingresa el email del usuario que ya tiene un hogar configurado'
                    : 'Ingresa el email del usuario que quieres invitar al hogar'
                  }
                </p>
              </div>
            )}

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
                {formData.action === 'return' ? (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver al Hogar</span>
                  </>
                ) : formData.action === 'create' ? (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>{isLoading ? 'Creando...' : 'Crear Hogar'}</span>
                  </>
                ) : formData.action === 'join' ? (
                  <>
                    <Users className="h-4 w-4" />
                    <span>{isLoading ? 'Uniéndose...' : 'Unirse al Hogar'}</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    <span>{isLoading ? 'Invitando...' : 'Invitar Usuario'}</span>
                  </>
                )}
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

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">¿Cómo funciona?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Todos los usuarios del hogar ven la misma lista de gastos</li>
              <li>• Cualquiera puede agregar, editar o eliminar gastos</li>
              <li>• Los cambios se sincronizan en tiempo real</li>
              <li>• Perfecto para parejas, familias o roommates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HouseholdSetup
