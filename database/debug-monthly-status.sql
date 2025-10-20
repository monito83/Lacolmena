-- ============================================
-- DIAGNOSTICAR ESTADO MENSUAL
-- ============================================

-- 1. Ver todos los pagos registrados
SELECT 
    'PAGOS REGISTRADOS' as tipo,
    COUNT(*) as cantidad
FROM payments;

-- 2. Ver todos los estados mensuales
SELECT 
    'ESTADOS MENSUALES' as tipo,
    COUNT(*) as cantidad
FROM monthly_payment_status;

-- 3. Ver detalles de estados mensuales
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

-- 4. Ver si hay compromisos fraternos
SELECT 
    'COMPROMISOS FRATERNOS' as tipo,
    COUNT(*) as cantidad
FROM fraternal_commitments;

-- 5. Ver detalles de compromisos
SELECT 
    id,
    family_id,
    student_id,
    academic_year,
    agreed_amount,
    status,
    created_at
FROM fraternal_commitments 
ORDER BY created_at DESC;
