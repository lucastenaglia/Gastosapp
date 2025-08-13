import { supabase } from '../lib/supabase'

// Obtener todos los gastos
export const getExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto
export const addExpense = async (expense) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        person: expense.person,
        date: expense.date
      }])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error al agregar gasto:', error)
    throw error
  }
}

// Actualizar un gasto
export const updateExpense = async (id, expense) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        person: expense.person,
        date: expense.date
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error al actualizar gasto:', error)
    throw error
  }
}

// Eliminar un gasto
export const deleteExpense = async (id) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error al eliminar gasto:', error)
    throw error
  }
} 