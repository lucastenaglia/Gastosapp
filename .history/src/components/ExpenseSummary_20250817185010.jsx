import { TrendingUp, Calendar, DollarSign, PieChart } from 'lucide-react'

const ExpenseSummary = ({ expenses, isPersonal = false, householdMembers = [], onFilterPerson = null }) => {
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
  
     // Estadísticas por persona
   const personTotals = expenses.reduce((acc, expense) => {
     // Si la categoría es "auto", asignar a "auto", sino usar la persona seleccionada
     const person = expense.category === 'auto' ? 'auto' : (expense.person || 'lucas')
     acc[person] = (acc[person] || 0) + expense.amount
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
     }
     
     userTotals[firstName] = total
   })
   
   // Total de Auto (categoría auto + ds3)
   const autoTotal = (personTotals.auto || 0) + (personTotals.ds3 || 0)
  
  const formatCurrency = (amount) => {
    return `$${Math.round(amount).toLocaleString('en-US')}`
  }

  return (
    <div className="space-y-4">
      {/* Primera fila - Estadísticas generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total General</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Este Mes</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(monthlyTotal)}
              </p>
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Total de Gastos */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Gastos</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900">
                {expenses.length}
              </p>
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Categoría Principal */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Categoría Principal</p>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {topCategory ? formatCurrency(topCategory[1]) : ''}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <PieChart className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila - Estadísticas por persona (solo en modo hogar) */}
      {!isPersonal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Usuarios del hogar (máximo 2) */}
          {householdMembers.slice(0, 2).map((member, index) => {
            const firstName = member.user?.name?.split(' ')[0] || 'Usuario'
            const total = userTotals[firstName] || 0
            const colors = ['bg-blue-100', 'bg-green-100']
            const icons = ['👤', '👤']
            
            return (
              <div 
                key={member.user_id} 
                className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                onClick={() => onFilterPerson && onFilterPerson(member.user?.name?.toLowerCase() || 'usuario')}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{firstName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                      </p>
                    </div>
                    <div className={`${colors[index]} p-2 rounded-lg`}>
                      <span className="text-blue-600 text-lg">{icons[index]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Auto */}
          <div 
            className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => onFilterPerson && onFilterPerson('auto')}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Auto</p>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(autoTotal)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {totalExpenses > 0 ? `${((autoTotal / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                  </p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <span className="text-red-600 text-lg">🚗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseSummary 