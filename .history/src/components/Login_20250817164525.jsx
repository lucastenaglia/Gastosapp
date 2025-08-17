import { useState } from 'react'
import { validateCredentials, createUser } from '../config/auth'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🔐 Login - Iniciando autenticación...')
      console.log('🔐 Login - Email:', email)
      console.log('🔐 Login - Password:', password)
      console.log('🔐 Login - Action:', isRegistering ? 'register' : 'login')
      
      let result
      
      if (isRegistering) {
        console.log('🔐 Login - Intentando registro...')
        result = await createUser(name, email, password)
        console.log('🔐 Login - Resultado registro:', result)
      } else {
        console.log('🔐 Login - Intentando login...')
        result = await validateCredentials(email, password)
        console.log('🔐 Login - Resultado login:', result)
      }
      
      console.log('🔐 Login - Resultado completo:', result)
      console.log('🔐 Login - Resultado success:', result?.success)
      console.log('🔐 Login - Resultado user:', result?.user)
      
      if (result && result.success && result.user && result.user.id) {
        console.log('🔐 Login - Usuario válido, guardando en localStorage...')
        console.log('🔐 Login - Usuario a guardar:', result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        onLogin(result.user)
      } else {
        console.error('❌ Login - Usuario inválido o sin id')
        console.error('❌ Login - Resultado recibido:', result)
        console.error('❌ Login - Estructura del resultado:', {
          hasResult: !!result,
          hasSuccess: !!result?.success,
          hasUser: !!result?.user,
          hasUserId: !!result?.user?.id,
          userId: result?.user?.id
        })
        setError('Error en la autenticación - Usuario inválido')
      }
    } catch (err) {
      console.error('❌ Login - Error en autenticación:', err)
      setError(err.message || 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
        </div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">

          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h1>
              {error && (
                <div className={`mt-2 p-3 rounded text-sm ${
                  error.includes('exitosamente') 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  {error}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {isRegistering && (
                  <div className="relative">
                    <input 
                      autoComplete="off" 
                      id="name" 
                      name="name" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600" 
                      placeholder="Nombre completo" 
                    />
                    <label htmlFor="name" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                      Nombre completo
                    </label>
                  </div>
                )}
                <div className="relative">
                  <input 
                    autoComplete="off" 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600" 
                    placeholder="Email address" 
                  />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                    Email Address
                  </label>
                </div>
                <div className="relative">
                  <input 
                    autoComplete="off" 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600" 
                    placeholder="Password" 
                  />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-cyan-500 text-white rounded-md px-2 py-1 hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading 
                      ? (isRegistering ? 'Creando...' : 'Iniciando...') 
                      : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')
                    }
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Botones para alternar entre login y registro */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-4">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            </div>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError('')
                setName('')
                setEmail('')
                setPassword('')
              }}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              {isRegistering ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </div>

          {/* Información de credenciales de ejemplo */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Credenciales de ejemplo:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> lucas@example.com</p>
              <p><strong>Password:</strong> 123456</p>
              <p><strong>O:</strong> aldi@example.com / 123456</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
