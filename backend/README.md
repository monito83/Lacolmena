# 🚀 Backend - La Colmena

Sistema de gestión escolar para pedagogía Waldorf con sistema fraterno de aportes.

## 📋 Características

- **Autenticación JWT** con roles (Admin, Maestro, Familia)
- **Sistema Fraterno** de aportes variables
- **API REST** completa con validación
- **Base de datos PostgreSQL** con Prisma ORM
- **Logging** estructurado con Winston
- **Seguridad** con Helmet y Rate Limiting

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tus datos de Supabase
```

3. **Generar cliente de Prisma:**
```bash
npx prisma generate
```

4. **Aplicar migraciones (cuando tengas Supabase configurado):**
```bash
npx prisma db push
```

5. **Ejecutar seed de datos iniciales:**
```bash
npm run db:seed
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Iniciar servidor de producción
npm start
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/logout` - Cerrar sesión

### Familias
- `GET /api/families` - Listar familias
- `GET /api/families/:id` - Obtener familia
- `POST /api/families` - Crear familia
- `PUT /api/families/:id` - Actualizar familia
- `DELETE /api/families/:id` - Desactivar familia

### Estudiantes
- `GET /api/students` - Listar estudiantes
- `GET /api/students/:id` - Obtener estudiante
- `POST /api/students` - Crear estudiante
- `PUT /api/students/:id` - Actualizar estudiante
- `DELETE /api/students/:id` - Desactivar estudiante

### Maestros
- `GET /api/teachers` - Listar maestros
- `GET /api/teachers/:id` - Obtener maestro
- `POST /api/teachers` - Crear maestro
- `PUT /api/teachers/:id` - Actualizar maestro
- `DELETE /api/teachers/:id` - Desactivar maestro

### Financiero
- `GET /api/financial/commitments` - Compromisos fraternos
- `POST /api/financial/commitments` - Crear compromiso
- `GET /api/financial/payments` - Pagos
- `POST /api/financial/payments` - Registrar pago
- `GET /api/financial/expenses` - Gastos
- `POST /api/financial/expenses` - Registrar gasto
- `GET /api/financial/dashboard` - Dashboard financiero

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Gestión de usuarios, familias, estudiantes, maestros
- Acceso a todos los datos financieros

### Maestro
- Acceso a sus estudiantes y clases
- Visualización de información de familias de sus estudiantes
- No puede modificar datos financieros

### Familia
- Acceso solo a sus propios datos
- Visualización de compromisos y pagos
- Registro de pagos

## 📝 Variables de Entorno

```env
# Base de Datos
DATABASE_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# JWT
JWT_SECRET="tu-secret-key"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3500"
```

## 🗄️ Base de Datos

El sistema utiliza PostgreSQL con Prisma ORM. Las tablas principales incluyen:

- **users** - Usuarios del sistema
- **families** - Familias de la escuela
- **students** - Niños y niñas
- **teachers** - Maestros
- **fraternal_commitments** - Compromisos fraternos
- **payments** - Pagos realizados
- **expenses** - Gastos de la escuela

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Generar cliente de Prisma
npx prisma generate

# Ver base de datos en Prisma Studio
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset
```

## 📚 Documentación

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.


