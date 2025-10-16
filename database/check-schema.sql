-- Script para revisar la estructura completa de la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todas las tablas existentes
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Ver estructura de la tabla user_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver todos los datos de user_profiles
SELECT * FROM user_profiles;

-- 4. Ver estructura de la tabla users (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Ver todos los datos de users (si existe)
SELECT * FROM users;

-- 6. Ver usuarios en Supabase Auth (esto puede no funcionar dependiendo de permisos)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'admin@lacolmena.edu';

-- 7. Ver relaciones (foreign keys)
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND (tc.table_name = 'user_profiles' OR tc.table_name = 'users');
