import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://tiarifmkqcayodakifqu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYXJpZm1rcWNheW9kYWtpZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzYxMzcsImV4cCI6MjA2OTgxMjEzN30.qJr6Xvo0UF5_XPq4UWidASjwgjcWPFJ8CqR6mAHSsTU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 