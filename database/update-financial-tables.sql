-- ============================================
-- ACTUALIZACIÓN DE TABLAS FINANCIERAS
-- ============================================

-- Crear tabla de cajas si no existe
CREATE TABLE IF NOT EXISTS cash_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Color en formato hex (#RRGGBB)
    currency VARCHAR(3) DEFAULT 'ARS', -- ARS, USD, etc.
    box_type VARCHAR(20) NOT NULL CHECK (box_type IN ('caja', 'banco', 'tarjeta', 'otros')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'cheque', 'tarjeta')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar cajas por defecto con tipos específicos
INSERT INTO cash_boxes (name, description, color, currency, box_type, payment_method) VALUES
('Caja General', 'Caja principal de efectivo en pesos', '#4CAF50', 'ARS', 'caja', 'efectivo'),
('Caja Dólares', 'Caja de efectivo en dólares', '#FF9800', 'USD', 'caja', 'efectivo'),
('Banco Santander', 'Cuenta corriente Banco Santander', '#2196F3', 'ARS', 'banco', 'transferencia'),
('Banco Nación', 'Cuenta corriente Banco Nación', '#1976D2', 'ARS', 'banco', 'transferencia'),
('Mercado Pago', 'Cuenta Mercado Pago', '#00BCD4', 'ARS', 'otros', 'transferencia'),
('Caja Compras', 'Caja específica para compras', '#9C27B0', 'ARS', 'caja', 'efectivo'),
('Tarjeta Débito', 'Cuenta de tarjeta de débito', '#607D8B', 'ARS', 'tarjeta', 'tarjeta');

-- Crear tabla de transacciones si no existe (simplificada)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS', -- ARS, USD, etc.
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    cash_box UUID REFERENCES cash_boxes(id),
    category VARCHAR(100), -- Categoría simple (sin relación por ahora)
    description TEXT,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100), -- Número de referencia/comprobante
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- Insertar categorías por defecto
INSERT INTO transaction_categories (name, description, color) VALUES
('Cuotas', 'Pagos de cuotas mensuales de las familias', '#4CAF50'),
('Donaciones', 'Donaciones recibidas', '#2196F3'),
('Subvenciones', 'Subvenciones gubernamentales', '#FF9800'),
('Sueldos', 'Pagos de salarios a maestros y personal', '#F44336'),
('Materiales', 'Compra de materiales pedagógicos', '#9C27B0'),
('Mantenimiento', 'Gastos de mantenimiento del edificio', '#607D8B'),
('Servicios', 'Servicios públicos y otros', '#795548');
