import { TrendingUp, Calendar, DollarSign, PieChart, User, Car } from 'lucide-react'

const ExpenseSummary = ({ expenses, isPersonal = false, householdMembers = [], onFilterPerson = null, categories = [] }) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear
  })
  
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})
  
  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]
  
  // Función para obtener el nombre de la categoría
  const getCategoryName = (categoryValue) => {
    if (categories.length > 0) {
      const category = categories.find(cat => cat.value === categoryValue)
      return category ? category.label : categoryValue
    }
    return categoryValue
  }
  
     // Estadísticas por persona
    const personTotals = expenses.reduce((acc, expense) => {
      // Los gastos de "Auto" se suman a la persona que los hizo
      const person = expense.person || 'lucas'
      acc[person] = (acc[person] || 0) + expense.amount
      
      // También mantener un registro de gastos por categoría para el ticker de Auto
      if (expense.category === 'auto') {
        acc.auto = (acc.auto || 0) + expense.amount
      }
      
      return acc
    }, {})
   
   // Obtener nombres de usuarios del hogar (solo primer nombre)
   const getUserFirstName = (userId) => {
     const member = householdMembers.find(m => m.user_id === userId)
     if (member && member.user && member.user.name) {
       return member.user.name.split(' ')[0]
     }
     return 'Usuario'
   }
   
   // Mapear nombres antiguos a nombres reales del hogar
   const mapOldNamesToRealNames = (personName) => {
     if (!householdMembers.length) return personName
     
     // Buscar coincidencias por nombre (case insensitive)
     const member = householdMembers.find(member => {
       const memberName = member.user?.name?.toLowerCase() || ''
       const personLower = personName.toLowerCase()
       
       // Mapear nombres antiguos
       if (personLower === 'aldi' && memberName.includes('aldana')) return true
       if (personLower === 'lucas' && memberName.includes('lucas')) return true
       if (personLower === 'ds3' && personName === 'auto') return true
       
       // Mapear nombres exactos
       return memberName === personLower || memberName.includes(personLower)
     })
     
     if (member && member.user?.name) {
       return member.user.name.toLowerCase()
     }
     
     return personName
   }
   
   // Calcular totales por usuario real con mapeo de nombres antiguos
   const userTotals = {}
   householdMembers.forEach(member => {
     const firstName = getUserFirstName(member.user_id)
     const realName = member.user?.name?.toLowerCase() || firstName.toLowerCase()
     
     // Sumar gastos del nombre real + nombres mapeados
     let total = 0
     
     // Gastos con el nombre real
     total += personTotals[realName] || 0
     
     // Gastos con nombres antiguos mapeados
     if (realName.includes('aldana')) {
       total += personTotals['aldi'] || 0
     }
     if (realName.includes('lucas')) {
       total += personTotals['lucas'] || 0
       // Los gastos de "ds3" (auto antiguo) se asignan a Lucas
       total += personTotals['ds3'] || 0
     }
     
     userTotals[firstName] = total
   })
   
   // Los gastos de "Auto" ahora se suman a la persona que los hizo
   // Y también se muestran en el ticker de "Auto" para análisis por categoría
  
  const formatCurrency = (amount) => {
    return `$${Math.round(amount).toLocaleString('es-ES')}`
  }

  return (
    <div className="space-y-4">
      {/* Primera fila - Estadísticas generales */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total General */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total General</p>
            <div className="flex items-center justify-between">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Este Mes</p>
            <div className="flex items-center justify-between">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {formatCurrency(monthlyTotal)}
              </p>
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Total de Gastos */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Gastos</p>
            <div className="flex items-end sm:items-center justify-between">
              <p className="text-2xl sm:text-lg lg:text-xl font-bold text-gray-900">
                {expenses.length}
              </p>
              <div className="bg-purple-100 p-2 rounded-lg mt-4 sm:mt-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Categoría Principal */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Categoría Principal</p>
            <div className="flex items-end sm:items-center justify-between">
              <div className="flex-1">
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {topCategory ? getCategoryName(topCategory[0]) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {topCategory ? formatCurrency(topCategory[1]) : ''}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila - Estadísticas por persona (solo en modo hogar) */}
      {!isPersonal && (
        <>
          {/* Fila única con todos los elementos - 2 usuarios + Auto */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Primer usuario */}
            {householdMembers.slice(0, 1).map((member, index) => {
              const firstName = member.user?.name?.split(' ')[0] || 'Usuario'
              const realName = member.user?.name?.toLowerCase() || firstName.toLowerCase()
              const total = userTotals[firstName] || 0
              const colors = ['bg-blue-100']
              
              return (
                <div 
                  key={member.user_id} 
                  className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                  onClick={() => onFilterPerson && onFilterPerson(realName)}
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{firstName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                        </p>
                      </div>
                      <div className={`${colors[index]} p-2 rounded-lg mt-4 sm:mt-0`}>
                        <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Segundo usuario */}
            {householdMembers.slice(1, 2).map((member, index) => {
              const firstName = member.user?.name?.split(' ')[0] || 'Usuario'
              const realName = member.user?.name?.toLowerCase() || firstName.toLowerCase()
              const total = userTotals[firstName] || 0
              const colors = ['bg-green-100']
              
              return (
                <div 
                  key={member.user_id} 
                  className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                  onClick={() => onFilterPerson && onFilterPerson(realName)}
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{firstName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                        </p>
                      </div>
                      <div className={`${colors[index]} p-2 rounded-lg mt2 sm:mt-0`}>
                        <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Ticker de Auto (si existe) */}
            {(personTotals.auto && personTotals.auto > 0) && (
              <div 
                className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer col-span-2 lg:col-span-1"
                onClick={() => onFilterPerson && onFilterPerson('auto')}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Auto</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(personTotals.auto)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {totalExpenses > 0 ? `${((personTotals.auto / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                      </p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-lg mt-2 sm:mt-0">
                      <Car className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tercer usuario (si existe) */}
            {householdMembers.length > 2 && (
              <div 
                className="bg-white p-3 sm:p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer col-span-2 lg:col-span-1"
                onClick={() => onFilterPerson && onFilterPerson(householdMembers[2].user?.name?.toLowerCase() || 'usuario3')}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {householdMembers[2].user?.name?.split(' ')[0] || 'Usuario3'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(userTotals[householdMembers[2].user?.name?.split(' ')[0]] || 0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {totalExpenses > 0 ? `${(((userTotals[householdMembers[2].user?.name?.split(' ')[0]] || 0) / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-lg mt-2 sm:mt-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ExpenseSummary 