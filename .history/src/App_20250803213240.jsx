import { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import { getExpenses, addExpense, updateExpense, deleteExpense } from './services/expenseService'

function App() {
  const [expenses, setExpenses] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar gastos al iniciar la aplicación
  useEffect(() => {
    loadExpenses()
  }, [])

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFormOpen])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await getExpenses()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los gastos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (expense) => {
    try {
      const newExpense = await addExpense(expense)
      setExpenses([newExpense, ...expenses])
      setIsFormOpen(false)
    } catch (err) {
      setError('Error al agregar el gasto')
      console.error(err)
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (err) {
      setError('Error al eliminar el gasto')
      console.error(err)
    }
  }

  const handleEditExpense = async (id, updatedExpense) => {
    try {
      const updated = await updateExpense(id, updatedExpense)
      setExpenses(expenses.map(expense =>
        expense.id === id ? updated : expense
      ))
    } catch (err) {
      setError('Error al actualizar el gasto')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddExpense={() => setIsFormOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <ExpenseSummary expenses={expenses} />

        <div className="mt-8">
          <ExpenseList
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
            loading={loading}
          />
        </div>
      </main>

      {/* Modal Overlay */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App 