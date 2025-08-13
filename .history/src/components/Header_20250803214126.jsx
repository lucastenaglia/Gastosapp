import { Plus, DollarSign } from 'lucide-react'

const Header = ({ onAddExpense }) => {
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
              <p className="text-gray-600">Controla tus gastos cotidianos</p>
            </div>
          </div>
          
          <button
            onClick={onAddExpense}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border-0 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <span className="text-sm">Agregar Gasto</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 