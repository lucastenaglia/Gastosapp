import { Plus, DollarSign, Home, Settings, LogOut, ArrowLeft, MoreVertical } from 'lucide-react'
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
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        {/* Primera fila: Logo y título */}
        <div className="flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 sm:p-3 rounded-xl shadow-lg">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gastos App</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {household ? `Hogar: ${household.household.name}` : 'Controla tus gastos cotidianos'}
              </p>
            </div>
          </div>
          
          {/* Saludo y botón de cerrar sesión - siempre visibles */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
              Hola, {getFirstName(user?.name) || user?.email || 'Usuario'}
            </span>
            <button
              onClick={onLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
        
        {/* Segunda fila: Botones de configuración - responsive */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
          {onSetupHousehold && (
            <div className="relative">
              <button
                onClick={() => setShowLeaveMenu(!showLeaveMenu)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                title={household ? "Configuraciones del hogar" : "Configurar hogar"}
              >
                {household ? <Settings className="h-3 w-3 sm:h-4 sm:w-4" /> : <Home className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="hidden sm:inline">
                  {household ? "Configurar" : "Configurar"}
                </span>
                <span className="sm:hidden">
                  {household ? "Config" : "Config"}
                </span>
              </button>
              
              {showLeaveMenu && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {household ? (
                    <>
                      <button
                        onClick={onSetupHousehold}
                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Cambiar Hogar</span>
                        <span className="sm:hidden">Cambiar</span>
                      </button>
                      <button
                        onClick={handleLeavePermanent}
                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Salir del Hogar</span>
                        <span className="sm:hidden">Salir</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onSetupHousehold}
                      className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Configurar Hogar</span>
                      <span className="sm:hidden">Configurar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!household && onReturnToHousehold && (
            <button
              onClick={onReturnToHousehold}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              title="Volver al hogar existente"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Hogar</span>
              <span className="sm:hidden">Hogar</span>
            </button>
          )}

          {household && onLeaveHousehold && (
            <button
              onClick={onLeaveHousehold}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              title="Cambiar a vista personal"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Personal</span>
              <span className="sm:hidden">Personal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 