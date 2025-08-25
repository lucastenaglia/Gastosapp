import { Plus, DollarSign, Home, Settings, LogOut, ArrowLeft, MoreVertical, User } from 'lucide-react'
import { useState } from 'react'

const Header = ({ onAddExpense, onLogout, user, household, onSetupHousehold, onLeaveHousehold, onReturnToHousehold, onLeaveHouseholdPermanently }) => {
  const [showLeaveMenu, setShowLeaveMenu] = useState(false)

  // Función para obtener solo el primer nombre
  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario'
    return fullName.split(' ')[0] // Tomar solo la primera palabra
  }

  const handleLeaveTemporary = () => {
    setShowLeaveMenu(false)
    onLeaveHousehold()
  }

  const handleLeavePermanent = () => {
    setShowLeaveMenu(false)
    onLeaveHouseholdPermanently()
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-3 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gastos App</h1>
              <p className="text-gray-600">
                {!household ? 'Controla tus gastos cotidianos' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onSetupHousehold && (
              <div className="relative">
                <button
                  onClick={() => setShowLeaveMenu(!showLeaveMenu)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  title={household ? "Configuraciones del hogar" : "Configurar hogar"}
                >
                  {household ? <Settings className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                  <span className="text-sm hidden sm:inline">
                    {household ? "Configurar" : "Configurar"}
                  </span>
                </button>
                
                {showLeaveMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {household ? (
                      <>
                        <button
                          onClick={onSetupHousehold}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Cambiar Hogar</span>
                        </button>
                        <button
                          onClick={() => onSetupHousehold('categories')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Gestionar Categorías</span>
                        </button>
                        <button
                          onClick={handleLeavePermanent}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Salir del Hogar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={onSetupHousehold}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Home className="h-4 w-4" />
                        <span>Configurar Hogar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!household && onReturnToHousehold && (
              <button
                onClick={onReturnToHousehold}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                title="Volver al hogar existente"
              >
                <Home className="h-4 w-4" />
              </button>
            )}

            {household && onLeaveHousehold && (
              <button
                onClick={onLeaveHousehold}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                title="Cambiar a vista personal"
              >
                <User className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Personal</span>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Hola, {getFirstName(user?.name) || user?.email || 'Usuario'}</span>
              <button
                onClick={onLogout}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 