-- Script para probar diferentes enfoques para el problema de gender
-- Ejecutar en Supabase SQL Editor

-- 1. Ver el estado actual de Ana García
SELECT id, first_name, last_name, gender, created_at, updated_at
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 2. Probar con string vacío (en lugar de NULL)
UPDATE students 
SET gender = '' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 3. Verificar si funcionó
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 4. Si no funcionó, probar con NULL explícito
UPDATE students 
SET gender = NULL 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 5. Verificar
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 6. Si tampoco funciona, probar eliminando la columna y recreándola
-- (COMENTADO - solo ejecutar si es necesario)
/*
ALTER TABLE students DROP COLUMN gender;
ALTER TABLE students ADD COLUMN gender VARCHAR(20);
*/

-- 7. Probar con un valor válido para confirmar que la tabla funciona
UPDATE students 
SET gender = 'femenino' 
WHERE first_name = 'Ana' AND last_name = 'García';

-- 8. Verificar
SELECT id, first_name, last_name, gender 
FROM students 
WHERE first_name = 'Ana' AND last_name = 'García';
