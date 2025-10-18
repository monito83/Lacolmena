-- ============================================
-- AGREGAR COLUMNAS FALTANTES A TABLAS EXISTENTES
-- ============================================

-- Agregar columnas faltantes a cash_boxes
ALTER TABLE cash_boxes 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS';

ALTER TABLE cash_boxes 
ADD COLUMN IF NOT EXISTS box_type VARCHAR(20) CHECK (box_type IN ('caja', 'banco', 'tarjeta', 'otros'));

ALTER TABLE cash_boxes 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) CHECK (payment_method IN ('efectivo', 'transferencia', 'cheque', 'tarjeta'));

-- Actualizar registros existentes con valores por defecto
UPDATE cash_boxes 
SET 
    currency = 'ARS',
    box_type = 'caja',
    payment_method = 'efectivo'
WHERE currency IS NULL OR box_type IS NULL OR payment_method IS NULL;

-- Insertar cajas por defecto con tipos específicos (solo si no existen)
INSERT INTO cash_boxes (name, description, color, currency, box_type, payment_method) 
SELECT * FROM (VALUES
    ('Caja General', 'Caja principal de efectivo en pesos', '#4CAF50', 'ARS', 'caja', 'efectivo'),
    ('Caja Dólares', 'Caja de efectivo en dólares', '#FF9800', 'USD', 'caja', 'efectivo'),
    ('Banco Santander', 'Cuenta corriente Banco Santander', '#2196F3', 'ARS', 'banco', 'transferencia'),
    ('Banco Nación', 'Cuenta corriente Banco Nación', '#1976D2', 'ARS', 'banco', 'transferencia'),
    ('Mercado Pago', 'Cuenta Mercado Pago', '#00BCD4', 'ARS', 'otros', 'transferencia'),
    ('Caja Compras', 'Caja específica para compras', '#9C27B0', 'ARS', 'caja', 'efectivo'),
    ('Tarjeta Débito', 'Cuenta de tarjeta de débito', '#607D8B', 'ARS', 'tarjeta', 'tarjeta')
) AS new_boxes(name, description, color, currency, box_type, payment_method)
WHERE NOT EXISTS (
    SELECT 1 FROM cash_boxes WHERE cash_boxes.name = new_boxes.name
);

-- Corregir campo cash_box en transactions para que sea UUID
-- Primero, crear una nueva columna temporal
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS cash_box_id UUID REFERENCES cash_boxes(id);

-- Crear mapeo de valores antiguos a IDs de cajas
-- Buscar cajas existentes o crear las que faltan
INSERT INTO cash_boxes (name, description, color, currency, box_type, payment_method) 
SELECT DISTINCT 
    CASE 
        WHEN cash_box = 'compras' THEN 'Caja Compras'
        WHEN cash_box = 'general' THEN 'Caja General'
        WHEN cash_box = 'campo' THEN 'Caja Campo'
        WHEN cash_box = 'Caja de prueba' THEN 'Caja de Prueba'
        ELSE COALESCE(cash_box, 'Caja General')
    END as name,
    CASE 
        WHEN cash_box = 'compras' THEN 'Caja específica para compras'
        WHEN cash_box = 'general' THEN 'Caja principal de efectivo'
        WHEN cash_box = 'campo' THEN 'Caja para actividades de campo'
        WHEN cash_box = 'Caja de prueba' THEN 'Caja de prueba del sistema'
        ELSE 'Caja ' || COALESCE(cash_box, 'General')
    END as description,
    CASE 
        WHEN cash_box = 'compras' THEN '#9C27B0'
        WHEN cash_box = 'general' THEN '#4CAF50'
        WHEN cash_box = 'campo' THEN '#8B5CF6'
        WHEN cash_box = 'Caja de prueba' THEN '#F59E0B'
        ELSE '#6B7280'
    END as color,
    'ARS' as currency,
    'caja' as box_type,
    'efectivo' as payment_method
FROM transactions 
WHERE cash_box IS NOT NULL 
AND cash_box != ''
AND cash_box NOT IN (SELECT name FROM cash_boxes);

-- Actualizar la nueva columna mapeando los valores antiguos a los IDs correctos
UPDATE transactions 
SET cash_box_id = cb.id
FROM cash_boxes cb
WHERE transactions.cash_box_id IS NULL
AND (
    (transactions.cash_box = 'compras' AND cb.name = 'Caja Compras') OR
    (transactions.cash_box = 'general' AND cb.name = 'Caja General') OR
    (transactions.cash_box = 'campo' AND cb.name = 'Caja Campo') OR
    (transactions.cash_box = 'Caja de prueba' AND cb.name = 'Caja de Prueba') OR
    (transactions.cash_box IS NOT NULL AND transactions.cash_box != '' AND cb.name = transactions.cash_box)
);

-- Eliminar la columna antigua
ALTER TABLE transactions DROP COLUMN IF EXISTS cash_box;

-- Renombrar la nueva columna
ALTER TABLE transactions RENAME COLUMN cash_box_id TO cash_box;

-- Crear tabla de categorías de transacciones si no existe
CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Color en formato hex (#RRGGBB)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto (solo si no existen)
INSERT INTO transaction_categories (name, description, color) 
SELECT * FROM (VALUES
    ('Cuotas', 'Pagos de cuotas mensuales de las familias', '#4CAF50'),
    ('Donaciones', 'Donaciones recibidas', '#2196F3'),
    ('Subvenciones', 'Subvenciones gubernamentales', '#FF9800'),
    ('Sueldos', 'Pagos de salarios a maestros y personal', '#F44336'),
    ('Materiales', 'Compra de materiales pedagógicos', '#9C27B0'),
    ('Mantenimiento', 'Gastos de mantenimiento del edificio', '#607D8B'),
    ('Servicios', 'Servicios públicos y otros', '#795548')
) AS new_categories(name, description, color)
WHERE NOT EXISTS (
    SELECT 1 FROM transaction_categories WHERE transaction_categories.name = new_categories.name
);
