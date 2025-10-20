-- ============================================
-- LIMPIEZA Y ESTANDARIZACIÓN DEL SISTEMA DE CAJAS
-- ============================================

-- PASO 1: Identificar cajas duplicadas y problemáticas
-- (ejecutar primero el script de auditoría)

-- PASO 2: Crear cajas estándar (solo si no existen)
INSERT INTO cash_boxes (name, description, color, currency, box_type, payment_method) 
SELECT * FROM (VALUES
    ('Caja General ARS', 'Caja principal de efectivo en pesos argentinos', '#4CAF50', 'ARS', 'caja', 'efectivo'),
    ('Caja Dólares', 'Caja de efectivo en dólares estadounidenses', '#FF9800', 'USD', 'caja', 'efectivo'),
    ('Banco Santander ARS', 'Cuenta corriente Banco Santander en pesos', '#2196F3', 'ARS', 'banco', 'transferencia'),
    ('Banco Nación ARS', 'Cuenta corriente Banco Nación en pesos', '#1976D2', 'ARS', 'banco', 'transferencia'),
    ('Mercado Pago ARS', 'Cuenta Mercado Pago en pesos', '#00BCD4', 'ARS', 'otros', 'transferencia'),
    ('Caja Compras ARS', 'Caja específica para compras en pesos', '#9C27B0', 'ARS', 'caja', 'efectivo'),
    ('Caja Campo ARS', 'Caja para actividades de campo en pesos', '#8B5CF6', 'ARS', 'caja', 'efectivo'),
    ('Tarjeta Débito ARS', 'Cuenta de tarjeta de débito en pesos', '#607D8B', 'ARS', 'tarjeta', 'tarjeta')
) AS new_boxes(name, description, color, currency, box_type, payment_method)
WHERE NOT EXISTS (
    SELECT 1 FROM cash_boxes WHERE cash_boxes.name = new_boxes.name
);

-- PASO 3: Mapear transacciones existentes a cajas estándar
-- Mapear transacciones que usan cajas con nombres antiguos

-- Para transacciones con caja "general"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General ARS'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'general'
);

-- Para transacciones con caja "compras"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja Compras ARS'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'compras'
);

-- Para transacciones con caja "campo"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja Campo ARS'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'campo'
);

-- Para transacciones con caja "Caja de prueba"
UPDATE transactions 
SET cash_box = (
    SELECT id FROM cash_boxes 
    WHERE name = 'Caja General ARS'
    LIMIT 1
)
WHERE cash_box IN (
    SELECT id FROM cash_boxes WHERE name = 'Caja de prueba'
);

-- PASO 4: Mapear pagos existentes a cajas estándar
-- (Similar para la tabla payments cuando tengamos cash_box_id)

-- PASO 5: Eliminar cajas duplicadas (solo si no tienen transacciones/pagos)
DELETE FROM cash_boxes 
WHERE name IN ('general', 'compras', 'campo', 'Caja de prueba', 'musica')
AND id NOT IN (
    SELECT DISTINCT cash_box FROM transactions WHERE cash_box IS NOT NULL
    UNION
    SELECT DISTINCT cash_box_id FROM payments WHERE cash_box_id IS NOT NULL
);

-- PASO 6: Verificar resultado final
SELECT 
    name,
    currency,
    box_type,
    payment_method,
    is_active
FROM cash_boxes 
WHERE is_active = true
ORDER BY box_type, payment_method, name;
