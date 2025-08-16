import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (usar variables de entorno de Vite si existen)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tiarifmkqcayodakifqu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYXJpZm1rcWNheW9kYWtpZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzYxMzcsImV4cCI6MjA2OTgxMjEzN30.qJr6Xvo0UF5_XPq4UWidASjwgjcWPFJ8CqR6mAHSsTU'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase: usando credenciales por defecto del repositorio. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local para apuntar a tu propio proyecto.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)