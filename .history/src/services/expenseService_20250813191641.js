import { supabase } from '../lib/supabase'

// Obtener gastos de un usuario específico
export const getExpenses = async (userId) => {
  try {
    // Primero intentar obtener gastos con user_id
    let { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Si no hay gastos con user_id, obtener todos los gastos (para migración)
    if (!data || data.length === 0) {
      console.log('No se encontraron gastos con user_id, obteniendo todos los gastos...')
      const { data: allData, error: allError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (allError) throw allError
      
      // Si hay gastos sin user_id, asignarlos al usuario actual
      if (allData && allData.length > 0) {
        console.log(`Encontrados ${allData.length} gastos sin user_id, asignando a ${userId}`)
        await migrateExpensesToUser(allData, userId)
        data = allData // Retornar los gastos existentes
      }
    }
    
    return data || []
  } catch (error) {
    console.error('Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto
export const addExpense = async (expense, userId) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        person: expense.person,
        date: expense.date,
        user_id: userId
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
export const updateExpense = async (id, expense, userId) => {
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
      .eq('user_id', userId) // Solo permitir actualizar gastos del usuario
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error al actualizar gasto:', error)
    throw error
  }
}

// Eliminar un gasto
export const deleteExpense = async (id, userId) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Solo permitir eliminar gastos del usuario
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error al eliminar gasto:', error)
    throw error
  }
} 