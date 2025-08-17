import { supabase } from '../lib/supabase'

// Salir temporalmente del hogar (no eliminar membresía)
export const leaveHousehold = async (userId) => {
  try {
    console.log('🔄 Usuario saliendo temporalmente del hogar:', userId)
    
    // No eliminamos la membresía, solo la ocultamos temporalmente
    // El usuario puede volver al hogar cuando quiera
    console.log('✅ Usuario salió temporalmente del hogar')
    return true
  } catch (error) {
    console.error('❌ Error al salir del hogar:', error)
    throw error
  }
}

// Volver al hogar existente
export const returnToHousehold = async (userId) => {
  try {
    console.log('🔄 Usuario volviendo al hogar:', userId)
    
    // Verificar que el usuario tenga un hogar
    const householdInfo = await getUserHousehold(userId)
    if (!householdInfo) {
      throw new Error('No tienes un hogar configurado')
    }
    
    console.log('✅ Usuario volvió al hogar:', householdInfo.household.name)
    return householdInfo
  } catch (error) {
    console.error('❌ Error al volver al hogar:', error)
    throw error
  }
}

// Unirse a un hogar existente por email del propietario
export const joinHouseholdByEmail = async (userId, ownerEmail) => {
  try {
    console.log('🔄 Intentando unirse a hogar por email del propietario:', ownerEmail)
    
    // Buscar el usuario propietario
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', ownerEmail)
      .single()
    
    if (ownerError || !owner) {
      throw new Error('Usuario no encontrado')
    }
    
    // Buscar el hogar del propietario
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select(`
        *,
        household:households(*)
      `)
      .eq('user_id', owner.id)
      .single()
    
    if (memberError || !householdMember) {
      throw new Error('Este usuario no tiene un hogar configurado')
    }
    
    // Verificar si ya estás en este hogar
    const { data: existingMember, error: checkError } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', householdMember.household_id)
      .eq('user_id', userId)
      .single()
    
    if (existingMember) {
      throw new Error('Ya eres miembro de este hogar')
    }
    
    // Unirse al hogar
    const { error: joinError } = await supabase
      .from('household_members')
      .insert([{
        household_id: householdMember.household_id,
        user_id: userId,
        role: 'member'
      }])
    
    if (joinError) throw joinError
    
    console.log('✅ Usuario se unió al hogar:', householdMember.household.name)
    return {
      householdId: householdMember.household_id,
      householdName: householdMember.household.name
    }
  } catch (error) {
    console.error('❌ Error al unirse al hogar por email:', error)
    throw error
  }
}

// Obtener gastos de un usuario específico (modo personal)
export const getPersonalExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos personales para usuario ID:', userId)
    
    // Primero verificar si hay gastos sin hogar
    const { data: personalExpenses, error: personalError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .is('household_id', null)
      .order('created_at', { ascending: false })
    
    console.log('📊 Gastos personales (sin hogar):', personalExpenses)
    console.log('❌ Error gastos personales:', personalError)
    
    if (personalError) throw personalError
    
    // Si no hay gastos sin hogar, buscar todos los gastos del usuario
    if (!personalExpenses || personalExpenses.length === 0) {
      console.log('⚠️ No hay gastos personales, buscando todos los gastos del usuario...')
      
      const { data: allUserExpenses, error: allError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      console.log('📊 Todos los gastos del usuario:', allUserExpenses)
      console.log('❌ Error todos los gastos:', allError)
      
      if (allError) throw allError
      
      // Si hay gastos con hogar, actualizarlos para que sean personales
      if (allUserExpenses && allUserExpenses.length > 0) {
        console.log('🔄 Actualizando gastos para que sean personales...')
        
        for (const expense of allUserExpenses) {
          if (expense.household_id) {
            const { error: updateError } = await supabase
              .from('expenses')
              .update({ household_id: null })
              .eq('id', expense.id)
            
            if (updateError) {
              console.error(`❌ Error actualizando gasto ${expense.id}:`, updateError)
            } else {
              console.log(`✅ Gasto ${expense.id} actualizado a personal`)
            }
          }
        }
        
        // Retornar los gastos actualizados
        return allUserExpenses
      }
    }
    
    console.log('📊 Gastos personales obtenidos:', personalExpenses)
    return personalExpenses || []
  } catch (error) {
    console.error('❌ Error al obtener gastos personales:', error)
    return []
  }
}

