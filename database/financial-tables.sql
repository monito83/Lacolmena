-- ============================================
-- TABLAS DEL SISTEMA FINANCIERO
-- ============================================

-- Tabla de Categorías de Transacciones
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Color en formato hex (#RRGGBB)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cajas de Efectivo
CREATE TABLE cash_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Color en formato hex (#RRGGBB)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Transacciones (unificada para ingresos y gastos)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS', -- ARS, USD, etc.
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    cash_box UUID REFERENCES cash_boxes(id),
    category UUID REFERENCES transaction_categories(id),
    description TEXT,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100), -- Número de referencia/comprobante
    recorded_by UUID REFERENCES users(id),
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

-- Insertar cajas por defecto
INSERT INTO cash_boxes (name, description, color) VALUES
('General', 'Caja principal de la escuela', '#4CAF50'),
('Compras', 'Caja para compras y gastos', '#FF9800'),
('Emergencias', 'Fondo de emergencias', '#F44336');
