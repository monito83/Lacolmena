# 📊 Documentación de la Base de Datos - La Colmena

## 🗃️ Estructura de Tablas

### 👥 **user_profiles**
Tabla principal de usuarios del sistema.

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | uuid | ID único del usuario (PK) | `1f441787-bdc0-42bb-9291-c59552474570` |
| `email` | varchar | Email del usuario | `admin@lacolmena.edu` |
| `password_hash` | varchar | Hash de la contraseña | `$2a$10$gh55xqdMW4c6YBL04XaW4...` |
| `role` | varchar | Rol del usuario | `admin`, `teacher`, `secretary` |
| `is_active` | boolean | Estado del usuario | `true` / `false` |

### 👨‍👩‍👧‍👦 **families**
Información de las familias.

### 🎓 **students**
Información de los estudiantes.

### 👨‍🏫 **teachers**
Información de los profesores.

### 💰 **payments**
Registro de pagos.

### 📚 **academic_years**
Años académicos.

### 🏫 **classes**
Clases/grados.

### 📅 **events**
Eventos del colegio.

### 💸 **expenses**
Gastos del colegio.

### 🤝 **fraternal_commitments**
Compromisos fraternos.

### 💬 **internal_communications**
Comunicaciones internas.

### 📊 **monthly_payment_status**
Estado de pagos mensuales.

### 💵 **other_income**
Otros ingresos.

### 📝 **student_enrollments**
Inscripciones de estudiantes.

### 👤 **users**
(Verificar si se usa o si es redundante con user_profiles)

---

## 🔑 Usuarios de Prueba

### Admin
- **Email**: `admin@lacolmena.edu`
- **Rol**: `admin`
- **Estado**: `active`

---

## 📝 Notas Importantes

1. **Tabla principal de usuarios**: `user_profiles` (NO `profiles`)
2. **Autenticación**: Se maneja a través de Supabase Auth
3. **Relaciones**: Verificar foreign keys entre tablas
4. **RLS**: Verificar políticas de Row Level Security

---

## 🔄 Última Actualización

- **Fecha**: 2025-10-16
- **Versión**: 1.0
- **Cambios**: Documentación inicial de estructura
