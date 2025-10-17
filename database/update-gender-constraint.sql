-- Script para actualizar la restricción de género para incluir 'sin_definir'
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la restricción actual
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass
AND conname LIKE '%gender%';

-- 2. Eliminar la restricción actual de gender
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check_new;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_flexible;

-- 3. Crear nueva restricción que incluye 'sin_definir'
ALTER TABLE students ADD CONSTRAINT students_gender_check_updated 
CHECK (gender IS NULL OR gender IN ('masculino', 'femenino', 'otro', 'sin_definir'));

-- 4. Verificar que se creó correctamente
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass
AND conname = 'students_gender_check_updated';

-- 5. Probar que funciona con 'sin_definir'
UPDATE students 
SET gender = 'sin_definir' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 6. Verificar que se actualizó
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 7. Probar que también funciona con NULL (por si acaso)
UPDATE students 
SET gender = NULL 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 8. Verificar
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 9. Volver a 'sin_definir' para la prueba final
UPDATE students 
SET gender = 'sin_definir' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 10. Verificación final
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';
