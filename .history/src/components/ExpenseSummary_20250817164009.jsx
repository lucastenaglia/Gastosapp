import { TrendingUp, Calendar, DollarSign, PieChart } from 'lucide-react'

const ExpenseSummary = ({ expenses }) => {
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
     // Si la categoría es "auto", asignar a "ds3", sino usar la persona seleccionada
     const person = expense.category === 'auto' ? 'ds3' : (expense.person || 'lucas')
     acc[person] = (acc[person] || 0) + expense.amount
     return acc
   }, {})
   
   const lucasTotal = personTotals.lucas || 0
   const aldiTotal = personTotals.aldi || 0
   const ds3Total = personTotals.ds3 || 0
  
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

      {/* Segunda fila - Estadísticas por persona */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lucas */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Lucas</p>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(lucasTotal)}
                </p>
                <p className="text-sm text-gray-600">
                  {totalExpenses > 0 ? `${((lucasTotal / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-blue-600 text-lg">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aldi */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Aldi</p>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(aldiTotal)}
                </p>
                <p className="text-sm text-gray-600">
                  {totalExpenses > 0 ? `${((aldiTotal / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600 text-lg">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* DS3 */}
        <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">DS3</p>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(ds3Total)}
                </p>
                <p className="text-sm text-gray-600">
                  {totalExpenses > 0 ? `${((ds3Total / totalExpenses) * 100).toFixed(1)}% del total` : '0% del total'}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <span className="text-red-600 text-lg">🚗</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseSummary 