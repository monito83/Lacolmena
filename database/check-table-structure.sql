-- ============================================
-- VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
-- ============================================

-- Verificar estructura de cash_boxes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'cash_boxes' 
ORDER BY ordinal_position;

-- Verificar estructura de transactions
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Verificar si existe transaction_categories
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'transaction_categories' 
ORDER BY ordinal_position;
