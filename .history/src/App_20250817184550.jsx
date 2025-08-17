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
  getPersonalExpenses
} from './services/expenseService'

function App() {
  const [expenses, setExpenses] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isHouseholdSetupOpen, setIsHouseholdSetupOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [household, setHousehold] = useState(null)

  // Efecto para manejar la autenticación
  useEffect(() => {
    console.log('🔄 useEffect de autenticación ejecutándose')
    
    // Obtener usuario del localStorage
    const storedUser = localStorage.getItem('user')
    console.log('💾 Usuario en localStorage:', storedUser)
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('👤 Usuario parseado:', parsedUser)
        console.log('👤 Usuario parseado - id:', parsedUser.id)
        console.log('👤 Usuario parseado - id tipo:', typeof parsedUser.id)
        console.log('👤 Usuario parseado - id válido:', parsedUser.id && parsedUser.id !== 'undefined')
        
        if (parsedUser && parsedUser.id && parsedUser.id !== 'undefined') {
          setUser(parsedUser)
          console.log('📞 Llamando a loadExpenses por cambio de usuario...')
          loadExpenses(parsedUser)
        } else {
          console.error('❌ Usuario parseado inválido - id es undefined o null')
          console.error('❌ Usuario completo:', parsedUser)
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error parseando usuario del localStorage:', error)
        setUser(null)
        setLoading(false)
      }
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

  // Cargar gastos cuando el household cambie
  useEffect(() => {
    if (user && household !== undefined) {
      console.log('🏠 Household cambió, ejecutando loadExpenses...')
      console.log('🏠 Nuevo household:', household)
      console.log('🏠 household es null?', household === null)
      console.log('🏠 household es undefined?', household === undefined)
      console.log('🏠 household truthy?', !!household)
      // Ejecutar loadExpenses cuando household cambie
      console.log('🏠 Ejecutando loadExpenses...')
      loadExpenses()
    } else {
      console.log('🏠 useEffect household - No ejecutando loadExpenses:')
      console.log('🏠 - user:', user)
      console.log('🏠 - household:', household)
      console.log('🏠 - household !== undefined:', household !== undefined)
    }
  }, [household, user])

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
    console.log('🚀 loadExpenses - household es undefined?', household === undefined)
    console.log('🚀 loadExpenses - household truthy?', !!household)
    console.log('🚀 loadExpenses - household.id:', household?.id)
    console.log('🚀 loadExpenses - household.household_id:', household?.household_id)
    console.log('🚀 loadExpenses - household.user_id:', household?.user_id)
    console.log('🚀 loadExpenses - household.household?.name:', household?.household?.name)
    
    // Debug específico para Lucas
    if (user?.email === 'lucastenaglia@gmail.com') {
      console.log('🔍 DEBUG LUCAS - loadExpenses:')
      console.log('🔍 - household:', household)
      console.log('🔍 - household es null?', household === null)
      console.log('🔍 - household truthy?', !!household)
    }
    
    if (!user) {
      console.log('❌ No hay usuario, retornando')
      return
    }
    
    try {
      console.log('⏳ Iniciando carga de gastos para:', user.email)
      setLoading(true)
      
      // Si está en hogar, cargar TODOS los gastos (hogar + personales de todos)
      if (household) {
        console.log('🏠 HAY HOGAR - Cargando TODOS los gastos del hogar...')
        console.log('🏠 HOGAR - household.household.name:', household.household?.name)
        console.log('🏠 HOGAR - household.household_id:', household.household_id)
        console.log('🏠 HOGAR - Llamando a getExpenses...')
        const data = await getExpenses(user.id)
        console.log('📊 HOGAR - Todos los gastos del hogar obtenidos:', data)
        console.log('📊 HOGAR - Cantidad de gastos:', data ? data.length : 0)
        setExpenses(data)
      } else {
        // Si no hay hogar, cargar solo gastos personales del usuario actual
        console.log('🏠 NO HAY HOGAR - Cargando solo gastos personales del usuario...')
        console.log('🏠 PERSONAL - Llamando a getPersonalExpenses...')
        const personalData = await getPersonalExpenses(user.id)
        console.log('📊 PERSONAL - Gastos personales del usuario obtenidos:', personalData)
        console.log('📊 PERSONAL - Cantidad de gastos personales:', personalData ? personalData.length : 0)
        setExpenses(personalData)
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
      // Determinar si el gasto debe ser personal o del hogar
      const isPersonal = !household
      console.log('🔄 handleAddExpense - isPersonal:', isPersonal)
      console.log('🔄 handleAddExpense - household:', household)
      
      const newExpense = await addExpense(expense, user.id, isPersonal)
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
      console.log('🔄 Hogar actual ANTES:', household)
      console.log('🔄 Hogar actual ANTES - household.id:', household?.id)
      console.log('🔄 Hogar actual ANTES - household.household_id:', household?.household_id)
      
      await leaveHousehold(user.id)
      console.log('✅ leaveHousehold completado')
      
      console.log('🔄 Estableciendo household como null...')
      setHousehold(null)
      console.log('✅ household establecido como null')
      
      // Verificar que el estado se actualizó
      console.log('🔄 Verificando estado después de setHousehold...')
      console.log('🔄 household después de setHousehold:', household)
      
      // NO llamar a loadExpenses aquí - el useEffect se encargará
      console.log('🔄 loadExpenses será llamado por useEffect cuando household cambie')
      
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
      
      const householdInfo = await returnToHousehold(user.id)
      console.log('🏠 householdInfo obtenido:', householdInfo)
      
      setHousehold(householdInfo)
      console.log('✅ household establecido:', householdInfo)
      
      // NO llamar a loadExpenses aquí - el useEffect se encargará
      console.log('🔄 loadExpenses será llamado por useEffect cuando household cambie')
      
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
  
  // Debug temporal para Lucas
  if (user?.email === 'lucastenaglia@gmail.com') {
    console.log('🔍 DEBUG LUCAS:')
    console.log('🔍 - user:', user)
    console.log('🔍 - household:', household)
    console.log('🔍 - expenses:', expenses)
    console.log('🔍 - loading:', loading)
    console.log('🔍 - isFormOpen:', isFormOpen)
  }

  // Helper to get the name of the other household member
  const getOtherHouseholdMemberName = () => {
    if (!household || !household.household || !household.household.members) {
      return 'Sin nombre';
    }
    
    // Buscar el otro miembro (no el usuario actual)
    const otherMember = household.household.members.find(member => 
      member.user_id !== user.id
    );
    
    if (otherMember && otherMember.user) {
      // Solo mostrar el primer nombre (antes del primer espacio)
      const firstName = otherMember.user.name.split(' ')[0];
      return firstName;
    }
    
    // Fallback: si no hay otros miembros, mostrar el nombre del hogar
    return household.household.name || 'Sin nombre';
  };

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
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Panel de gastos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {household ? `Gastos del Hogar: ${getOtherHouseholdMemberName()}` : 'Gastos Personales'}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>+</span>
                <span>Agregar Gasto</span>
              </button>
              <button
                onClick={() => setIsStatsOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Estadísticas</span>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando gastos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumen de gastos - arriba */}
              <div>
                <ExpenseSummary 
                  expenses={expenses} 
                  isPersonal={!household} 
                  householdMembers={household?.household?.members || []}
                />
              </div>
              
              {/* Lista de gastos - abajo */}
              <div>
                <ExpenseList 
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                  onEdit={handleEditExpense}
                  currentUser={user}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {isFormOpen && (
        <ExpenseForm 
          onSubmit={handleAddExpense}
          onClose={() => setIsFormOpen(false)}
          currentUser={user}
          household={household}
          householdMembers={household?.household?.members || []}
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

      {isStatsOpen && (
        <ExpenseStats
          expenses={expenses}
          onClose={() => setIsStatsOpen(false)}
          isOpen={isStatsOpen}
        />
      )}
    </div>
  )
}

export default App 