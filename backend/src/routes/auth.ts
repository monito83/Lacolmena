import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['ADMIN', 'MAESTRO', 'FAMILIA']),
  profile: z.object({
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
});

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        teacher: true,
        students: {
          include: {
            family: true
          }
        }
      }
    });

    if (!user) {
      throw createError('Credenciales inválidas', 401);
    }

    if (!user.isActive) {
      throw createError('Usuario inactivo', 401);
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Credenciales inválidas', 401);
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Preparar datos del usuario para respuesta
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      teacher: user.teacher,
      family: user.students[0]?.family || null
    };

    logger.info(`Usuario ${email} inició sesión exitosamente`);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: userData
    });
  } catch (error) {
    logger.error('Error en login:', error);
    throw error;
  }
}));

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const { email, password, role, profile } = data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError('El email ya está registrado', 409);
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: {
          create: profile
        }
      },
      include: {
        profile: true
      }
    });

    logger.info(`Usuario ${email} registrado exitosamente`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    throw error;
  }
}));

// GET /api/auth/me
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        teacher: true,
        students: {
          include: {
            family: true
          }
        }
      }
    });

    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      teacher: user.teacher,
      family: user.students[0]?.family || null
    };

    res.json({
      message: 'Usuario obtenido exitosamente',
      user: userData
    });
  } catch (error) {
    logger.error('Error obteniendo usuario:', error);
    throw error;
  }
}));

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Contraseña actual incorrecta', 400);
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    logger.info(`Usuario ${user.email} cambió su contraseña`);

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error cambiando contraseña:', error);
    throw error;
  }
}));

// POST /api/auth/logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // En un sistema más complejo, aquí podrías invalidar el token
    // Por ahora, solo confirmamos el logout
    logger.info(`Usuario ${req.user!.email} cerró sesión`);
    
    res.json({
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    throw error;
  }
}));

export default router;
