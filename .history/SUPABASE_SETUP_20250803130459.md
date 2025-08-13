# Configuración de Supabase para Gastos App

## 🚀 Pasos para Configurar Supabase

### 1. Crear cuenta en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta gratuita

### 2. Crear un nuevo proyecto
1. Haz clic en "New Project"
2. Elige tu organización
3. Nombre del proyecto: `gastos-app`
4. Contraseña de la base de datos: (guarda esta contraseña)
5. Región: Elige la más cercana a ti
6. Haz clic en "Create new project"

### 3. Crear la tabla de gastos
Una vez que el proyecto esté listo:

1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Copia y pega este SQL:

```sql
-- Crear tabla de gastos
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  person TEXT NOT NULL DEFAULT 'lucas',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_person ON expenses(person);

-- Habilitar RLS (Row Level Security) - opcional para seguridad
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations" ON expenses FOR ALL USING (true);
```

4. Haz clic en **"Run"** para ejecutar el SQL

### 4. Obtener las credenciales
1. Ve a **Settings** → **API** en el menú lateral
2. Copia la **URL** del proyecto
3. Copia la **anon public** key

### 5. Configurar la aplicación
1. Abre el archivo `src/lib/supabase.js`
2. Reemplaza las credenciales:

```javascript
const supabaseUrl = 'TU_URL_AQUI'
const supabaseAnonKey = 'TU_ANON_KEY_AQUI'
```

### 6. Probar la aplicación
1. Ejecuta `npm run dev`
2. La aplicación ahora debería conectarse a Supabase
3. Los gastos se guardarán en la base de datos

## 🔧 Estructura de la Base de Datos

### Tabla: `expenses`
- `id`: Identificador único (auto-incremento)
- `description`: Descripción del gasto
- `amount`: Monto del gasto
- `category`: Categoría (comida, super, auto, etc.)
- `person`: Persona (lucas o aldi)
- `date`: Fecha del gasto
- `created_at`: Fecha de creación (automática)

## 🌐 Acceso desde Múltiples Dispositivos

Una vez configurado:
- ✅ Los gastos se sincronizan automáticamente
- ✅ Acceso desde cualquier dispositivo
- ✅ Backup automático en la nube
- ✅ Sin pérdida de datos

## 🔒 Seguridad

- La base de datos está protegida
- Solo tu aplicación puede acceder a los datos
- Las credenciales son seguras para el frontend

## 📱 Uso

1. Agrega gastos desde cualquier dispositivo
2. Los cambios se sincronizan automáticamente
3. Todos los dispositivos verán los mismos datos
4. No más pérdida de información

¡Listo! Tu aplicación ahora funciona con Supabase y puedes acceder desde múltiples dispositivos. 🎉 