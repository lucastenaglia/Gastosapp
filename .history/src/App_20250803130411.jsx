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
        <ExpenseSummary expenses={expenses} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense}
              onEdit={editExpense}
            />
          </div>
          
          <div className="lg:col-span-1">
            {isFormOpen && (
              <ExpenseForm 
                onSubmit={addExpense}
                onCancel={() => setIsFormOpen(false)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 