// Obtener gastos de un hogar específico
export const getExpenses = async (userId) => {
  try {
    console.log('🔍 Buscando gastos para usuario ID:', userId)
    
    // Primero obtener el hogar del usuario
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single()
    
    console.log('🏠 Información del hogar:', householdMember)
    console.log('❌ Error obteniendo hogar:', memberError)
    
    if (memberError) {
      console.log('⚠️ Usuario no está en ningún hogar, mostrando gastos personales')
      // Si no está en un hogar, mostrar solo gastos personales
      return await getPersonalExpenses(userId)
    }
    
    // Si está en un hogar, obtener todos los gastos del hogar
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        user:users(id, email, name)
      `)
      .eq('household_id', householdMember.household_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    console.log('📊 Gastos del hogar obtenidos:', data)
    return data || []
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto al hogar
export const addExpense = async (expense, userId) => {
  try {
    console.log('🔄 Intentando agregar gasto:', expense, 'para usuario ID:', userId)
    
    // Obtener el hogar del usuario
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single()
    
    if (memberError) {
      // Si no está en un hogar, crear gasto personal
      const insertData = {
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        user_id: userId,
        person: expense.person
      }
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([insertData])
        .select()
      
      if (error) throw error
      return data[0]
    }
    
    // Si está en un hogar, agregar gasto al hogar
    const insertData = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      user_id: userId,
      household_id: householdMember.household_id,
      person: expense.person
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
    
    if (error) throw error
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
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error al eliminar gasto:', error)
    throw error
  }
}

// Crear o unirse a un hogar
export const createOrJoinHousehold = async (userId, householdName) => {
  try {
    console.log('🔄 Creando o uniéndose a hogar:', householdName)
    
    // Verificar si ya existe un hogar con ese nombre
    const { data: existingHousehold, error: checkError } = await supabase
      .from('households')
      .select('id')
      .eq('name', householdName)
      .single()
    
    let householdId
    
    if (existingHousehold) {
      // Unirse al hogar existente
      householdId = existingHousehold.id
      console.log('✅ Uniéndose a hogar existente:', householdId)
    } else {
      // Crear nuevo hogar
      const { data: newHousehold, error: createError } = await supabase
        .from('households')
        .insert([{
          name: householdName,
          created_by: userId
        }])
        .select()
      
      if (createError) throw createError
      householdId = newHousehold[0].id
      console.log('✅ Nuevo hogar creado:', householdId)
    }
    
    // Agregar usuario al hogar
    const { error: memberError } = await supabase
      .from('household_members')
      .insert([{
        household_id: householdId,
        user_id: userId,
        role: 'owner'
      }])
    
    if (memberError) throw memberError
    
    return { householdId, householdName }
  } catch (error) {
    console.error('❌ Error al crear/unirse a hogar:', error)
    throw error
  }
}

// Obtener información del hogar del usuario
export const getUserHousehold = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('household_members')
      .select(`
        *,
        household:households(*)
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) return null
    return data
  } catch (error) {
    console.error('❌ Error al obtener hogar del usuario:', error)
    return null
  }
}

// Obtener miembros del hogar
export const getHouseholdMembers = async (householdId) => {
  try {
    const { data, error } = await supabase
      .from('household_members')
      .select(`
        *,
        user:users(id, email, name)
      `)
      .eq('household_id', householdId)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('❌ Error al obtener miembros del hogar:', error)
    return []
  }
} 