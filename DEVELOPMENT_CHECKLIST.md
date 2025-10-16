# 📋 Checklist de Desarrollo - Sistema La Colmena

## ✅ Antes de hacer commit de cualquier módulo:

### 🔍 **Verificación TypeScript**
- [ ] **No hay funciones no utilizadas** - Eliminar todas las funciones que no se usan
- [ ] **No hay imports no utilizados** - Solo importar lo que realmente se usa
- [ ] **No hay variables no utilizadas** - Prefijar con `_` si son parámetros necesarios
- [ ] **Verificar tipos** - Todos los tipos deben estar correctamente definidos

### 🧹 **Limpieza de código**
- [ ] **Eliminar console.log** - Solo dejar los necesarios para debugging
- [ ] **Comentarios útiles** - Solo comentarios que agreguen valor
- [ ] **Código muerto** - Eliminar todo código comentado o no usado

### 🎨 **Consistencia de diseño**
- [ ] **Colores Waldorf** - Usar la paleta `oklch()` definida
- [ ] **Terminología correcta** - "Maestros" no "Docentes", "Niños" no "Estudiantes"
- [ ] **Iconos apropiados** - Usar iconos de `lucide-react` que existan
- [ ] **Responsive design** - Verificar en móvil y desktop

### 🔗 **Integración**
- [ ] **API routes** - Verificar que las rutas coincidan con el frontend
- [ ] **Variables de entorno** - Usar `import.meta.env.VITE_API_URL`
- [ ] **Tokens de autenticación** - Usar `authToken` consistentemente
- [ ] **Navegación** - Agregar rutas en App.tsx y Layout.tsx

### 🧪 **Testing**
- [ ] **Build exitoso** - `npm run build` debe pasar sin errores
- [ ] **Linting limpio** - No warnings ni errores de linting
- [ ] **Funcionalidad básica** - CRUD operations funcionan
- [ ] **Manejo de errores** - Errores manejados graciosamente

---

## 🚨 **Errores comunes a evitar:**

### ❌ **TypeScript**
```typescript
// MAL - Función no usada
const formatDate = (date: string) => { ... }; // ❌ Error TS6133

// BIEN - Solo funciones que se usan
const calculateAge = (birthDate: string) => { ... }; // ✅ Se usa en el JSX
```

### ❌ **Imports**
```typescript
// MAL - Imports no usados
import { BookOpen, Heart, Calendar } from 'lucide-react'; // ❌ BookOpen y Heart no se usan

// BIEN - Solo imports necesarios
import { Calendar, Users } from 'lucide-react'; // ✅ Solo los que se usan
```

### ❌ **Variables**
```typescript
// MAL - Parámetro no usado
const handleClick = (event, unusedParam) => { ... }; // ❌ Error TS6133

// BIEN - Prefijar con _
const handleClick = (event, _unusedParam) => { ... }; // ✅ Prefijo _ indica intencional
```

---

## 📝 **Plantilla para nuevos módulos:**

### 1. **API Route** (`/api/modulo/index.ts`)
```typescript
// ✅ CRUD completo
// ✅ Manejo de errores
// ✅ CORS headers
// ✅ Validación de datos
```

### 2. **Componente React** (`/modules/modulo/ModuloModule.tsx`)
```typescript
// ✅ Interfaz TypeScript definida
// ✅ Solo imports necesarios
// ✅ Solo funciones utilizadas
// ✅ Manejo de estados (loading, error)
```

### 3. **Navegación**
```typescript
// ✅ Agregar en Layout.tsx
// ✅ Agregar en App.tsx
// ✅ Usar iconos existentes
```

---

## 🔄 **Proceso recomendado:**

1. **Crear API route** → Test con Postman/curl
2. **Crear componente** → Solo funcionalidad básica
3. **Agregar navegación** → Rutas y links
4. **Verificar TypeScript** → `npm run build`
5. **Limpieza final** → Eliminar código no usado
6. **Commit y push** → Con mensaje descriptivo

---

## 📚 **Referencias:**

- **Colores Waldorf**: Usar `oklch()` con tonos suaves
- **Iconos**: Solo de `lucide-react`, verificar que existan
- **Terminología**: Consultar con usuario antes de usar términos técnicos
- **API**: Usar variables de entorno, no hardcodear URLs

---

**Última actualización**: 2025-10-16
**Versión**: 1.0
