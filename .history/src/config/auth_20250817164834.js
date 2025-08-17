// Configuración de autenticación
export const AUTH_CONFIG = {
  // Configuración de Google OAuth (opcional)
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Tiempo de expiración del token (en milisegundos)
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
}

// Función para validar credenciales
export const validateCredentials = async (email, password) => {
  try {
    // Importar supabase dinámicamente
    const { supabase } = await import('../lib/supabase')
    
    // Buscar usuario en Supabase (tolerante a múltiples/ningún resultado)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .eq('password', password)
      .limit(1)
    
    if (error) {
      console.error('Error en login:', error)
      // Diagnóstico más claro para el dev
      let message = error.message || 'Credenciales inválidas'
      if (error.code === '42P01') message = 'Tabla users no existe en Supabase'
      if (error.code === '42501' || error.code === 'PGRST301') message = 'Permisos insuficientes en tabla users (RLS)'
      return { success: false, error: message }
    }
    
    const user = Array.isArray(data) && data.length > 0 ? data[0] : null
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }
    
    return {
      success: false,
      error: 'Credenciales inválidas'
    }
  } catch (error) {
    console.error('Error en validateCredentials:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Función para crear nuevos usuarios
export const createUser = async (name, email, password) => {
  try {
    // Validar campos requeridos
    if (!name || !email || !password) {
      return {
        success: false,
        error: 'Todos los campos son requeridos'
      }
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Formato de email inválido'
      }
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      }
    }
    
    // Importar supabase dinámicamente para evitar dependencias circulares
    const { supabase } = await import('../lib/supabase')
    
    // Verificar si el usuario ya existe (sin .single para evitar errores por 0 o >1 filas)
    const { data: existingData, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (checkError) {
      console.error('Error verificando usuario existente:', checkError)
      let message = checkError.message || 'Error al verificar usuario existente'
      if (checkError.code === '42P01') message = 'Tabla users no existe en Supabase'
      if (checkError.code === '42501' || checkError.code === 'PGRST301') message = 'Permisos insuficientes en tabla users (RLS)'
      return { success: false, error: message }
    }
    
    const exists = Array.isArray(existingData) && existingData.length > 0
    if (exists) {
      return {
        success: false,
        error: 'El email ya está registrado'
      }
    }
    
    // Crear nuevo usuario en Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email,
        password,
        name
      }])
      .select()
    
    if (insertError) {
      console.error('Error creando usuario:', insertError)
      let message = insertError.message || 'Error al crear usuario'
      if (insertError.code === '42P01') message = 'Tabla users no existe en Supabase'
      if (insertError.code === '23505') message = 'El email ya está registrado'
      if (insertError.code === '42501' || insertError.code === 'PGRST301') message = 'Permisos insuficientes en tabla users (RLS)'
      return { success: false, error: message }
    }
    
    // También agregar a la lista local para compatibilidad
    // AUTH_CONFIG.USERS.push({
    //   email,
    //   password,
    //   name
    // })
    
    return {
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name
      }
    }
  } catch (error) {
    console.error('Error en createUser:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}
