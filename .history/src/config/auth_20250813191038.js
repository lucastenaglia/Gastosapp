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
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  
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
