-- ============================================
-- VERIFICAR ESTRUCTURA DE TABLA PAYMENTS
-- ============================================

-- Ver estructura de la tabla payments
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
