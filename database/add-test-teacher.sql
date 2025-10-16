-- Script para agregar maestro de prueba
-- Ejecutar en Supabase SQL Editor

INSERT INTO teachers (
  id,
  first_name,
  last_name,
  email,
  phone,
  address,
  birth_date,
  hire_date,
  specialization,
  grade_level,
  bio,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'María',
  'Rodriguez',
  'maria.rodriguez@lacolmena.edu',
  '+54 11 9876-5432',
  'Av. Santa Fe 1234, CABA',
  '1985-03-15',
  '2020-02-01',
  'Pedagogía Waldorf',
  'Jardín de Infantes',
  'Maestra con 15 años de experiencia en pedagogía Waldorf. Especializada en desarrollo infantil y educación artística. Apasionada por crear un ambiente de aprendizaje cálido y acogedor.',
  true,
  NOW(),
  NOW()
);

-- Verificar que se insertó correctamente
SELECT 
  first_name,
  last_name,
  email,
  specialization,
  grade_level,
  is_active
FROM teachers 
WHERE email = 'maria.rodriguez@lacolmena.edu';
