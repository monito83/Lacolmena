-- Script para verificar restricciones de la tabla teachers
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la estructura de la tabla teachers
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

-- 2. Ver todas las restricciones de la tabla
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'teachers'::regclass
ORDER BY conname;

-- 3. Ver datos de ejemplo de la tabla
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    specialization,
    assigned_grade,
    hire_date,
    is_active
FROM teachers 
LIMIT 3;
