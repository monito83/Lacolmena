-- ============================================
-- AUDITORÍA COMPLETA DEL SISTEMA DE CAJAS
-- ============================================

-- 1. Ver todas las cajas existentes
SELECT 
    id,
    name,
    description,
    currency,
    box_type,
    payment_method,
    is_active,
    created_at
FROM cash_boxes 
ORDER BY name;

-- 2. Ver qué cajas están siendo usadas en transacciones
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

-- 3. Ver qué cajas están siendo usadas en pagos
SELECT 
    p.id,
    p.amount,
    p.payment_method,
    p.cash_box_id,
    cb.name as cash_box_name,
    cb.box_type,
    p.created_at
FROM payments p
LEFT JOIN cash_boxes cb ON p.cash_box_id = cb.id
ORDER BY p.created_at DESC;

-- 4. Contar uso de cada caja
SELECT 
    cb.name,
    cb.box_type,
    cb.payment_method,
    COUNT(t.id) as transacciones_count,
    COUNT(p.id) as pagos_count,
    (COUNT(t.id) + COUNT(p.id)) as total_uso
FROM cash_boxes cb
LEFT JOIN transactions t ON cb.id = t.cash_box
LEFT JOIN payments p ON cb.id = p.cash_box_id
GROUP BY cb.id, cb.name, cb.box_type, cb.payment_method
ORDER BY total_uso DESC;
