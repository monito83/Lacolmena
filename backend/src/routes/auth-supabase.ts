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
  role: z.enum(['admin', 'maestro', 'familia']),
  profile: z.object({
    first_name: z.string().min(1, 'Nombre requerido'),
    last_name: z.string().min(1, 'Apellido requerido'),
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
    const { data: users, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*),
        teachers(*),
        students(
          *,
          families(*)
        )
      `)
      .eq('email', email)
      .limit(1);

    if (userError) {
      throw createError('Error al buscar usuario', 500);
    }

    if (!users || users.length === 0) {
      throw createError('Credenciales inválidas', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      throw createError('Usuario inactivo', 401);
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
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
      profile: user.user_profiles?.[0] || null,
      teacher: user.teachers?.[0] || null,
      familyId: user.students?.[0]?.family_id || undefined,
    };

    logger.info(`Usuario logueado: ${user.email} con rol: ${user.role}`);
    res.status(200).json({ success: true, token, user: userData });
  } catch (error) {
    logger.error('Error al iniciar sesión:', error);
    throw error;
  }
}));

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  try {
    const { email, password, role, profile } = registerSchema.parse(req.body);

    // Verificar si el usuario ya existe
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      throw createError('Error al verificar usuario existente', 500);
    }

    if (existingUsers && existingUsers.length > 0) {
      throw createError('El usuario con este email ya existe', 400);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario y perfil en una transacción
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      throw createError('Error al crear usuario', 500);
    }

    // Crear perfil
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUser.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        address: profile.address
      })
      .select()
      .single();

    if (profileError) {
      throw createError('Error al crear perfil', 500);
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info(`Usuario registrado: ${newUser.email} con rol: ${newUser.role}`);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role, 
        profile: newProfile 
      } 
    });
  } catch (error) {
    logger.error('Error al registrar usuario:', error);
    throw error;
  }
}));

// GET /api/auth/me
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('Error al obtener usuario actual:', error);
    throw error;
  }
}));

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (userError) {
      throw createError('Error al buscar usuario', 500);
    }

    if (!users || users.length === 0) {
      throw createError('Usuario no encontrado', 404);
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw createError('Contraseña actual incorrecta', 401);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw createError('Error al actualizar contraseña', 500);
    }

    logger.info(`Contraseña cambiada para el usuario: ${user.email}`);
    res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    logger.error('Error al cambiar contraseña:', error);
    throw error;
  }
}));

export default router;


