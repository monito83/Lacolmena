-- Script para agregar la columna assigned_grade a la tabla teachers
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar la columna assigned_grade
ALTER TABLE teachers 
ADD COLUMN assigned_grade TEXT;

-- 2. Verificar que se agregó correctamente
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
AND column_name = 'assigned_grade';

-- 3. Ver la estructura completa de la tabla teachers
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Probar insertar un maestro con assigned_grade
INSERT INTO teachers (
    first_name, 
    last_name, 
    email, 
    phone, 
    address, 
    specializations, 
    assigned_grade, 
    hire_date, 
    is_active
) VALUES (
    'Test', 
    'Grade', 
    'test-grade@lacolmena.edu', 
    '+54 11 1234-5678', 
    'Av. Test 123, CABA', 
    ARRAY['Matemáticas', 'Ciencias'], 
    '3° grado', 
    '2024-01-01', 
    true
);

-- 5. Verificar que se insertó correctamente
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    address,
    specializations,
    assigned_grade,
    hire_date,
    is_active
FROM teachers 
WHERE first_name = 'Test' AND last_name = 'Grade';

-- 6. Limpiar el registro de prueba
DELETE FROM teachers 
WHERE first_name = 'Test' AND last_name = 'Grade';

-- 7. Verificación final
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
AND column_name = 'assigned_grade';

