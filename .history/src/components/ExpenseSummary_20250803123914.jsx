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
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total General */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total General</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Gastos del Mes */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Este Mes</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(monthlyTotal)}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total de Gastos */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Gastos</p>
            <p className="text-2xl font-bold text-gray-900">
              {expenses.length}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Categoría Principal */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Categoría Principal</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {topCategory ? topCategory[0] : 'N/A'}
            </p>
            {topCategory && (
              <p className="text-sm text-gray-600">
                {formatCurrency(topCategory[1])}
              </p>
            )}
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <PieChart className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseSummary 