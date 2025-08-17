import { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import Login from './components/Login'
import ShareExpenseModal from './components/ShareExpenseModal'
import { getAllExpenses, addExpense, updateExpense, deleteExpense, shareExpense } from './services/expenseService'

function App() {
  const [expenses, setExpenses] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    console.log('🔄 useEffect de autenticación ejecutándose')
    
    const savedUser = localStorage.getItem('user')
    console.log('💾 Usuario en localStorage:', savedUser)
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      console.log('👤 Usuario parseado:', parsedUser)
      setUser(parsedUser)
    } else {
      console.log('❌ No hay usuario guardado, setLoading(false)')
      setLoading(false)
    }
  }, [])

  // Cargar gastos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      console.log('📞 Llamando a loadExpenses por cambio de usuario...')
      loadExpenses()
    }
  }, [user])

  // Cargar gastos solo si hay usuario autenticado
  const loadExpenses = async () => {
    console.log('🚀 loadExpenses iniciado, usuario:', user)
    
    if (!user) {
      console.log('❌ No hay usuario, retornando')
      return
    }
    
    try {
      console.log('⏳ Iniciando carga de gastos para:', user.email)
      setLoading(true)
      
      const data = await getAllExpenses(user.id)
      console.log('📊 Gastos obtenidos:', data)
      
      setExpenses(data)
      setError(null)
    } catch (err) {
      console.error('❌ Error en loadExpenses:', err)
      setError('Error al cargar los gastos')
    } finally {
      console.log('✅ Finalizando loadExpenses, loading:', false)
      setLoading(false)
    }
  }

  const handleLogin = (user) => {
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    // loadExpenses será llamado por el useEffect que observa `user`
  }

  const handleLogout = () => {
    setUser(null)
    setExpenses([])
    localStorage.removeItem('user')
  }

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (isFormOpen || isShareModalOpen)) {
        if (isFormOpen) setIsFormOpen(false)
        if (isShareModalOpen) setIsShareModalOpen(false)
      }
    }

    if (isFormOpen || isShareModalOpen) {
      document.addEventListener('keydown', handleEscape)
      // Bloquear el scroll del body
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restaurar el scroll del body
      document.body.style.overflow = 'unset'
    }
  }, [isFormOpen, isShareModalOpen])

  const handleAddExpense = async (expense) => {
    try {
      const newExpense = await addExpense(expense, user.id)
      setExpenses([newExpense, ...expenses])
      setIsFormOpen(false)
    } catch (err) {
      setError('Error al agregar el gasto')
      console.error(err)
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id, user.id)
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (err) {
      setError('Error al eliminar el gasto')
      console.error(err)
    }
  }

  const handleEditExpense = async (id, updatedExpense) => {
    try {
      const updated = await updateExpense(id, updatedExpense, user.id)
      setExpenses(expenses.map(expense =>
        expense.id === id ? updated : expense
      ))
    } catch (err) {
      setError('Error al actualizar el gasto')
      console.error(err)
    }
  }

  const handleShareExpense = async (expenseId, sharedWithEmail, canEdit, canDelete) => {
    try {
      await shareExpense(expenseId, sharedWithEmail, canEdit, canDelete)
      // Recargar gastos para mostrar el estado actualizado
      await loadExpenses()
    } catch (err) {
      throw err
    }
  }

  const openShareModal = (expense) => {
    setSelectedExpense(expense)
    setIsShareModalOpen(true)
  }

  // Mostrar pantalla de login si no hay usuario autenticado
  if (!user) {
    console.log('🔒 No hay usuario, mostrando Login')
    return <Login onLogin={handleLogin} />
  }

  console.log('👤 Usuario autenticado:', user, 'Loading:', loading, 'Expenses:', expenses.length)

  // Mostrar la aplicación principal si hay usuario autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddExpense={() => setIsFormOpen(true)} onLogout={handleLogout} user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <ExpenseSummary expenses={expenses} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Gastos</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ExpenseList 
              expenses={expenses} 
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
              onShare={openShareModal}
              currentUser={user}
            />
          )}
        </div>
      </main>

      {isFormOpen && (
        <ExpenseForm 
          onSubmit={handleAddExpense}
          onClose={() => setIsFormOpen(false)}
          currentUser={user}
        />
      )}

      {isShareModalOpen && (
        <ShareExpenseModal
          expense={selectedExpense}
          onShare={handleShareExpense}
          onClose={() => setIsShareModalOpen(false)}
          isOpen={isShareModalOpen}
        />
      )}
    </div>
  )
}

export default App 