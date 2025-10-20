-- ============================================
-- LIMPIEZA CORREGIDA DEL SISTEMA DE CAJAS
-- ============================================

-- PASO 1: Ver qué cajas están siendo usadas en transacciones
SELECT 
    t.id,
    t.concept,
    t.amount,
    t.cash_box,
    cb.name as cash_box_name,
    cb.box_type,
    cb.payment_method
FROM transactions t
LEFT JOIN cash_boxes cb ON t.cash_box = cb.id
ORDER BY t.created_at DESC;

-- PASO 2: Mapear transacciones existentes a cajas estándar
-- Mapear transacciones que usan cajas con nombres antiguos

-- Para transacciones con caja "general"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'general'
);

-- Para transacciones con caja "compras"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja Compras'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'compras'
);

-- Para transacciones con caja "campo"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'campo'
);

-- Para transacciones con caja "musica"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'musica'
);

-- PASO 3: Eliminar cajas duplicadas (solo si no tienen transacciones)
DELETE FROM cash_boxes 
WHERE name IN ('general', 'compras', 'campo', 'musica')
AND id NOT IN (
    SELECT DISTINCT cash_box FROM transactions WHERE cash_box IS NOT NULL
);

-- PASO 4: Verificar resultado final
SELECT 
    name,
    currency,
    box_type,
    payment_method,
    is_active
FROM cash_boxes 
WHERE is_active = true
ORDER BY box_type, payment_method, name;
