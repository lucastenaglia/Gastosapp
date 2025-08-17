import { Plus, DollarSign, Home, Settings, LogOut, ArrowLeft, MoreVertical } from 'lucide-react'
import { useState } from 'react'

const Header = ({ onAddExpense, onLogout, user, household, onSetupHousehold, onLeaveHousehold, onReturnToHousehold, onLeaveHouseholdPermanently }) => {
  const [showLeaveMenu, setShowLeaveMenu] = useState(false)

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-3 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gastos App</h1>
              <p className="text-gray-600">
                {household ? `Hogar: ${household.household.name}` : 'Controla tus gastos cotidianos'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddExpense}
              className="bg-gradient-to-r from-primary-600 to-primary-700 active:from-primary-800 active:to-primary-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              <span className="text-sm">Agregar Gasto</span>
            </button>
            
            {onSetupHousehold && (
              <button
                onClick={onSetupHousehold}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                title={household ? "Cambiar hogar" : "Configurar hogar"}
              >
                {household ? <Settings className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                <span className="text-sm hidden sm:inline">
                  {household ? "Cambiar" : "Configurar"}
                </span>
              </button>
            )}

            {!household && onReturnToHousehold && (
              <button
                onClick={onReturnToHousehold}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                title="Volver al hogar existente"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Hogar</span>
              </button>
            )}

            {household && onLeaveHousehold && (
              <div className="relative">
                <button
                  onClick={() => setShowLeaveMenu(!showLeaveMenu)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  title="Opciones del hogar"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Hogar</span>
                </button>
                
                {showLeaveMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleLeaveTemporary}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Vista Personal</span>
                    </button>
                    <button
                      onClick={handleLeavePermanent}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Salir del Hogar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Hola, {user?.name || user?.email || 'Usuario'}</span>
              <button
                onClick={onLogout}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 