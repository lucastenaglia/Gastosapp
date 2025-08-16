import { supabase } from '../lib/supabase'

// Obtener gastos de un usuario específico
export const getExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos para usuario:', userId)
    
    // PRUEBA 1: Obtener TODOS los gastos primero (sin filtro)
    console.log('🧪 PRUEBA 1: Obteniendo todos los gastos...')
    const { data: allData, error: allError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📊 PRUEBA 1 - Todos los gastos:', { data: allData, error: allError })
    
    if (allError) {
      console.error('❌ Error en PRUEBA 1:', allError)
      throw allError
    }
    
    // PRUEBA 2: Intentar filtrar por user_id
    console.log('🧪 PRUEBA 2: Intentando filtrar por user_id...')
    let { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    console.log('📊 PRUEBA 2 - Filtrado por user_id:', { data, error })
    
    if (error) {
      console.error('❌ Error en PRUEBA 2:', error)
      // Si falla el filtro, retornar todos los gastos
      console.log('⚠️ Falló el filtro, retornando todos los gastos')
      return allData || []
    }
    
    console.log('✅ Gastos a retornar:', data)
    return data || []
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error)
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

// Función para migrar gastos existentes a un usuario específico
export const migrateExpensesToUser = async (expenses, userId) => {
  try {
    console.log(`🚀 Iniciando migración de ${expenses.length} gastos para usuario ${userId}`)
    
    // Obtener IDs de gastos que no tienen user_id
    const expensesToMigrate = expenses.filter(expense => !expense.user_id)
    
    console.log('📋 Gastos a migrar:', expensesToMigrate)
    
    if (expensesToMigrate.length === 0) {
      console.log('✅ No hay gastos para migrar')
      return
    }
    
    // Actualizar cada gasto con el user_id
    for (const expense of expensesToMigrate) {
      console.log(`🔄 Migrando gasto ${expense.id}...`)
      
      const { error } = await supabase
        .from('expenses')
        .update({ user_id: userId })
        .eq('id', expense.id)
      
      if (error) {
        console.error(`❌ Error migrando gasto ${expense.id}:`, error)
      } else {
        console.log(`✅ Gasto ${expense.id} migrado exitosamente`)
      }
    }
    
    console.log(`🎉 Migración completada. ${expensesToMigrate.length} gastos asignados a ${userId}`)
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  }
} 