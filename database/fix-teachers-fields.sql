-- Script para verificar y corregir campos specialization y assigned_grade
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la estructura completa de la tabla teachers
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

-- 2. Verificar si assigned_grade existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
AND column_name IN ('assigned_grade', 'grade_level', 'grade');

-- 3. Verificar el tipo de specialization
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
AND column_name = 'specialization';

-- 4. Ver datos existentes para entender la estructura
SELECT 
    id,
    first_name,
    last_name,
    email,
    specialization,
    hire_date,
    is_active
FROM teachers 
LIMIT 3;

-- 5. Si specialization es array, probar insertar como array
-- (Descomenta solo si specialization es efectivamente un array)
/*
INSERT INTO teachers (
    first_name, 
    last_name, 
    email, 
    specialization, 
    hire_date, 
    is_active
) VALUES (
    'Test', 
    'Array', 
    'test-array@lacolmena.edu', 
    ARRAY['Matemáticas', 'Ciencias'], 
    '2024-01-01', 
    true
);
*/

-- 6. Agregar columna assigned_grade si no existe
-- (Descomenta solo si assigned_grade no existe)
/*
ALTER TABLE teachers 
ADD COLUMN assigned_grade TEXT;
*/

-- 7. Verificar restricciones de la tabla
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'teachers'::regclass
ORDER BY conname;
