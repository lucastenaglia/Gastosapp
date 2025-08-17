import { Plus, DollarSign, Home, Settings } from 'lucide-react'

const Header = ({ onAddExpense, onLogout, user, household, onSetupHousehold }) => {
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
                  {household ? "Cambiar" : "Hogar"}
                </span>
              </button>
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