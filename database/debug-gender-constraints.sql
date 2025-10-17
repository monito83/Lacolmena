-- Script para investigar todas las restricciones de la tabla students
-- Ejecutar en Supabase SQL Editor

-- 1. Ver TODAS las restricciones de la tabla students
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass;

-- 2. Ver la estructura completa de la tabla students
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver específicamente la columna gender
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name = 'gender';

-- 4. Intentar ver si hay restricciones de dominio
SELECT 
    d.typname as domain_name,
    pg_get_constraintdef(d.oid) as domain_definition
FROM pg_type d
WHERE d.typname LIKE '%gender%' OR d.typname LIKE '%students%';

-- 5. Verificar si el campo gender tiene algún trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'students' 
AND event_object_schema = 'public';
