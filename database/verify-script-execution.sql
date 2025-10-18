-- ============================================
-- VERIFICAR EJECUCIÓN DEL SCRIPT
-- ============================================

-- 1. Verificar estructura de cash_boxes (debe tener las nuevas columnas)
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'cash_boxes' 
ORDER BY ordinal_position;

-- 2. Verificar que se crearon las cajas con los datos migrados
SELECT 
    id,
    name, 
    description, 
    color, 
    currency, 
    box_type, 
    payment_method,
    is_active
FROM cash_boxes 
ORDER BY name;

-- 3. Verificar estructura de transactions (cash_box debe ser UUID ahora)
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- 4. Verificar que las transacciones se migraron correctamente
SELECT 
    t.id,
    t.concept,
    t.amount,
    t.currency,
    t.cash_box,
    cb.name as cash_box_name,
    cb.box_type,
    cb.payment_method
FROM transactions t
LEFT JOIN cash_boxes cb ON t.cash_box = cb.id
ORDER BY t.created_at DESC;

-- 5. Verificar que se creó la tabla transaction_categories
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'transaction_categories' 
ORDER BY ordinal_position;

-- 6. Verificar categorías creadas
SELECT 
    id,
    name, 
    description, 
    color,
    is_active
FROM transaction_categories 
ORDER BY name;
