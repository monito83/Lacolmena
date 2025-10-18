-- ============================================
-- LIMPIAR CAJAS DUPLICADAS
-- ============================================

-- Primero, vamos a ver las cajas duplicadas
SELECT 
    name,
    COUNT(*) as cantidad,
    STRING_AGG(id::text, ', ') as ids
FROM cash_boxes 
GROUP BY name
HAVING COUNT(*) > 1;

-- Actualizar transacciones que apuntan a cajas con nombres antiguos
-- para que apunten a las cajas con nombres nuevos
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'general'
);

UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja Compras'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'compras'
);

UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja Campo'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'campo'
);

-- Eliminar las cajas con nombres antiguos (solo si no tienen transacciones)
DELETE FROM cash_boxes 
WHERE name IN ('general', 'compras', 'campo')
AND id NOT IN (SELECT DISTINCT cash_box FROM transactions WHERE cash_box IS NOT NULL);

-- Verificar resultado final
SELECT 
    name,
    currency,
    box_type,
    payment_method,
    is_active
FROM cash_boxes 
ORDER BY name;
