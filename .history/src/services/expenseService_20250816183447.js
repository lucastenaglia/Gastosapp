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

// Función para compartir un gasto con otro usuario
export const shareExpense = async (expenseId, sharedWithEmail, canEdit = false, canDelete = false) => {
  try {
    console.log('🔄 Intentando compartir gasto:', expenseId, 'con:', sharedWithEmail)
    
    // Buscar el usuario con quien se quiere compartir
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', sharedWithEmail)
      .single()
    
    if (userError || !targetUser) {
      throw new Error('Usuario no encontrado')
    }
    
    // Crear el registro de gasto compartido
    const { data, error } = await supabase
      .from('shared_expenses')
      .insert([{
        expense_id: expenseId,
        shared_with_user_id: targetUser.id,
        shared_by_user_id: targetUser.id, // Esto se corregirá en la llamada
        can_edit: canEdit,
        can_delete: canDelete
      }])
      .select()
    
    if (error) {
      console.error('❌ Error compartiendo gasto:', error)
      throw error
    }
    
    console.log('✅ Gasto compartido exitosamente:', data[0])
    return data[0]
  } catch (error) {
    console.error('❌ Error al compartir gasto:', error)
    throw error
  }
}

// Función para obtener gastos compartidos con el usuario actual
export const getSharedExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos compartidos para usuario ID:', userId)
    
    const { data, error } = await supabase
      .from('shared_expenses')
      .select(`
        *,
        expense:expenses(*),
        shared_by:users!shared_expenses_shared_by_user_id_fkey(id, email, name)
      `)
      .eq('shared_with_user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error obteniendo gastos compartidos:', error)
      throw error
    }
    
    console.log('📊 Gastos compartidos obtenidos:', data)
    return data
  } catch (error) {
    console.error('❌ Error al obtener gastos compartidos:', error)
    return []
  }
}

// Función para obtener todos los gastos (propios + compartidos)
export const getAllExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando todos los gastos para usuario ID:', userId)
    
    // Obtener gastos propios
    const ownExpenses = await getExpenses(userId)
    
    // Obtener gastos compartidos
    const sharedExpenses = await getSharedExpenses(userId)
    
    // Combinar y marcar como compartidos
    const allExpenses = [
      ...ownExpenses.map(expense => ({ ...expense, isShared: false })),
      ...sharedExpenses.map(shared => ({ 
        ...shared.expense, 
        isShared: true, 
        sharedBy: shared.shared_by,
        permissions: {
          canEdit: shared.can_edit,
          canDelete: shared.can_delete
        }
      }))
    ]
    
    // Ordenar por fecha más reciente
    allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    console.log('📊 Todos los gastos obtenidos:', allExpenses.length)
    return allExpenses
  } catch (error) {
    console.error('❌ Error al obtener todos los gastos:', error)
    return []
  }
}

// Función para eliminar un gasto compartido
export const unshareExpense = async (expenseId, sharedWithUserId) => {
  try {
    console.log('🔄 Intentando dejar de compartir gasto:', expenseId, 'con usuario:', sharedWithUserId)
    
    const { error } = await supabase
      .from('shared_expenses')
      .delete()
      .eq('expense_id', expenseId)
      .eq('shared_with_user_id', sharedWithUserId)
    
    if (error) {
      console.error('❌ Error dejando de compartir gasto:', error)
      throw error
    }
    
    console.log('✅ Gasto dejado de compartir exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error al dejar de compartir gasto:', error)
    throw error
  }
} 