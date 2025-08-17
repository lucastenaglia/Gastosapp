import { useState } from 'react'
import { X, PieChart } from 'lucide-react'

const ExpenseStats = ({ expenses, onClose, isOpen }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  if (!isOpen) return null

  // Calcular totales por categoría
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'otros'
    acc[category] = (acc[category] || 0) + expense.amount
    return acc
  }, {})

  // Ordenar categorías por total
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Colores para las categorías con mejor contraste
  const categoryColors = {
    comida: '#E74C3C',      // Rojo intenso
    super: '#3498DB',       // Azul brillante
    auto: '#2ECC71',        // Verde esmeralda
    entretenimiento: '#9B59B6', // Púrpura
    salud: '#F39C12',       // Naranja
    ropa: '#E67E22',        // Naranja rojizo
    hogar: '#1ABC9C',       // Verde azulado
    otros: '#34495E'        // Gris azulado oscuro
  }

  const formatCurrency = (amount) => {
    return `$${Math.round(amount).toLocaleString('en-US')}`
  }

  const formatPercentage = (amount) => {
    return totalExpenses > 0 ? `${((amount / totalExpenses) * 100).toFixed(1)}%` : '0%'
  }

  // Calcular ángulos para el gráfico de torta
  const calculateAngles = () => {
    let currentAngle = 0
    return sortedCategories.map(([category, amount]) => {
      const percentage = amount / totalExpenses
      const startAngle = currentAngle
      const endAngle = currentAngle + (percentage * 360)
      currentAngle = endAngle
      
      return {
        category,
        amount,
        percentage,
        startAngle,
        endAngle
      }
    })
  }

  const pieData = calculateAngles()

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              <span>Estadísticas de Gastos</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de torta */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Distribución por Categoría</h3>
              <div className="relative w-64 h-64">
                <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
                  {pieData.map((slice, index) => {
                    const radius = 100
                    const centerX = 128
                    const centerY = 128
                    
                    const startAngleRad = (slice.startAngle * Math.PI) / 180
                    const endAngleRad = (slice.endAngle * Math.PI) / 180
                    
                    const x1 = centerX + radius * Math.cos(startAngleRad)
                    const y1 = centerY + radius * Math.sin(startAngleRad)
                    const x2 = centerX + radius * Math.cos(endAngleRad)
                    const y2 = centerY + radius * Math.sin(endAngleRad)
                    
                    const largeArcFlag = slice.endAngle - slice.startAngle <= 180 ? 0 : 1
                    
                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ')
                    
                    return (
                      <path
                        key={slice.category}
                        d={pathData}
                        fill={categoryColors[slice.category] || '#F7DC6F'}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedCategory(slice.category)}
                      />
                    )
                  })}
                </svg>
                
                {/* Información del centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>

            {/* Lista de categorías */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Detalle por Categoría</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sortedCategories.map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100
                  const isSelected = selectedCategory === category
                  
                  return (
                    <div
                      key={category}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: categoryColors[category] || '#F7DC6F' }}
                          />
                          <div>
                            <div className="font-medium text-gray-800 capitalize">
                              {category}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatPercentage(amount)} del total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: categoryColors[category] || '#F7DC6F'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Resumen general */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Resumen General</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Gastos:</span>
                <div className="font-medium">{expenses.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Categorías:</span>
                <div className="font-medium">{sortedCategories.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Promedio:</span>
                <div className="font-medium">{formatCurrency(totalExpenses / expenses.length || 0)}</div>
              </div>
              <div>
                <span className="text-gray-600">Mayor Categoría:</span>
                <div className="font-medium capitalize">{sortedCategories[0]?.[0] || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseStats
