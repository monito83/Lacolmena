-- Script AGRESIVO para corregir completamente el problema de género
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todas las restricciones actuales
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass;

-- 2. Eliminar TODAS las restricciones que puedan afectar gender
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS gender_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS check_gender;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_check;

-- 3. Verificar que se eliminaron
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass;

-- 4. Probar que ahora SÍ permite NULL
UPDATE students 
SET gender = NULL 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 5. Verificar que se actualizó
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 6. Crear nueva restricción MÁS PERMISIVA
ALTER TABLE students ADD CONSTRAINT students_gender_check_new 
CHECK (gender IS NULL OR gender = '' OR gender IN ('masculino', 'femenino', 'otro'));

-- 7. Probar que funciona con string vacío también
UPDATE students 
SET gender = '' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 8. Verificar
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 9. Probar con NULL otra vez
UPDATE students 
SET gender = NULL 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 10. Verificar final
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';
