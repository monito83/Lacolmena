import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth-supabase';
import familyRoutes from './routes/families';
import studentRoutes from './routes/students';
import teacherRoutes from './routes/teachers';
import financialRoutes from './routes/financial';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { supabase } from './config/supabase';

// Cargar variables de entorno
dotenv.config({ path: './env.supabase' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:9000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos.'
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Función para conectar a la base de datos
async function connectDatabase() {
  try {
    // Probar conexión con Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Base de datos Supabase conectada exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/families', familyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/financial', financialRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema de Gestión La Colmena - Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    database: 'Supabase'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Gestión La Colmena - Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      families: '/api/families',
      students: '/api/students',
      teachers: '/api/teachers',
      financial: '/api/financial',
      health: '/api/health'
    }
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servidor`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me'
    ]
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📡 API disponible en: http://localhost:${PORT}`);
      console.log(`🔗 Frontend configurado para: http://localhost:9000`);
      console.log(`🗄️  Base de datos: Supabase`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - POST /api/auth/login`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - GET  /api/auth/me`);
      console.log(`   - PUT  /api/auth/change-password`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();

export default app;

