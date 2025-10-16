# 🗄️ Configuración de Base de Datos - La Colmena

## 📋 **Resumen del Esquema**

### **Entidades Principales:**
- **👥 Familias**: Cada familia puede tener múltiples niños
- **👶 Estudiantes**: Niños y niñas de la escuela
- **👨‍🏫 Maestros**: Personal docente
- **💰 Sistema Fraterno**: Compromisos y pagos variables
- **📚 Gestión Académica**: Años académicos, clases, inscripciones
- **💸 Gestión Financiera**: Gastos e ingresos
- **📢 Comunicaciones**: Internas y eventos

## 🔑 **Características del Sistema Fraterno**

### **Compromisos Fraternos (`fraternal_commitments`)**
- Monto acordado por familia
- Monto sugerido para equilibrio
- Frecuencia de pago (mensual, trimestral, anual)
- Estados: activo, suspendido, modificado, finalizado
- Fechas de revisión

### **Pagos (`payments`)**
- Registro detallado de cada pago
- Referencia a compromiso fraterno
- Método de pago
- Mes pagado
- Quién registró el pago

### **Estado Mensual (`monthly_payment_status`)**
- Control mensual por familia
- Monto esperado vs pagado
- Estados: pendiente, parcial, completo, excedido

## 🚀 **Configuración en Supabase**

### **1. Crear Proyecto**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Iniciar sesión
supabase login

# Crear proyecto
supabase projects create la-colmena-gestion
```

### **2. Aplicar Esquema**
```sql
-- Ejecutar el archivo schema.sql en el SQL Editor de Supabase
-- O usar migraciones:
supabase db push
```

### **3. Configurar Row Level Security (RLS)**

#### **Políticas para Familias:**
```sql
-- Las familias solo pueden ver sus propios datos
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Familias pueden ver solo sus datos" ON families
    FOR SELECT USING (
        id IN (
            SELECT family_id FROM students 
            WHERE user_id = auth.uid()
        )
    );
```

#### **Políticas para Maestros:**
```sql
-- Los maestros pueden ver datos de sus estudiantes
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maestros pueden ver sus estudiantes" ON students
    FOR SELECT USING (
        id IN (
            SELECT se.student_id 
            FROM student_enrollments se
            JOIN classes c ON se.class_id = c.id
            WHERE c.teacher_id IN (
                SELECT id FROM teachers WHERE user_id = auth.uid()
            )
        )
    );
```

#### **Políticas para Administradores:**
```sql
-- Los administradores pueden ver todo
CREATE POLICY "Admins pueden ver todo" ON families
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### **4. Configurar Funciones de Servidor**

#### **Función para Calcular Estado Financiero:**
```sql
CREATE OR REPLACE FUNCTION get_family_financial_status(family_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_expected', COALESCE(SUM(fc.agreed_amount), 0),
        'total_paid', COALESCE(SUM(p.amount), 0),
        'pending_amount', COALESCE(SUM(fc.agreed_amount), 0) - COALESCE(SUM(p.amount), 0),
        'monthly_status', (
            SELECT json_agg(
                json_build_object(
                    'year', mps.year,
                    'month', mps.month,
                    'expected', mps.expected_amount,
                    'paid', mps.paid_amount,
                    'status', mps.status
                )
            )
            FROM monthly_payment_status mps
            WHERE mps.family_id = family_uuid
            ORDER BY mps.year, mps.month
        )
    ) INTO result
    FROM fraternal_commitments fc
    LEFT JOIN payments p ON fc.family_id = p.family_id
    WHERE fc.family_id = family_uuid
    AND fc.status = 'activo';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 **Vistas Útiles**

### **Vista de Dashboard Principal:**
```sql
CREATE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM families WHERE is_active = true) as total_families,
    (SELECT COUNT(*) FROM students WHERE is_active = true) as total_students,
    (SELECT COUNT(*) FROM teachers WHERE is_active = true) as total_teachers,
    (SELECT COALESCE(SUM(agreed_amount), 0) FROM fraternal_commitments WHERE status = 'activo') as total_expected_income,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)) as current_month_income,
    (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= DATE_TRUNC('month', CURRENT_DATE)) as current_month_expenses;
```

### **Vista de Estado de Pagos por Familia:**
```sql
CREATE VIEW family_payment_status AS
SELECT 
    f.id as family_id,
    f.family_name,
    COUNT(DISTINCT s.id) as total_children,
    fc.agreed_amount,
    COALESCE(SUM(p.amount), 0) as total_paid,
    fc.agreed_amount - COALESCE(SUM(p.amount), 0) as pending_amount,
    fc.status as commitment_status
FROM families f
LEFT JOIN students s ON f.id = s.family_id
LEFT JOIN fraternal_commitments fc ON f.id = fc.family_id AND fc.status = 'activo'
LEFT JOIN payments p ON f.id = p.family_id
WHERE f.is_active = true
GROUP BY f.id, f.family_name, fc.agreed_amount, fc.status;
```

## 🔐 **Variables de Entorno**

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

## 📝 **Próximos Pasos**

1. **Crear proyecto en Supabase**
2. **Aplicar esquema SQL**
3. **Configurar RLS**
4. **Crear funciones de servidor**
5. **Configurar autenticación**
6. **Probar con datos de ejemplo**

## 🎯 **Beneficios del Diseño**

- ✅ **Sistema Fraterno**: Soporte completo para aportes variables
- ✅ **Flexibilidad**: Fácil modificación de compromisos
- ✅ **Trazabilidad**: Historial completo de pagos
- ✅ **Seguridad**: RLS para proteger datos por roles
- ✅ **Escalabilidad**: Preparado para crecimiento
- ✅ **Waldorf**: Terminología y estructura acorde a la pedagogía


