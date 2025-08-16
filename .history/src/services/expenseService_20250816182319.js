import { supabase } from '../lib/supabase'

// Obtener gastos de un usuario específico
export const getExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos para usuario ID:', userId)
    
    // Obtener solo los gastos del usuario
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
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
    
    return data
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto
export const addExpense = async (expense, userId) => {
  try {
    console.log('🔄 Intentando agregar gasto:', expense, 'para usuario ID:', userId)
    
    // Crear objeto de datos básico (solo campos que sabemos que existen)
    let insertData = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      user_id: userId
    }
    
    // Agregar campos opcionales solo si existen en la tabla
    if (expense.person) {
      insertData.person = expense.person
    }
    
    console.log('📝 Datos a insertar (básicos):', insertData)
    
    // Intentar insertar con datos básicos
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
    
    if (error) {
      console.error('❌ Error al insertar gasto:', error)
      
      // Mostrar información detallada del error
      if (error.code === '42703') {
        console.error('🔍 Error 42703: Columna no existe. Verificar estructura de la tabla.')
      }
      
      throw error
    }
    
    console.log('✅ Gasto agregado exitosamente:', data[0])
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
    console.log(`🚀 Iniciando migración de ${expenses.length} gastos para usuario ID ${userId}`)
    
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