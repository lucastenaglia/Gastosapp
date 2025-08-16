// Configuración de autenticación
export const AUTH_CONFIG = {
  // Credenciales de ejemplo para desarrollo
  // En producción, esto debería venir de una base de datos o servicio de autenticación
  USERS: [
    {
      email: 'lucas@example.com',
      password: '123456',
      name: 'Lucas'
    },
    {
      email: 'aldi@example.com', 
      password: '123456',
      name: 'Aldi'
    }
  ],
  
  // Configuración de Google OAuth (opcional)
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Tiempo de expiración del token (en milisegundos)
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
}

// Función para validar credenciales
export const validateCredentials = (email, password) => {
  const user = AUTH_CONFIG.USERS.find(u => 
    u.email === email && u.password === password
  )
  
  if (user) {
    return {
      success: true,
      user: {
        id: Date.now(),
        email: user.email,
        name: user.name
      }
    }
  }
  
  return {
    success: false,
    error: 'Credenciales inválidas'
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
    
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error verificando usuario existente:', checkError)
      return {
        success: false,
        error: 'Error al verificar usuario existente'
      }
    }
    
    if (existingUser) {
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
      return {
        success: false,
        error: 'Error al crear usuario'
      }
    }
    
    // También agregar a la lista local para compatibilidad
    AUTH_CONFIG.USERS.push({
      email,
      password,
      name
    })
    
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
