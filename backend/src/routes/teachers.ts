import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdmin, requireTeacher } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const createTeacherSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  specializations: z.array(z.string()).default([]),
  hireDate: z.string().transform(str => new Date(str)),
  bio: z.string().optional()
});

const updateTeacherSchema = createTeacherSchema.partial().omit({ hireDate: true });

// GET /api/teachers
router.get('/', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive = 'true' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      isActive: isActive === 'true'
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            include: {
              profile: true
            }
          },
          classes: {
            include: {
              academicYear: true
            }
          }
        },
        orderBy: { firstName: 'asc' }
      }),
      prisma.teacher.count({ where })
    ]);

    res.json({
      message: 'Maestros obtenidos exitosamente',
      data: teachers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error obteniendo maestros:', error);
    throw error;
  }
}));

// GET /api/teachers/:id
router.get('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        classes: {
          include: {
            academicYear: true,
            enrollments: {
              include: {
                student: {
                  include: {
                    family: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      throw createError('Maestro no encontrado', 404);
    }

    res.json({
      message: 'Maestro obtenido exitosamente',
      data: teacher
    });
  } catch (error) {
    logger.error('Error obteniendo maestro:', error);
    throw error;
  }
}));

// POST /api/teachers
router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const data = createTeacherSchema.parse(req.body);

    // Verificar si ya existe un maestro con ese email
    if (data.email) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: { email: data.email }
      });

      if (existingTeacher) {
        throw createError('Ya existe un maestro con ese email', 409);
      }
    }

    const teacher = await prisma.teacher.create({
      data,
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    logger.info(`Maestro ${teacher.firstName} ${teacher.lastName} creado exitosamente`);

    res.status(201).json({
      message: 'Maestro creado exitosamente',
      data: teacher
    });
  } catch (error) {
    logger.error('Error creando maestro:', error);
    throw error;
  }
}));

// PUT /api/teachers/:id
router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateTeacherSchema.parse(req.body);

    // Verificar que el maestro existe
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id }
    });

    if (!existingTeacher) {
      throw createError('Maestro no encontrado', 404);
    }

    // Si es maestro y no admin, solo puede actualizar su propio perfil
    if (req.user!.role === 'MAESTRO' && req.user!.teacherId !== id) {
      throw createError('No tienes permisos para actualizar este maestro', 403);
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data,
      include: {
        user: {
          include: {
            profile: true
          }
        },
        classes: {
          include: {
            academicYear: true
          }
        }
      }
    });

    logger.info(`Maestro ${teacher.firstName} ${teacher.lastName} actualizado exitosamente`);

    res.json({
      message: 'Maestro actualizado exitosamente',
      data: teacher
    });
  } catch (error) {
    logger.error('Error actualizando maestro:', error);
    throw error;
  }
}));

// DELETE /api/teachers/:id
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el maestro existe
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        classes: true
      }
    });

    if (!existingTeacher) {
      throw createError('Maestro no encontrado', 404);
    }

    // Verificar que no tenga clases activas
    const activeClasses = existingTeacher.classes.filter(c => c.teacherId === id);
    if (activeClasses.length > 0) {
      throw createError('No se puede eliminar un maestro con clases activas', 400);
    }

    // Desactivar en lugar de eliminar
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Maestro ${teacher.firstName} ${teacher.lastName} desactivado exitosamente`);

    res.json({
      message: 'Maestro desactivado exitosamente',
      data: teacher
    });
  } catch (error) {
    logger.error('Error desactivando maestro:', error);
    throw error;
  }
}));

// GET /api/teachers/:id/classes
router.get('/:id/classes', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const classes = await prisma.class.findMany({
      where: { teacherId: id },
      include: {
        academicYear: true,
        enrollments: {
          include: {
            student: {
              include: {
                family: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      message: 'Clases obtenidas exitosamente',
      data: classes
    });
  } catch (error) {
    logger.error('Error obteniendo clases del maestro:', error);
    throw error;
  }
}));

// GET /api/teachers/:id/students
router.get('/:id/students', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const students = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            class: {
              teacherId: id
            }
          }
        },
        isActive: true
      },
      include: {
        family: true,
        enrollments: {
          include: {
            class: true,
            academicYear: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    res.json({
      message: 'Estudiantes obtenidos exitosamente',
      data: students
    });
  } catch (error) {
    logger.error('Error obteniendo estudiantes del maestro:', error);
    throw error;
  }
}));

export default router;


