import { supabase } from '../lib/supabase'

// Obtener gastos de un usuario específico
export const getExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos para usuario:', userId)
    
    // Obtener TODOS los gastos sin filtro (para diagnosticar)
    console.log('🔄 Obteniendo todos los gastos sin filtro...')
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📊 Resultado completo:', { data, error })
    console.log('📊 Cantidad de gastos:', data ? data.length : 0)
    
    if (error) {
      console.error('❌ Error obteniendo gastos:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No hay gastos en la base de datos')
      return []
    }
    
    // Mostrar información de cada gasto
    console.log('📋 Gastos encontrados:')
    data.forEach((expense, index) => {
      console.log(`  ${index + 1}. ID: ${expense.id}, Descripción: ${expense.description}, user_id: ${expense.user_id}`)
    })
    
    // Filtrar por user_id en el frontend
    const userExpenses = data.filter(expense => expense.user_id === userId)
    console.log(`✅ Filtrado en frontend: ${userExpenses.length} gastos para ${userId}`)
    
    return userExpenses
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto
export const addExpense = async (expense, userId) => {
  try {
    console.log('🔄 Intentando agregar gasto:', expense, 'para usuario:', userId)
    
    // Intentar insertar con user_id
    let insertData = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      person: expense.person,
      date: expense.date,
      user_id: userId
    }
    
    console.log('📝 Datos a insertar:', insertData)
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
    
    if (error) {
      console.error('❌ Error al insertar con user_id:', error)
      
      // Si falla, intentar sin user_id
      console.log('🔄 Intentando sin user_id...')
      delete insertData.user_id
      
      const { data: dataWithoutUserId, error: errorWithoutUserId } = await supabase
        .from('expenses')
        .insert([insertData])
        .select()
      
      if (errorWithoutUserId) {
        console.error('❌ Error al insertar sin user_id:', errorWithoutUserId)
        throw errorWithoutUserId
      }
      
      console.log('✅ Gasto agregado sin user_id:', dataWithoutUserId[0])
      return dataWithoutUserId[0]
    }
    
    console.log('✅ Gasto agregado con user_id:', data[0])
    return data[0]
  } catch (error) {
    console.error('❌ Error al agregar gasto:', error)
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