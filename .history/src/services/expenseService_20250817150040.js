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
    
    // Primero verificar si hay gastos sin hogar
    console.log('🔍 Ejecutando consulta para gastos sin hogar...')
    const { data: personalExpenses, error: personalError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .is('household_id', null)
      .order('created_at', { ascending: false })
    
    console.log('📊 Gastos personales (sin hogar):', personalExpenses)
    console.log('❌ Error gastos personales:', personalError)
    console.log('📊 Cantidad de gastos personales:', personalExpenses ? personalExpenses.length : 0)
    
    if (personalError) {
      console.error('❌ Error en consulta personal:', personalError)
      throw personalError
    }
    
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
      console.log('📊 Cantidad total de gastos del usuario:', allUserExpenses ? allUserExpenses.length : 0)
      
      if (allError) {
        console.error('❌ Error en consulta todos los gastos:', allError)
        throw allError
      }
      
      // Si hay gastos con hogar, actualizarlos para que sean personales
      if (allUserExpenses && allUserExpenses.length > 0) {
        console.log('🔄 Actualizando gastos para que sean personales...')
        
        for (const expense of allUserExpenses) {
          if (expense.household_id) {
            console.log(`🔄 Actualizando gasto ${expense.id} de household_id ${expense.household_id} a NULL`)
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
        console.log('📊 Retornando gastos actualizados:', allUserExpenses)
        return allUserExpenses
      }
    }
    
    console.log('📊 Gastos personales obtenidos:', personalExpenses)
    console.log('📊 Cantidad final de gastos personales:', personalExpenses ? personalExpenses.length : 0)
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
    
    // Si está en un hogar, obtener todos los gastos del hogar
    console.log('🏠 getExpenses - Usuario está en hogar, obteniendo gastos del hogar...')
    console.log('🏠 getExpenses - household_id:', householdMember.household_id)
    
    // Obtener gastos del hogar
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('household_id', householdMember.household_id)
      .order('created_at', { ascending: false })
    
    console.log('📊 getExpenses - Gastos del hogar obtenidos:', expensesData)
    console.log('📊 getExpenses - Cantidad de gastos del hogar:', expensesData ? expensesData.length : 0)
    console.log('❌ getExpenses - Error obteniendo gastos del hogar:', expensesError)
    
    if (expensesError) {
      console.error('❌ Error obteniendo gastos del hogar:', expensesError)
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

// Función para verificar si las tablas existen y su estructura
export const verifyTableStructure = async () => {
  try {
    console.log('🔍 Verificando estructura de tablas...')
    
    // Verificar tabla users
    console.log('🔍 Verificando tabla users...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    console.log('✅ Tabla users existe:', !usersError)
    console.log('❌ Error tabla users:', usersError)
    
    // Verificar tabla households
    console.log('🔍 Verificando tabla households...')
    const { data: householdsData, error: householdsError } = await supabase
      .from('households')
      .select('id')
      .limit(1)
    
    console.log('✅ Tabla households existe:', !householdsError)
    console.log('❌ Error tabla households:', householdsError)
    
    // Verificar tabla household_members
    console.log('🔍 Verificando tabla household_members...')
    const { data: membersData, error: membersError } = await supabase
      .from('household_members')
      .select('id')
      .limit(1)
    
    console.log('✅ Tabla household_members existe:', !membersError)
    console.log('❌ Error tabla household_members:', membersError)
    
    // Verificar tabla expenses
    console.log('🔍 Verificando tabla expenses...')
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('id')
      .limit(1)
    
    console.log('✅ Tabla expenses existe:', !expensesError)
    console.log('❌ Error tabla expenses:', expensesError)
    
    return {
      users: !usersError,
      households: !householdsError,
      household_members: !membersError,
      expenses: !expensesError,
      errors: {
        users: usersError,
        households: householdsError,
        household_members: membersError,
        expenses: expensesError
      }
    }
  } catch (error) {
    console.error('❌ Error verificando estructura de tablas:', error)
    return null
  }
}

// Función de debug para verificar el estado del usuario en la base de datos
export const debugUserHouseholdStatus = async (userId) => {
  try {
    console.log('🔍 DEBUG: Verificando estado del usuario en la base de datos')
    console.log('🔍 DEBUG - userId:', userId)
    console.log('🔍 DEBUG - tipo de userId:', typeof userId)
    
    // Primero verificar la estructura de las tablas
    console.log('🔍 Verificando estructura de tablas...')
    const tableStructure = await verifyTableStructure()
    console.log('🔍 Estructura de tablas:', tableStructure)
    
    // Verificar usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('🔍 DEBUG - Usuario en base de datos:', userData)
    console.log('🔍 DEBUG - Error usuario:', userError)
    
    if (userError) {
      console.log('❌ DEBUG - Usuario no encontrado en base de datos')
      return null
    }
    
    // Verificar household_members solo si la tabla existe
    if (tableStructure && tableStructure.household_members) {
      console.log('🔍 Verificando household_members...')
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', userId)
      
      console.log('🔍 DEBUG - Miembros del hogar:', memberData)
      console.log('🔍 DEBUG - Error miembros:', memberError)
      
      // Verificar households
      if (memberData && memberData.length > 0) {
        const householdIds = memberData.map(m => m.household_id)
        console.log('🔍 DEBUG - IDs de hogares:', householdIds)
        
        for (const householdId of householdIds) {
          const { data: householdData, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('id', householdId)
            .single()
          
          console.log(`🔍 DEBUG - Hogar ${householdId}:`, householdData)
          console.log(`🔍 DEBUG - Error hogar ${householdId}:`, householdError)
        }
      }
      
      return {
        user: userData,
        members: memberData,
        error: memberError,
        tableStructure
      }
    } else {
      console.log('❌ DEBUG - Tabla household_members no existe o no es accesible')
      return {
        user: userData,
        members: null,
        error: 'Tabla household_members no disponible',
        tableStructure
      }
    }
  } catch (error) {
    console.error('❌ DEBUG - Error en debugUserHouseholdStatus:', error)
    return null
  }
} 

// Función específica para debuggear el problema de Aldana
export const debugAldanaIssue = async (userId) => {
  try {
    console.log('🔍 DEBUG ALDANA: Iniciando debug específico para Aldana')
    console.log('🔍 DEBUG ALDANA - userId:', userId)
    console.log('🔍 DEBUG ALDANA - tipo de userId:', typeof userId)
    
    // 1. Verificar que el usuario existe
    console.log('🔍 DEBUG ALDANA - Paso 1: Verificando usuario...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()
    
    console.log('🔍 DEBUG ALDANA - Usuario encontrado:', userData)
    console.log('🔍 DEBUG ALDANA - Error usuario:', userError)
    
    if (userError) {
      console.log('❌ DEBUG ALDANA - Usuario no encontrado')
      return { error: 'Usuario no encontrado', details: userError }
    }
    
    // 2. Verificar que la tabla household_members es accesible
    console.log('🔍 DEBUG ALDANA - Paso 2: Verificando tabla household_members...')
    const { data: tableData, error: tableError } = await supabase
      .from('household_members')
      .select('id')
      .limit(1)
    
    console.log('🔍 DEBUG ALDANA - Tabla accesible:', !tableError)
    console.log('🔍 DEBUG ALDANA - Error tabla:', tableError)
    
    if (tableError) {
      console.log('❌ DEBUG ALDANA - Tabla household_members no accesible')
      return { error: 'Tabla no accesible', details: tableError }
    }
    
    // 3. Intentar consulta simple sin filtros
    console.log('🔍 DEBUG ALDANA - Paso 3: Consulta simple sin filtros...')
    const { data: simpleData, error: simpleError } = await supabase
      .from('household_members')
      .select('id, user_id, household_id')
      .limit(5)
    
    console.log('🔍 DEBUG ALDANA - Consulta simple exitosa:', !simpleError)
    console.log('🔍 DEBUG ALDANA - Datos simples:', simpleData)
    console.log('🔍 DEBUG ALDANA - Error consulta simple:', simpleError)
    
    // 4. Intentar consulta con filtro por user_id
    console.log('🔍 DEBUG ALDANA - Paso 4: Consulta con filtro por user_id...')
    const { data: filteredData, error: filteredError } = await supabase
      .from('household_members')
      .select('id, user_id, household_id')
      .eq('user_id', userId)
    
    console.log('🔍 DEBUG ALDANA - Consulta filtrada exitosa:', !filteredError)
    console.log('🔍 DEBUG ALDANA - Datos filtrados:', filteredData)
    console.log('🔍 DEBUG ALDANA - Error consulta filtrada:', filteredError)
    
    // 5. Verificar si hay algún problema con el UUID
    console.log('🔍 DEBUG ALDANA - Paso 5: Verificando formato UUID...')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isValidUUID = uuidRegex.test(userId)
    console.log('🔍 DEBUG ALDANA - UUID válido:', isValidUUID)
    console.log('🔍 DEBUG ALDANA - UUID formato:', userId)
    
    return {
      success: true,
      user: userData,
      tableAccessible: !tableError,
      simpleQuery: { success: !simpleError, data: simpleData, error: simpleError },
      filteredQuery: { success: !filteredError, data: filteredData, error: filteredError },
      uuidValid: isValidUUID,
      summary: {
        userExists: !userError,
        tableAccessible: !tableError,
        simpleQueryWorks: !simpleError,
        filteredQueryWorks: !filteredError,
        uuidValid: isValidUUID
      }
    }
  } catch (error) {
    console.error('❌ DEBUG ALDANA - Error general:', error)
    return { error: 'Error general', details: error }
  }
} 

// Función para verificar si Aldana está realmente en la base de datos
export const verifyAldanaInDatabase = async () => {
  try {
    console.log('🔍 VERIFICANDO ALDANA EN BASE DE DATOS...')
    
    // 1. Verificar si existe el email de Aldana
    console.log('🔍 Paso 1: Verificando email aldanaarloro@gmail.com...')
    const { data: aldanaByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'aldanaarloro@gmail.com')
    
    console.log('🔍 Aldana por email:', aldanaByEmail)
    console.log('🔍 Error por email:', emailError)
    
    if (emailError) {
      console.error('❌ Error buscando Aldana por email:', emailError)
      return { error: 'Error buscando por email', details: emailError }
    }
    
    if (!aldanaByEmail || aldanaByEmail.length === 0) {
      console.log('❌ Aldana no encontrada por email')
      return { error: 'Aldana no encontrada por email' }
    }
    
    const aldanaUser = aldanaByEmail[0]
    console.log('🔍 Aldana encontrada:', aldanaUser)
    console.log('🔍 ID de Aldana:', aldanaUser.id)
    
    // 2. Verificar si Aldana está en household_members
    console.log('🔍 Paso 2: Verificando si Aldana está en household_members...')
    const { data: aldanaMembership, error: membershipError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', aldanaUser.id)
    
    console.log('🔍 Membresía de Aldana:', aldanaMembership)
    console.log('🔍 Error de membresía:', membershipError)
    
    if (membershipError) {
      console.error('❌ Error verificando membresía de Aldana:', membershipError)
      return { 
        error: 'Error verificando membresía', 
        details: membershipError,
        aldanaUser 
      }
    }
    
    // 3. Verificar el hogar de Aldana
    if (aldanaMembership && aldanaMembership.length > 0) {
      console.log('🔍 Paso 3: Verificando hogar de Aldana...')
      const householdId = aldanaMembership[0].household_id
      
      const { data: aldanaHousehold, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
      
      console.log('🔍 Hogar de Aldana:', aldanaHousehold)
      console.log('🔍 Error del hogar:', householdError)
      
      return {
        success: true,
        aldanaUser,
        membership: aldanaMembership,
        household: aldanaHousehold,
        householdError
      }
    } else {
      console.log('❌ Aldana no está en ningún hogar')
      return {
        success: true,
        aldanaUser,
        membership: null,
        household: null
      }
    }
  } catch (error) {
    console.error('❌ Error general verificando Aldana:', error)
    return { error: 'Error general', details: error }
  }
} 

// Función simple para verificar el estado actual de Aldana
export const checkAldanaStatus = async () => {
  try {
    console.log('🔍 CHECK ALDANA STATUS: Iniciando verificación simple...')
    
    // 1. Verificar si hay gastos de Aldana
    console.log('🔍 Paso 1: Verificando gastos de Aldana...')
    const { data: aldanaExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', 'a37db74d-5512-429d-ad47-f58d754a483b')
    
    console.log('🔍 Gastos de Aldana:', aldanaExpenses)
    console.log('🔍 Error gastos:', expensesError)
    console.log('🔍 Cantidad de gastos:', aldanaExpenses ? aldanaExpenses.length : 0)
    
    // 2. Verificar si Aldana existe en users
    console.log('🔍 Paso 2: Verificando si Aldana existe en users...')
    const { data: aldanaUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'a37db74d-5512-429d-ad47-f58d754a483b')
    
    console.log('🔍 Usuario Aldana:', aldanaUser)
    console.log('🔍 Error usuario:', userError)
    
    // 3. Verificar si Aldana está en household_members
    console.log('🔍 Paso 3: Verificando household_members para Aldana...')
    const { data: aldanaMembership, error: membershipError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', 'a37db74d-5512-429d-ad47-f58d754a483b')
    
    console.log('🔍 Membresía de Aldana:', aldanaMembership)
    console.log('🔍 Error membresía:', membershipError)
    
    // 4. Verificar si la tabla household_members es accesible
    console.log('🔍 Paso 4: Verificando acceso a tabla household_members...')
    const { data: tableTest, error: tableError } = await supabase
      .from('household_members')
      .select('id')
      .limit(1)
    
    console.log('🔍 Test tabla household_members:', tableTest)
    console.log('🔍 Error test tabla:', tableError)
    
    return {
      success: true,
      expenses: aldanaExpenses,
      expensesError,
      user: aldanaUser,
      userError,
      membership: aldanaMembership,
      membershipError,
      tableTest,
      tableError,
      summary: {
        hasExpenses: aldanaExpenses && aldanaExpenses.length > 0,
        hasUser: aldanaUser && aldanaUser.length > 0,
        hasMembership: aldanaMembership && aldanaMembership.length > 0,
        tableAccessible: !tableError
      }
    }
  } catch (error) {
    console.error('❌ Error en checkAldanaStatus:', error)
    return { error: 'Error general', details: error }
  }
} 

// Función específica para verificar los gastos del hogar de Aldana
export const checkAldanaHouseholdExpenses = async () => {
  try {
    console.log('🔍 CHECK ALDANA HOUSEHOLD EXPENSES: Iniciando verificación...')
    
    // 1. Obtener el ID de Aldana
    const aldanaEmail = 'aldanaarloro@gmail.com'
    console.log('🔍 Paso 1: Obteniendo ID de Aldana...')
    
    const { data: aldanaUser, error: aldanaError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', aldanaEmail)
      .single()
    
    if (aldanaError || !aldanaUser) {
      console.error('❌ Aldana no encontrada:', aldanaError)
      return { error: 'Aldana no encontrada', details: aldanaError }
    }
    
    console.log('🔍 Aldana encontrada:', aldanaUser)
    const aldanaId = aldanaUser.id
    
    // 2. Verificar si Aldana está en un hogar
    console.log('🔍 Paso 2: Verificando si Aldana está en un hogar...')
    const { data: aldanaMembership, error: membershipError } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', aldanaId)
      .single()
    
    if (membershipError) {
      console.log('❌ Aldana no está en ningún hogar:', membershipError)
      return { error: 'Aldana no está en ningún hogar', details: membershipError }
    }
    
    console.log('🔍 Aldana está en hogar:', aldanaMembership)
    const householdId = aldanaMembership.household_id
    
    // 3. Verificar información del hogar
    console.log('🔍 Paso 3: Verificando información del hogar...')
    const { data: householdInfo, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single()
    
    if (householdError) {
      console.error('❌ Error obteniendo información del hogar:', householdError)
      return { error: 'Error obteniendo hogar', details: householdError }
    }
    
    console.log('🔍 Información del hogar:', householdInfo)
    
    // 4. Obtener todos los gastos del hogar
    console.log('🔍 Paso 4: Obteniendo gastos del hogar...')
    const { data: householdExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
    
    if (expensesError) {
      console.error('❌ Error obteniendo gastos del hogar:', expensesError)
      return { error: 'Error obteniendo gastos', details: expensesError }
    }
    
    console.log('🔍 Gastos del hogar:', householdExpenses)
    console.log('🔍 Cantidad de gastos:', householdExpenses ? householdExpenses.length : 0)
    
    // 5. Verificar si hay gastos de Lucas en el hogar
    const lucasId = '2e85b8e1-63ee-4e50-a079-41d98e674f4d'
    const lucasExpenses = householdExpenses.filter(expense => expense.user_id === lucasId)
    
    console.log('🔍 Gastos de Lucas en el hogar:', lucasExpenses)
    console.log('🔍 Cantidad de gastos de Lucas:', lucasExpenses.length)
    
    return {
      success: true,
      aldana: aldanaUser,
      membership: aldanaMembership,
      household: householdInfo,
      allExpenses: householdExpenses,
      lucasExpenses: lucasExpenses,
      summary: {
        aldanaInHousehold: true,
        householdId: householdId,
        totalExpenses: householdExpenses ? householdExpenses.length : 0,
        lucasExpensesCount: lucasExpenses.length
      }
    }
  } catch (error) {
    console.error('❌ Error en checkAldanaHouseholdExpenses:', error)
    return { error: 'Error general', details: error }
  }
} 