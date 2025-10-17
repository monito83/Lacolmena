-- Script para investigar más a fondo el problema de gender
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la estructura EXACTA de la tabla students
\d students;

-- 2. Ver TODAS las columnas de students con sus tipos exactos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si gender tiene algún valor por defecto
SELECT 
    column_name,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name = 'gender'
AND table_schema = 'public';

-- 4. Intentar insertar un registro con gender NULL para ver qué error específico da
INSERT INTO students (
    first_name, 
    last_name, 
    birth_date, 
    family_id, 
    enrollment_date,
    gender
) VALUES (
    'Test', 
    'User', 
    '2020-01-01', 
    (SELECT id FROM families LIMIT 1), 
    '2024-01-01',
    NULL
);

-- 5. Si el INSERT funciona, borrar el registro de prueba
DELETE FROM students WHERE first_name = 'Test' AND last_name = 'User';

-- 6. Verificar el tipo de datos exacto de gender
SELECT 
    t.typname as type_name,
    e.enumlabel as enum_value
FROM pg_type t 
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%gender%' OR e.enumlabel IN ('masculino', 'femenino', 'otro');
