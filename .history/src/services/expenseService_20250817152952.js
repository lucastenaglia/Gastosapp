import { supabase } from '../lib/supabase'

// Salir temporalmente del hogar (no eliminar membresía)
export const leaveHousehold = async (userId) => {
  try {
    console.log('🔄 leaveHousehold iniciado para userId:', userId)
    
    // Verificar que el usuario esté en un hogar
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (memberError || !householdMember) {
      console.log('⚠️ Usuario no está en ningún hogar')
      return true // Ya no está en hogar
    }
    
    // Obtener información del hogar por separado
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdMember.household_id)
      .single()
    
    if (householdError) {
      console.error('❌ Error obteniendo información del hogar:', householdError)
      throw householdError
    }
    
    console.log('🏠 Usuario saliendo del hogar:', householdData.name)
    
    // No eliminamos la membresía, solo la ocultamos temporalmente
    // El usuario puede volver al hogar cuando quiera
    console.log('✅ Usuario salió temporalmente del hogar')
    return true
  } catch (error) {
    console.error('❌ Error al salir del hogar:', error)
    throw error
  }
}

// Salir completamente del hogar (eliminar membresía)
export const leaveHouseholdPermanently = async (userId) => {
  try {
    console.log('🔄 leaveHouseholdPermanently iniciado para userId:', userId)
    
    // Verificar que el usuario esté en un hogar
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (memberError || !householdMember) {
      console.log('⚠️ Usuario no está en ningún hogar')
      return true // Ya no está en hogar
    }
    
    // Obtener información del hogar por separado
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdMember.household_id)
      .single()
    
    if (householdError) {
      console.error('❌ Error obteniendo información del hogar:', householdError)
      throw householdError
    }
    
    console.log('🏠 Usuario saliendo permanentemente del hogar:', householdData.name)
    
    // Eliminar la membresía del hogar
    const { error: deleteError } = await supabase
      .from('household_members')
      .delete()
      .eq('user_id', userId)
      .eq('household_id', householdMember.household_id)
    
    if (deleteError) {
      console.error('❌ Error eliminando membresía:', deleteError)
      throw deleteError
    }
    
    console.log('✅ Usuario salió permanentemente del hogar')
    return true
  } catch (error) {
    console.error('❌ Error al salir permanentemente del hogar:', error)
    throw error
  }
}

// Volver al hogar existente
export const returnToHousehold = async (userId) => {
  try {
    console.log('🔄 returnToHousehold iniciado para userId:', userId)
    console.log('🔄 returnToHousehold - tipo de userId:', typeof userId)
    
    // Verificar que el usuario tenga un hogar
    console.log('🔄 Llamando a getUserHousehold...')
    const householdInfo = await getUserHousehold(userId)
    console.log('🏠 returnToHousehold - householdInfo recibido:', householdInfo)
    
    if (!householdInfo) {
      console.error('❌ Usuario no tiene hogar configurado - householdInfo es null')
      throw new Error('No tienes un hogar configurado')
    }
    
    console.log('✅ Usuario volvió al hogar:', householdInfo.household.name)
    console.log('✅ Datos completos del hogar:', householdInfo)
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
      .select('*')
      .eq('user_id', owner.id)
      .single()
    
    if (memberError || !householdMember) {
      throw new Error('Este usuario no tiene un hogar configurado')
    }
    
    // Obtener información del hogar por separado
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdMember.household_id)
      .single()
    
    if (householdError) {
      throw new Error('Error obteniendo información del hogar')
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
    
    console.log('✅ Usuario se unió al hogar:', householdData.name)
    return {
      householdId: householdMember.household_id,
      householdName: householdData.name
    }
  } catch (error) {
    console.error('❌ Error al unirse al hogar por email:', error)
    throw error
  }
}

// Invitar a un usuario al hogar por email (agregar automáticamente)
export const inviteUserToHousehold = async (userId, invitedUserEmail) => {
  try {
    console.log('🔄 Invitando usuario al hogar:', invitedUserEmail)
    
    // Buscar el usuario que está siendo invitado
    const { data: invitedUser, error: invitedUserError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', invitedUserEmail)
      .single()
    
    if (invitedUserError || !invitedUser) {
      throw new Error('Usuario no encontrado. Debe registrarse primero en la aplicación.')
    }
    
    console.log('👤 Usuario invitado encontrado:', invitedUser)
    
    // Buscar el hogar del usuario que está invitando
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (memberError || !householdMember) {
      throw new Error('No tienes un hogar configurado')
    }
    
    // Obtener información del hogar por separado
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdMember.household_id)
      .single()
    
    if (householdError) {
      throw new Error('Error obteniendo información del hogar')
    }
    
    console.log('🏠 Hogar del invitador:', householdData.name)
    
    // Verificar si el usuario ya está en este hogar
    const { data: existingMember, error: checkError } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', householdMember.household_id)
      .eq('user_id', invitedUser.id)
      .single()
    
    if (existingMember) {
      throw new Error('Este usuario ya es miembro del hogar')
    }
    
    // Agregar al usuario invitado al hogar
    const { error: joinError } = await supabase
      .from('household_members')
      .insert([{
        household_id: householdMember.household_id,
        user_id: invitedUser.id,
        role: 'member'
      }])
    
    if (joinError) throw joinError
    
    console.log('✅ Usuario invitado exitosamente al hogar:', invitedUser.email)
    return {
      success: true,
      message: `${invitedUser.name} (${invitedUser.email}) ha sido invitado al hogar "${householdData.name}"`,
      householdName: householdData.name
    }
  } catch (error) {
    console.error('❌ Error al invitar usuario al hogar:', error)
    throw error
  }
}

