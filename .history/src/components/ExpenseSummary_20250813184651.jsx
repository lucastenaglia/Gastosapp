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
    <div className="space-y-4 sm:space-y-6">
            {/* Primera fila - Estadísticas generales */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-6">
                 {/* Total General */}
          <div className="card relative p-4 sm:p-6 lg:col-span-2">
           <div className="space-y-3">
             <p className="text-xs sm:text-sm font-medium text-gray-600">Total General</p>
             <div className="flex items-center justify-between">
               <div className="flex-1">
                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                   {formatCurrency(totalExpenses)}
                 </p>
               </div>
               <div className="bg-blue-100 p-2 sm:p-2.5 lg:p-3 rounded-lg shadow-lg ml-4">
                 <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
               </div>
             </div>
           </div>
         </div>

                 {/* Gastos del Mes */}
         <div className="card relative p-4 sm:p-6 lg:col-span-2">
           <div className="space-y-3">
             <p className="text-xs sm:text-sm font-medium text-gray-600">Este Mes</p>
             <div className="flex items-center justify-between">
               <div className="flex-1">
                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                   {formatCurrency(monthlyTotal)}
                 </p>
               </div>
               <div className="bg-green-100 p-2 sm:p-2.5 lg:p-3 rounded-lg shadow-lg ml-4">
                 <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
               </div>
             </div>
           </div>
         </div>

                 {/* Total de Gastos */}
         <div className="card relative p-4 sm:p-6 lg:col-span-1">
           <div className="space-y-3">
             <p className="text-xs sm:text-sm font-medium text-gray-600">Total Gastos</p>
             <div className="flex items-center justify-between">
                 <div className="flex-1">
                  <p className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-900">
                   {expenses.length}
                 </p>
               </div>
                                 <div className="bg-purple-100 p-2 sm:p-2.5 lg:p-3 rounded-lg shadow-lg ml-4">
                 <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
               </div>
             </div>
           </div>
         </div>

                 {/* Categoría Principal */}
         <div className="card relative p-4 sm:p-6">
           <div className="space-y-3">
             <p className="text-xs sm:text-sm font-medium text-gray-600">Categoría Principal</p>
             <div className="flex items-center justify-between">
               <div className="flex-1">
                  <p className="text-base sm:text-lg lg:text-base font-semibold text-gray-900 capitalize">
                   {topCategory ? topCategory[0] : 'N/A'}
                 </p>
                 {topCategory && (
                   <p className="text-xs sm:text-sm text-gray-600">
                     {formatCurrency(topCategory[1])}
                   </p>
                 )}
               </div>
                                 <div className="bg-orange-100 p-2 sm:p-2.5 lg:p-3 rounded-lg shadow-lg ml-4">
                 <PieChart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
               </div>
             </div>
           </div>
         </div>
      </div>

                    {/* Segunda fila - Estadísticas por persona */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                 {/* Gastos de Lucas */}
         <div className="card relative p-4 sm:p-6">
           <div>
             <p className="text-xs sm:text-sm font-medium text-gray-600">👨 Lucas</p>
             <div className="flex items-end justify-between">
               <div>
                 <p className="text-lg sm:text-2xl font-bold text-gray-900">
                   {formatCurrency(lucasTotal)}
                 </p>
                 <p className="text-xs sm:text-sm text-gray-600">
                   {totalExpenses > 0 ? `${((lucasTotal / totalExpenses) * 100).toFixed(1)}%` : '0%'} del total
                 </p>
               </div>
               <div className="bg-blue-100 p-2 sm:p-3 rounded-lg shadow-lg">
                 <span className="text-lg sm:text-2xl">👨</span>
               </div>
             </div>
           </div>
         </div>

                 {/* Gastos de Aldi */}
         <div className="card relative p-4 sm:p-6">
           <div>
             <p className="text-xs sm:text-sm font-medium text-gray-600">👩 Aldi</p>
             <div className="flex items-end justify-between">
               <div>
                 <p className="text-lg sm:text-2xl font-bold text-gray-900">
                   {formatCurrency(aldiTotal)}
                 </p>
                 <p className="text-xs sm:text-sm text-gray-600">
                   {totalExpenses > 0 ? `${((aldiTotal / totalExpenses) * 100).toFixed(1)}%` : '0%'} del total
                 </p>
               </div>
               <div className="bg-pink-100 p-2 sm:p-3 rounded-lg shadow-lg">
                 <span className="text-lg sm:text-2xl">👩</span>
               </div>
             </div>
           </div>
         </div>

                 {/* Gastos de DS3 (Auto) */}
         <div className="card relative p-4 sm:p-6">
           <div>
             <p className="text-xs sm:text-sm font-medium text-gray-600">🚗 DS3</p>
             <div className="flex items-end justify-between">
               <div>
                 <p className="text-lg sm:text-2xl font-bold text-gray-900">
                   {formatCurrency(ds3Total)}
                 </p>
                 <p className="text-xs sm:text-sm text-gray-600">
                   {totalExpenses > 0 ? `${((ds3Total / totalExpenses) * 100).toFixed(1)}%` : '0%'} del total
                 </p>
               </div>
               <div className="bg-gray-100 p-2 sm:p-3 rounded-lg shadow-lg">
                 <span className="text-lg sm:text-2xl">🚗</span>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  )
}

export default ExpenseSummary 