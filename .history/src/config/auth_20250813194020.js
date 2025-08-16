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
export const createUser = (name, email, password) => {
  // Validar que el email no esté en uso
  const existingUser = AUTH_CONFIG.USERS.find(u => u.email === email)
  
  if (existingUser) {
    return {
      success: false,
      error: 'El email ya está registrado'
    }
  }
  
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
  
  // Crear nuevo usuario
  const newUser = {
    email,
    password,
    name
  }
  
  // Agregar a la lista de usuarios (en producción esto iría a una base de datos)
  AUTH_CONFIG.USERS.push(newUser)
  
  return {
    success: true,
    user: {
      id: Date.now(),
      email: newUser.email,
      name: newUser.name
    }
  }
}