// Obtener gastos de un usuario específico (modo personal)
export const getPersonalExpenses = async (userId) => {
  try {
    console.log('🔍 getPersonalExpenses iniciado para userId:', userId)
    console.log('🔍 getPersonalExpenses - tipo de userId:', typeof userId)
    console.log('🔍 getPersonalExpenses - userId exacto:', JSON.stringify(userId))
    
    // SOLO obtener gastos del usuario actual que NO tengan household_id
    // Esto es independiente de si el usuario es miembro de un hogar o no
    console.log('🔍 Ejecutando consulta para gastos personales del usuario actual...')
    console.log('🔍 Query: SELECT * FROM expenses WHERE user_id =', userId, 'AND household_id IS NULL')
    
    const { data: personalExpenses, error: personalError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)  // Solo gastos del usuario actual
      .is('household_id', null)  // Solo gastos sin hogar
      .order('created_at', { ascending: false })
    
    console.log('📊 getPersonalExpenses - Gastos personales obtenidos:', personalExpenses)
    console.log('❌ getPersonalExpenses - Error gastos personales:', personalError)
    console.log('📊 getPersonalExpenses - Cantidad de gastos personales:', personalExpenses ? personalExpenses.length : 0)
    
    // Debug detallado de cada gasto
    if (personalExpenses && personalExpenses.length > 0) {
      console.log('🔍 DEBUG DETALLADO DE GASTOS:')
      personalExpenses.forEach((expense, index) => {
        console.log(`🔍 Gasto ${index + 1}:`, {
          id: expense.id,
          description: expense.description,
          user_id: expense.user_id,
          household_id: expense.household_id,
          person: expense.person,
          amount: expense.amount
        })
      })
    }
    
    if (personalError) {
      console.error('❌ Error en consulta personal:', personalError)
      throw personalError
    }
    
    console.log('📊 getPersonalExpenses - Gastos personales finales a retornar:', personalExpenses)
    return personalExpenses || []
  } catch (error) {
    console.error('❌ Error al obtener gastos personales:', error)
    return []
  }
}

// Obtener gastos de un hogar específico
export const getExpenses = async (userId) => {
  try {
    console.log('🔍 getExpenses iniciado para userId:', userId)
    console.log('🔍 getExpenses - tipo de userId:', typeof userId)
    console.log('🔍 getExpenses - userId exacto:', JSON.stringify(userId))
    
    // Primero obtener el hogar del usuario
    console.log('🔍 getExpenses - Buscando hogar del usuario...')
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single()
    
    console.log('🏠 getExpenses - Información del hogar:', householdMember)
    console.log('❌ getExpenses - Error obteniendo hogar:', memberError)
    console.log('❌ getExpenses - Error code:', memberError?.code)
    console.log('❌ getExpenses - Error message:', memberError?.message)
    
    if (memberError) {
      if (memberError.code === 'PGRST116') {
        console.log('⚠️ Usuario no está en ningún hogar (PGRST116), mostrando gastos personales')
      } else {
        console.log('⚠️ Error obteniendo hogar:', memberError.code, memberError.message)
      }
      console.log('🔄 Llamando a getPersonalExpenses...')
      // Si no está en un hogar, mostrar solo gastos personales
      const personalExpenses = await getPersonalExpenses(userId)
      console.log('📊 getPersonalExpenses retornó:', personalExpenses)
      return personalExpenses
    }
    
    // Si está en un hogar, obtener TODOS los gastos (hogar + personales de todos los miembros)
    console.log('🏠 getExpenses - Usuario está en hogar, obteniendo TODOS los gastos...')
    console.log('🏠 getExpenses - household_id:', householdMember.household_id)
    
    // Obtener todos los miembros del hogar
    const { data: householdMembers, error: membersError } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdMember.household_id)
    
    if (membersError) {
      console.error('❌ Error obteniendo miembros del hogar:', membersError)
      throw membersError
    }
    
    const memberUserIds = householdMembers.map(m => m.user_id)
    console.log('👥 getExpenses - IDs de miembros del hogar:', memberUserIds)
    
    // Obtener TODOS los gastos de los miembros del hogar (con y sin household_id)
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .in('user_id', memberUserIds)
      .order('created_at', { ascending: false })
    
    console.log('📊 getExpenses - TODOS los gastos obtenidos:', expensesData)
    console.log('📊 getExpenses - Cantidad total de gastos:', expensesData ? expensesData.length : 0)
    console.log('❌ getExpenses - Error obteniendo gastos:', expensesError)
    
    if (expensesError) {
      console.error('❌ Error obteniendo gastos:', expensesError)
      throw expensesError
    }
    
    // Obtener información de usuarios por separado si es necesario
    if (expensesData && expensesData.length > 0) {
      const userIds = [...new Set(expensesData.map(e => e.user_id))]
      console.log('🔍 getExpenses - Obteniendo información de usuarios:', userIds)
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds)
      
      if (usersError) {
        console.error('❌ Error obteniendo usuarios:', usersError)
      } else {
        // Crear un mapa de usuarios para acceso rápido
        const usersMap = {}
        usersData.forEach(user => {
          usersMap[user.id] = user
        })
        
        console.log('🔍 getExpenses - Mapa de usuarios creado:', usersMap)
        
        // Agregar información del usuario a cada gasto
        expensesData.forEach(expense => {
          expense.user = usersMap[expense.user_id]
        })
        
        console.log('🔍 getExpenses - Gastos con información de usuarios:', expensesData)
      }
    }
    
    console.log('📊 getExpenses - Gastos finales a retornar:', expensesData)
    return expensesData || []
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error)
    return []
  }
}

