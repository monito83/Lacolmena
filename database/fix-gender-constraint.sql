-- Script para corregir la restricción de género en la tabla students
-- Ejecutar en Supabase SQL Editor

-- Verificar la restricción actual
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'students_gender_check';

-- Eliminar la restricción actual
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check;

-- Crear nueva restricción que permite NULL
ALTER TABLE students ADD CONSTRAINT students_gender_check 
CHECK (gender IS NULL OR gender IN ('masculino', 'femenino', 'otro'));

-- Verificar que la nueva restricción se creó correctamente
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'students_gender_check';

-- Probar que funciona con NULL
-- (Esto debería funcionar sin errores)
UPDATE students 
SET gender = NULL 
WHERE id = (SELECT id FROM students LIMIT 1);

-- Verificar que el cambio se aplicó
SELECT id, first_name, last_name, gender 
FROM students 
WHERE gender IS NULL;
