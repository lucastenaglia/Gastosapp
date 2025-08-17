import { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import Login from './components/Login'
import HouseholdSetup from './components/HouseholdSetup'
import { 
  getUserHousehold, 
  getExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  createOrJoinHousehold, 
  leaveHousehold, 
  returnToHousehold, 
  leaveHouseholdPermanently, 
  inviteUserToHousehold,
  debugUserHouseholdStatus,
  verifyTableStructure,
  getPersonalExpenses,
  debugAldanaIssue
} from './services/expenseService'

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

  // Verificar el hogar del usuario
  const checkHousehold = async () => {
    try {
      console.log('🔍 checkHousehold iniciado para usuario:', user?.id)
      console.log('🔍 checkHousehold - user completo:', user)
      console.log('🔍 checkHousehold - user.email:', user?.email)
      console.log('🔍 checkHousehold - user.id tipo:', typeof user?.id)
      console.log('🔍 checkHousehold - user.id valor:', JSON.stringify(user?.id))
      
      if (!user || !user.id) {
        console.error('❌ checkHousehold - Usuario o user.id es null/undefined')
        console.error('❌ checkHousehold - user:', user)
        return
      }
      
      const householdInfo = await getUserHousehold(user.id)
      console.log('🏠 checkHousehold - householdInfo obtenido:', householdInfo)
      
      setHousehold(householdInfo)
      console.log('✅ checkHousehold - household establecido:', householdInfo)
      
      if (!householdInfo) {
        console.log('⚠️ Usuario no está en ningún hogar, pero NO abriendo modal automáticamente')
      } else {
        console.log('✅ Usuario está en hogar:', householdInfo.household.name)
      }
    } catch (err) {
      console.error('❌ Error verificando hogar:', err)
      setHousehold(null)
    }
  }

  // Cargar gastos solo si hay usuario autenticado
  const loadExpenses = async () => {
    console.log('🚀 loadExpenses iniciado, usuario:', user)
    console.log('🚀 loadExpenses - user.id:', user?.id)
    console.log('🚀 loadExpenses - user.email:', user?.email)
    console.log('🚀 loadExpenses - household:', household)
    console.log('🚀 loadExpenses - household es null?', household === null)
    
    if (!user) {
      console.log('❌ No hay usuario, retornando')
      return
    }
    
    try {
      console.log('⏳ Iniciando carga de gastos para:', user.email)
      setLoading(true)
      
      // Si no hay hogar, cargar gastos personales directamente
      if (!household) {
        console.log('🏠 No hay hogar, cargando gastos personales directamente...')
        const personalData = await getPersonalExpenses(user.id)
        console.log('📊 Gastos personales obtenidos directamente:', personalData)
        console.log('📊 Cantidad de gastos personales:', personalData ? personalData.length : 0)
        setExpenses(personalData)
      } else {
        console.log('🏠 Hay hogar, cargando gastos del hogar...')
        const data = await getExpenses(user.id)
        console.log('📊 Gastos del hogar obtenidos:', data)
        setExpenses(data)
      }
      
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

  const handleHouseholdSetup = async (email, action, invitedEmails = []) => {
    try {
      if (action === 'create') {
        await createOrJoinHousehold(user.id, email, invitedEmails)
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
      console.log('🔄 handleLeaveHousehold iniciado')
      console.log('🔄 Usuario actual:', user.email)
      console.log('🔄 Hogar actual:', household)
      
      await leaveHousehold(user.id)
      console.log('✅ leaveHousehold completado')
      
      setHousehold(null)
      console.log('✅ household establecido como null')
      
      await loadExpenses()
      console.log('✅ loadExpenses completado')
      
      console.log('✅ handleLeaveHousehold completado exitosamente')
    } catch (err) {
      console.error('❌ Error en handleLeaveHousehold:', err)
      setError('Error al salir del hogar')
    }
  }

  const handleReturnToHousehold = async () => {
    try {
      console.log('🔄 handleReturnToHousehold iniciado')
      console.log('🔄 Usuario actual:', user.email)
      console.log('🔄 Usuario ID:', user.id)
      console.log('🔄 Usuario completo:', user)
      
      // Verificar que el user.id sea el correcto
      console.log('🔍 Verificando user.id en la base de datos...')
      
      // Usar función de debug
      const debugInfo = await debugUserHouseholdStatus(user.id)
      console.log('🔍 DEBUG - Información completa:', debugInfo)
      
      const householdInfo = await returnToHousehold(user.id)
      console.log('🏠 householdInfo obtenido:', householdInfo)
      
      setHousehold(householdInfo)
      console.log('✅ household establecido:', householdInfo)
      
      await loadExpenses()
      console.log('✅ loadExpenses completado')
      
      console.log('✅ handleReturnToHousehold completado exitosamente')
    } catch (err) {
      console.error('❌ Error en handleReturnToHousehold:', err)
      setError('Error al volver al hogar: ' + err.message)
    }
  }

  const handleInviteUser = async (email) => {
    try {
      await inviteUserToHousehold(user.id, email)
      await checkHousehold()
      await loadExpenses()
    } catch (err) {
      setError('Error al invitar al usuario')
      console.error(err)
    }
  }

  const handleLeaveHouseholdPermanently = async () => {
    try {
      console.log('🔄 handleLeaveHouseholdPermanently iniciado')
      console.log('🔄 Usuario actual:', user.email)
      console.log('🔄 Hogar actual:', household)
      
      await leaveHouseholdPermanently(user.id)
      console.log('✅ leaveHouseholdPermanently completado')
      
      setHousehold(null)
      console.log('✅ household establecido como null')
      
      await loadExpenses()
      console.log('✅ loadExpenses completado')
      
      console.log('✅ handleLeaveHouseholdPermanently completado exitosamente')
    } catch (err) {
      console.error('❌ Error en handleLeaveHouseholdPermanently:', err)
      setError('Error al salir del hogar permanentemente')
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
        user={user} 
        household={household}
        onSetupHousehold={() => setIsHouseholdSetupOpen(true)}
        onLeaveHousehold={handleLeaveHousehold}
        onReturnToHousehold={handleReturnToHousehold}
        onAddExpense={() => setIsFormOpen(true)}
        onLogout={handleLogout}
        onLeaveHouseholdPermanently={handleLeaveHouseholdPermanently}
      />
      
        {/* Botón temporal de debug */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                🔧 Debug - Estado del Hogar
              </h3>
              <p className="text-sm text-yellow-700">
                Estado actual: {household ? `En hogar: ${household.household.name}` : 'Sin hogar'}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  console.log('🔧 Botón debug - Verificando hogar...')
                  checkHousehold()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                🔧 Verificar Hogar
              </button>
              <button
                onClick={() => {
                  console.log('🔧 Botón debug - Debug completo...')
                  debugUserHouseholdStatus(user.id)
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                🔧 Debug Completo
              </button>
              <button
                onClick={() => {
                  console.log('🔧 Botón debug - Verificar estructura de tablas...')
                  verifyTableStructure()
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                🔧 Verificar Estructura
              </button>
              <button
                onClick={() => {
                  console.log('🔧 Botón debug - Debug de Aldana...')
                  debugAldanaIssue()
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                🔧 Debug de Aldana
              </button>
            </div>
          </div>
        </div>
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
          onInviteUser={handleInviteUser}
        />
      )}
    </div>
  )
}

export default App 