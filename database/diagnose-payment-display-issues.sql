-- ============================================
-- DIAGNOSTICAR PROBLEMAS DE VISUALIZACIÓN
-- ============================================

-- 1. Ver todos los pagos en la tabla payments
SELECT 
    id,
    family_id,
    student_id,
    commitment_id,
    amount,
    payment_date,
    payment_method,
    cash_box_id,
    month_paid,
    created_at
FROM payments 
ORDER BY created_at DESC;

-- 2. Ver todos los estados mensuales
SELECT 
    id,
    family_id,
    student_id,
    commitment_id,
    year,
    month,
    expected_amount,
    paid_amount,
    status,
    created_at
FROM monthly_payment_status 
ORDER BY year DESC, month DESC, created_at DESC;

-- 3. Verificar si hay pagos sin cash_box_id
SELECT 
    COUNT(*) as total_payments,
    COUNT(cash_box_id) as payments_with_cashbox,
    COUNT(*) - COUNT(cash_box_id) as payments_without_cashbox
FROM payments;

-- 4. Verificar estructura de monthly_payment_status
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'monthly_payment_status' 
ORDER BY ordinal_position;
