# 🗄️ Instrucciones para Aplicar el Esquema en Supabase

## 📋 Pasos para configurar la base de datos

### 1. Acceder al Editor SQL de Supabase
1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto "La Colmena"
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"**

### 2. Aplicar el Esquema
1. Copia TODO el contenido del archivo `schema.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en **"Run"** para ejecutar el esquema

### 3. Verificar la Aplicación
Después de ejecutar, deberías ver estas tablas creadas:
- ✅ users
- ✅ user_profiles  
- ✅ families
- ✅ students
- ✅ teachers
- ✅ fraternal_commitments
- ✅ payments
- ✅ monthly_payment_status
- ✅ academic_years
- ✅ classes
- ✅ student_enrollments
- ✅ expenses
- ✅ other_income
- ✅ internal_communications
- ✅ events

### 4. Datos Iniciales
El esquema incluye datos iniciales:
- ✅ Un año académico "2024-2025" activo
- ✅ Un usuario administrador: `admin@lacolmena.edu` (contraseña: `admin123`)

### 5. Configurar Row Level Security (RLS)
Una vez aplicado el esquema, necesitaremos configurar las políticas de seguridad.

## 🔐 Próximos Pasos
1. Aplicar el esquema SQL
2. Configurar políticas RLS
3. Probar la conexión desde el backend
4. Poblar con datos de prueba
5. Implementar los módulos del frontend

## 📞 ¿Necesitas ayuda?
Si encuentras algún error al ejecutar el SQL, compárteme el mensaje de error para poder ayudarte a solucionarlo.


