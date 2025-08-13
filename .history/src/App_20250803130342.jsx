import { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import { getExpenses, addExpense, updateExpense, deleteExpense } from './services/expenseService'

function App() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses')
    return savedExpenses ? JSON.parse(savedExpenses) : []
  })

  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      date: new Date().toISOString()
    }
    setExpenses([newExpense, ...expenses])
    setIsFormOpen(false)
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const editExpense = (id, updatedExpense) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddExpense={() => setIsFormOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ExpenseSummary expenses={expenses} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense}
              onEdit={editExpense}
            />
          </div>
          
          <div className="lg:col-span-1">
            {isFormOpen && (
              <ExpenseForm 
                onSubmit={addExpense}
                onCancel={() => setIsFormOpen(false)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 