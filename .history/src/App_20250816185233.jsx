import { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import Login from './components/Login'
import HouseholdSetup from './components/HouseholdSetup'
import { getExpenses, addExpense, updateExpense, deleteExpense, createOrJoinHousehold, getUserHousehold, leaveHousehold, returnToHousehold, joinHouseholdByEmail } from './services/expenseService'

function App() {
  const [expenses, setExpenses] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isHouseholdSetupOpen, setIsHouseholdSetupOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [household, setHousehold] = useState(null)

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
      checkHousehold()
    }
  }, [user])

  // Verificar si el usuario está en un hogar
  const checkHousehold = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Verificando hogar para usuario:', user.id)
      const householdInfo = await getUserHousehold(user.id)
      console.log('🏠 Información del hogar obtenida:', householdInfo)
      setHousehold(householdInfo)
      
      if (!householdInfo) {
        console.log('⚠️ Usuario no está en ningún hogar, mostrando setup')
        // Si no está en un hogar, mostrar el setup
        setIsHouseholdSetupOpen(true)
      } else {
        console.log('✅ Usuario está en hogar:', householdInfo.household.name)
      }
    } catch (err) {
      console.error('❌ Error verificando hogar:', err)
      // Si hay error, asumir que no está en hogar
      setHousehold(null)
      setIsHouseholdSetupOpen(true)
    }
  }

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
      
      const data = await getExpenses(user.id)
      console.log('📊 Gastos obtenidos en loadExpenses:', data)
      console.log('📊 Cantidad de gastos:', data ? data.length : 0)
      
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
    setHousehold(null)
    localStorage.removeItem('user')
  }

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (isFormOpen || isHouseholdSetupOpen)) {
        if (isFormOpen) setIsFormOpen(false)
        if (isHouseholdSetupOpen) setIsHouseholdSetupOpen(false)
      }
    }

    if (isFormOpen || isHouseholdSetupOpen) {
      document.addEventListener('keydown', handleEscape)
      // Bloquear el scroll del body
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restaurar el scroll del body
      document.body.style.overflow = 'unset'
    }
  }, [isFormOpen, isHouseholdSetupOpen])

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

  const handleHouseholdSetup = async (email, action) => {
    try {
      if (action === 'create') {
        await createOrJoinHousehold(user.id, email)
      } else if (action === 'join') {
        await joinHouseholdByEmail(user.id, email)
      }
      await checkHousehold()
      await loadExpenses()
    } catch (err) {
      throw err
    }
  }

  const handleLeaveHousehold = async () => {
    try {
      await leaveHousehold(user.id)
      setHousehold(null)
      await loadExpenses()
    } catch (err) {
      setError('Error al salir del hogar')
      console.error(err)
    }
  }

  const handleReturnToHousehold = async () => {
    try {
      const householdInfo = await returnToHousehold(user.id)
      setHousehold(householdInfo)
      await loadExpenses()
    } catch (err) {
      throw err
    }
  }

  // Mostrar pantalla de login si no hay usuario autenticado
  if (!user) {
    console.log('🔒 No hay usuario, mostrando Login')
    return <Login onLogin={handleLogin} />
  }

  console.log('👤 Usuario autenticado:', user, 'Loading:', loading, 'Expenses:', expenses.length, 'Household:', household)

  // Mostrar la aplicación principal si hay usuario autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddExpense={() => setIsFormOpen(true)} 
        onLogout={handleLogout} 
        user={user}
        household={household}
        onSetupHousehold={() => setIsHouseholdSetupOpen(true)}
        onLeaveHousehold={handleLeaveHousehold}
        onReturnToHousehold={handleReturnToHousehold}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {household && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🏠</span>
                <span className="font-medium text-blue-900">Hogar: {household.household.name}</span>
              </div>
              <button
                onClick={() => setIsHouseholdSetupOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Cambiar hogar
              </button>
            </div>
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

      {isHouseholdSetupOpen && (
        <HouseholdSetup
          onSetup={handleHouseholdSetup}
          onClose={() => setIsHouseholdSetupOpen(false)}
          isOpen={isHouseholdSetupOpen}
          currentUser={user}
          onReturnToHousehold={handleReturnToHousehold}
          hasExistingHousehold={!!household}
        />
      )}
    </div>
  )
}

export default App 