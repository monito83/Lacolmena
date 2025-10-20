-- ============================================
-- AGREGAR COLUMNA CASH_BOX_ID A TABLA PAYMENTS
-- ============================================

-- Agregar columna cash_box_id a la tabla payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS cash_box_id UUID REFERENCES cash_boxes(id);

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
