-- ============================================
-- ESQUEMA DE BASE DE DATOS - LA COLMENA
-- Sistema de Gestión Escolar Waldorf
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de Usuarios (autenticación)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'maestro', 'familia')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Perfiles de Usuario
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    profile_picture_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Familias
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Niños/Niñas
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Para login familiar
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('masculino', 'femenino', 'otro')),
    grade VARCHAR(50), -- Ej: "Jardín", "1° grado", etc.
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    medical_notes TEXT,
    special_needs TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Maestros
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    specializations TEXT[], -- Array de especialidades
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SISTEMA FRATERNO DE APORTES
-- ============================================

-- Tabla de Compromisos Fraternos (aportes acordados)
CREATE TABLE fraternal_commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL, -- Ej: "2024-2025"
    agreed_amount DECIMAL(10,2) NOT NULL, -- Monto acordado
    suggested_amount DECIMAL(10,2), -- Monto sugerido para equilibrio
    payment_frequency VARCHAR(20) DEFAULT 'mensual' CHECK (payment_frequency IN ('mensual', 'trimestral', 'anual')),
    status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'suspendido', 'modificado', 'finalizado')),
    commitment_date DATE NOT NULL,
    review_date DATE, -- Fecha de próxima revisión
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pagos Realizados
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES fraternal_commitments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('efectivo', 'transferencia', 'cheque', 'tarjeta')),
    reference_number VARCHAR(100), -- Número de referencia/transacción
    month_paid VARCHAR(7), -- Ej: "2024-03" para marzo 2024
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estados de Pago por Mes
CREATE TABLE monthly_payment_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES fraternal_commitments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    expected_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'parcial', 'completo', 'excedido')),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_id, student_id, commitment_id, year, month)
);

-- ============================================
-- GESTIÓN ACADÉMICA
-- ============================================

-- Tabla de Años Académicos
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL, -- Ej: "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clases/Grados
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ej: "Jardín de Infantes", "1° Grado"
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    max_students INTEGER DEFAULT 25,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Inscripciones de Estudiantes
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'suspendido', 'egresado')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, academic_year_id)
);

-- ============================================
-- GESTIÓN FINANCIERA
-- ============================================

-- Tabla de Gastos
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- Ej: "Salarios", "Materiales", "Mantenimiento"
    subcategory VARCHAR(100), -- Ej: "Salarios maestros", "Materiales didácticos"
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    vendor VARCHAR(200), -- Proveedor
    receipt_url VARCHAR(500), -- URL del comprobante
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ingresos (además de aportes)
CREATE TABLE other_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- Ej: "Donaciones", "Subvenciones", "Actividades"
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    income_date DATE NOT NULL,
    source VARCHAR(200), -- Fuente del ingreso
    receipt_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMUNICACIONES
-- ============================================

-- Tabla de Comunicaciones Internas
CREATE TABLE internal_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('baja', 'normal', 'alta', 'urgente')),
    target_audience VARCHAR(20) CHECK (target_audience IN ('todos', 'maestros', 'familias', 'admin')),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Eventos
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    organizer_id UUID REFERENCES users(id),
    target_audience VARCHAR(20) CHECK (target_audience IN ('todos', 'maestros', 'familias', 'estudiantes')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- Ej: "semanal", "mensual"
    max_attendees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_students_family_id ON students(family_id);
CREATE INDEX idx_payments_family_id ON payments(family_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_commitments_family_id ON fraternal_commitments(family_id);
CREATE INDEX idx_monthly_status_year_month ON monthly_payment_status(year, month);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON fraternal_commitments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_status_updated_at BEFORE UPDATE ON monthly_payment_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular edad
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar año académico actual
INSERT INTO academic_years (name, start_date, end_date, is_active) 
VALUES ('2024-2025', '2024-03-01', '2025-02-28', true);

-- Usuario administrador por defecto (contraseña: admin123)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@lacolmena.edu', '$2b$10$rOzJ6QbJ7J7J7J7J7J7J7O', 'admin');

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE families IS 'Familias de la escuela - cada familia puede tener múltiples niños';
COMMENT ON TABLE students IS 'Niños y niñas de la escuela';
COMMENT ON TABLE fraternal_commitments IS 'Compromisos fraternos de aporte por familia y año académico';
COMMENT ON TABLE payments IS 'Registro de todos los pagos realizados por las familias';
COMMENT ON TABLE monthly_payment_status IS 'Estado mensual de pagos para cada familia';
COMMENT ON TABLE expenses IS 'Gastos de la escuela';
COMMENT ON TABLE other_income IS 'Ingresos adicionales (donaciones, subvenciones, etc.)';


