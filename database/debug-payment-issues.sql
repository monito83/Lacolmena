-- ============================================
-- VERIFICAR PROBLEMA CON CAJAS Y PAGOS
-- ============================================

-- 1. Verificar si existe la tabla monthly_payment_status
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'monthly_payment_status' 
ORDER BY ordinal_position;

-- 2. Verificar datos en monthly_payment_status
SELECT * FROM monthly_payment_status LIMIT 5;

-- 3. Verificar si hay pagos registrados
SELECT 
    id,
    family_id,
    student_id,
    amount,
    payment_date,
    payment_method,
    cash_box_id,
    created_at
FROM payments 
ORDER BY created_at DESC;

-- 4. Verificar cajas disponibles por método de pago
SELECT 
    name,
    payment_method,
    box_type,
    currency,
    is_active
FROM cash_boxes 
WHERE is_active = true
ORDER BY payment_method, name;
