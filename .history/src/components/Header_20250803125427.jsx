import { Plus, DollarSign } from 'lucide-react'

const Header = ({ onAddExpense }) => {
  return (
                    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gastos App</h1>
              <p className="text-gray-600">Controla tus gastos cotidianos</p>
            </div>
          </div>
          
          <button
            onClick={onAddExpense}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Gasto</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 