// Agregar un nuevo gasto al hogar
export const addExpense = async (expense, userId) => {
  try {
    console.log('🔄 addExpense iniciado para expense:', expense)
    console.log('🔄 addExpense - userId:', userId)
    
    // Obtener el hogar del usuario
    const { data: householdMember, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single()
    
    console.log('🏠 addExpense - householdMember:', householdMember)
    console.log('❌ addExpense - memberError:', memberError)
    
    if (memberError) {
      console.log('⚠️ Usuario no está en hogar, creando gasto personal')
      // Si no está en un hogar, crear gasto personal
      const insertData = {
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        user_id: userId,
        person: expense.person
      }
      
      console.log('📝 Insertando gasto personal:', insertData)
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([insertData])
        .select()
      
      if (error) throw error
      console.log('✅ Gasto personal creado:', data[0])
      return data[0]
    }
    
    // Si está en un hogar, agregar gasto al hogar
    console.log('🏠 Usuario está en hogar, agregando gasto al hogar')
    const insertData = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      user_id: userId,
      household_id: householdMember.household_id,
      person: expense.person
    }
    
    console.log('📝 Insertando gasto del hogar:', insertData)
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
    
    if (error) throw error
    console.log('✅ Gasto del hogar creado:', data[0])
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
export const createOrJoinHousehold = async (userId, householdName, invitedEmails = []) => {
  try {
    console.log('🔄 Creando o uniéndose a hogar:', householdName)
    console.log('🔄 Usuarios a invitar:', invitedEmails)
    
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
    
    // Invitar usuarios adicionales si se especificaron
    if (invitedEmails && invitedEmails.length > 0) {
      console.log('🔄 Invitando usuarios adicionales al hogar...')
      
      for (const email of invitedEmails) {
        try {
          // Buscar el usuario por email
          const { data: invitedUser, error: userError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email.trim())
            .single()
          
          if (userError || !invitedUser) {
            console.log(`⚠️ Usuario no encontrado: ${email}`)
            continue
          }
          
          // Verificar si ya está en este hogar
          const { data: existingMember, error: checkError } = await supabase
            .from('household_members')
            .select('id')
            .eq('household_id', householdId)
            .eq('user_id', invitedUser.id)
            .single()
          
          if (existingMember) {
            console.log(`⚠️ Usuario ya está en el hogar: ${email}`)
            continue
          }
          
          // Agregar al usuario invitado al hogar
          const { error: inviteError } = await supabase
            .from('household_members')
            .insert([{
              household_id: householdId,
              user_id: invitedUser.id,
              role: 'member'
            }])
          
          if (inviteError) {
            console.error(`❌ Error invitando a ${email}:`, inviteError)
          } else {
            console.log(`✅ Usuario invitado exitosamente: ${email}`)
          }
        } catch (error) {
          console.error(`❌ Error procesando invitación para ${email}:`, error)
        }
      }
    }
    
    return { householdId, householdName }
  } catch (error) {
    console.error('❌ Error al crear/unirse a hogar:', error)
    throw error
  }
}

// Obtener información del hogar del usuario
export const getUserHousehold = async (userId) => {
  try {
    console.log('🔍 getUserHousehold iniciado para userId:', userId)
    console.log('🔍 getUserHousehold - tipo de userId:', typeof userId)
    console.log('🔍 getUserHousehold - userId exacto:', JSON.stringify(userId))
    
    // Verificar que el userId no esté vacío o sea inválido
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('❌ userId inválido:', userId)
      return null
    }
    
    // Verificar que el usuario existe primero
    console.log('🔍 Verificando que el usuario existe...')
    const { data: userCheck, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()
    
    console.log('👤 Verificación de usuario:', userCheck)
    console.log('❌ Error verificación usuario:', userError)
    
    if (userError) {
      console.error('❌ Error verificando usuario:', userError)
      return null
    }
    
    console.log('🔍 Buscando hogar para usuario:', userCheck.email)
    
    // Hacer la consulta paso a paso para debug
    console.log('🔍 Ejecutando consulta household_members...')
    console.log('🔍 Query: SELECT * FROM household_members WHERE user_id =', userId)
    
    // Verificar que la tabla household_members existe antes de consultar
    console.log('🔍 Verificando existencia de tabla household_members...')
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('household_members')
        .select('id')
        .limit(1)
      
      console.log('🔍 Verificación de tabla household_members:', tableCheck)
      console.log('❌ Error verificación tabla:', tableError)
      
      if (tableError) {
        console.error('❌ Tabla household_members no accesible:', tableError)
        return null
      }
    } catch (tableCheckError) {
      console.error('❌ Error verificando tabla household_members:', tableCheckError)
      return null
    }
    
    // Intentar consulta simple primero para ver si funciona
    console.log('🔍 Probando consulta simple sin filtros...')
    try {
      const { data: simpleCheck, error: simpleError } = await supabase
        .from('household_members')
        .select('id, user_id')
        .limit(5)
      
      console.log('🔍 Consulta simple exitosa:', !simpleError)
      console.log('🔍 Datos de consulta simple:', simpleCheck)
      console.log('🔍 Error de consulta simple:', simpleError)
      
      if (simpleError) {
        console.error('❌ Consulta simple falló:', simpleError)
        return null
      }
    } catch (simpleCheckError) {
      console.error('❌ Error en consulta simple:', simpleCheckError)
      return null
    }
    
    // Primero obtener la membresía del hogar
    console.log('🔍 Ejecutando consulta principal...')
    const { data: memberData, error: memberError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    console.log('🏠 getUserHousehold - memberData:', memberData)
    console.log('🏠 getUserHousehold - memberError:', memberError)
    console.log('🏠 getUserHousehold - memberError code:', memberError?.code)
    console.log('🏠 getUserHousehold - memberError message:', memberError?.message)
    
    if (memberError) {
      if (memberError.code === 'PGRST116') {
        console.log('⚠️ Usuario no está en ningún hogar (PGRST116)')
        return null
      }
      console.error('❌ Error en getUserHousehold:', memberError)
      return null
    }
    
    // Si hay membresía, obtener la información del hogar
    if (memberData) {
      console.log('🔍 Obteniendo información del hogar...')
      console.log('🔍 household_id encontrado:', memberData.household_id)
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', memberData.household_id)
        .single()
      
      console.log('🏠 getUserHousehold - householdData:', householdData)
      console.log('🏠 getUserHousehold - householdError:', householdError)
      
      if (householdError) {
        console.error('❌ Error obteniendo información del hogar:', householdError)
        return null
      }
      
      // Construir el objeto de respuesta
      const result = {
        ...memberData,
        household: householdData
      }
      
      console.log('✅ Usuario está en hogar:', result.household?.name)
      console.log('✅ Datos del hogar:', result)
      return result
    }
    
    return null
  } catch (error) {
    console.error('❌ Error al obtener hogar del usuario:', error)
    console.error('❌ Error completo:', JSON.stringify(error))
    return null
  }
}

// Obtener miembros del hogar
export const getHouseholdMembers = async (householdId) => {
  try {
    // Obtener miembros del hogar
    const { data: membersData, error: membersError } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', householdId)
    
    if (membersError) throw membersError
    
    // Obtener información de usuarios por separado
    if (membersData && membersData.length > 0) {
      const userIds = membersData.map(m => m.user_id)
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds)
      
      if (!usersError && usersData) {
        // Crear un mapa de usuarios para acceso rápido
        const usersMap = {}
        usersData.forEach(user => {
          usersMap[user.id] = user
        })
        
        // Agregar información del usuario a cada miembro
        membersData.forEach(member => {
          member.user = usersMap[member.user_id]
        })
      }
    }
    
    return membersData || []
  } catch (error) {
    console.error('❌ Error al obtener miembros del hogar:', error)
    return []
  }
} 