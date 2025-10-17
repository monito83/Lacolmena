-- Script RÁPIDO para corregir el problema de género
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar TODAS las restricciones que puedan afectar gender
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS gender_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS check_gender;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check_new;

-- 2. Probar que ahora SÍ permite NULL
UPDATE students 
SET gender = NULL 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 3. Verificar que se actualizó
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 4. Si funciona, crear nueva restricción MÁS PERMISIVA
ALTER TABLE students ADD CONSTRAINT students_gender_flexible 
CHECK (gender IS NULL OR gender = '' OR gender IN ('masculino', 'femenino', 'otro'));

-- 5. Probar que funciona con string vacío también
UPDATE students 
SET gender = '' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 6. Verificar
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';
