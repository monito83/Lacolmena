import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdmin, requireFamilyAccess } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const createCommitmentSchema = z.object({
  familyId: z.string().uuid('ID de familia inválido'),
  studentId: z.string().uuid('ID de estudiante inválido'),
  academicYear: z.string().min(1, 'Año académico requerido'),
  agreedAmount: z.number().positive('El monto debe ser positivo'),
  suggestedAmount: z.number().positive().optional(),
  paymentFrequency: z.enum(['MENSUAL', 'TRIMESTRAL', 'ANUAL']).default('MENSUAL'),
  commitmentDate: z.string().transform(str => new Date(str)),
  reviewDate: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional()
});

const createPaymentSchema = z.object({
  familyId: z.string().uuid('ID de familia inválido'),
  studentId: z.string().uuid('ID de estudiante inválido'),
  commitmentId: z.string().uuid('ID de compromiso inválido').optional(),
  amount: z.number().positive('El monto debe ser positivo'),
  paymentDate: z.string().transform(str => new Date(str)),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA']),
  referenceNumber: z.string().optional(),
  monthPaid: z.string().optional(),
  notes: z.string().optional()
});

const createExpenseSchema = z.object({
  category: z.string().min(1, 'Categoría requerida'),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  amount: z.number().positive('El monto debe ser positivo'),
  expenseDate: z.string().transform(str => new Date(str)),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA']).optional(),
  vendor: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/financial/commitments
router.get('/commitments', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'ACTIVO', academicYear = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status };
    
    if (academicYear) {
      where.academicYear = academicYear;
    }

    const [commitments, total] = await Promise.all([
      prisma.fraternalCommitment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          family: true,
          student: true,
          monthlyPaymentStatus: {
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 12
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fraternalCommitment.count({ where })
    ]);

    res.json({
      message: 'Compromisos obtenidos exitosamente',
      data: commitments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error obteniendo compromisos:', error);
    throw error;
  }
}));

// POST /api/financial/commitments
router.post('/commitments', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const data = createCommitmentSchema.parse(req.body);

    // Verificar que la familia y estudiante existen
    const [family, student] = await Promise.all([
      prisma.family.findUnique({ where: { id: data.familyId } }),
      prisma.student.findUnique({ where: { id: data.studentId } })
    ]);

    if (!family) {
      throw createError('Familia no encontrada', 404);
    }

    if (!student) {
      throw createError('Estudiante no encontrado', 404);
    }

    // Verificar que el estudiante pertenece a la familia
    if (student.familyId !== data.familyId) {
      throw createError('El estudiante no pertenece a esa familia', 400);
    }

    const commitment = await prisma.fraternalCommitment.create({
      data,
      include: {
        family: true,
        student: true
      }
    });

    logger.info(`Compromiso fraterno creado para familia ${family.familyName}`);

    res.status(201).json({
      message: 'Compromiso fraterno creado exitosamente',
      data: commitment
    });
  } catch (error) {
    logger.error('Error creando compromiso:', error);
    throw error;
  }
}));

// GET /api/financial/payments
router.get('/payments', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, familyId = '', startDate = '', endDate = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (familyId) {
      where.familyId = familyId;
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          family: true,
          student: true,
          commitment: true
        },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      message: 'Pagos obtenidos exitosamente',
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error obteniendo pagos:', error);
    throw error;
  }
}));

// POST /api/financial/payments
router.post('/payments', authenticateToken, requireFamilyAccess, asyncHandler(async (req, res) => {
  try {
    const data = createPaymentSchema.parse(req.body);

    // Verificar que la familia y estudiante existen
    const [family, student] = await Promise.all([
      prisma.family.findUnique({ where: { id: data.familyId } }),
      prisma.student.findUnique({ where: { id: data.studentId } })
    ]);

    if (!family) {
      throw createError('Familia no encontrada', 404);
    }

    if (!student) {
      throw createError('Estudiante no encontrado', 404);
    }

    // Verificar que el estudiante pertenece a la familia
    if (student.familyId !== data.familyId) {
      throw createError('El estudiante no pertenece a esa familia', 400);
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        recordedBy: req.user!.id
      },
      include: {
        family: true,
        student: true,
        commitment: true
      }
    });

    logger.info(`Pago registrado para familia ${family.familyName}`);

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: payment
    });
  } catch (error) {
    logger.error('Error registrando pago:', error);
    throw error;
  }
}));

// GET /api/financial/expenses
router.get('/expenses', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', startDate = '', endDate = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          approver: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { expenseDate: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      message: 'Gastos obtenidos exitosamente',
      data: expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error obteniendo gastos:', error);
    throw error;
  }
}));

// POST /api/financial/expenses
router.post('/expenses', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const data = createExpenseSchema.parse(req.body);

    const expense = await prisma.expense.create({
      data: {
        ...data,
        approvedBy: req.user!.id
      },
      include: {
        approver: {
          include: {
            profile: true
          }
        }
      }
    });

    logger.info(`Gasto registrado: ${expense.description}`);

    res.status(201).json({
      message: 'Gasto registrado exitosamente',
      data: expense
    });
  } catch (error) {
    logger.error('Error registrando gasto:', error);
    throw error;
  }
}));

// GET /api/financial/dashboard
router.get('/dashboard', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Obtener métricas principales
    const [
      totalFamilies,
      totalStudents,
      totalTeachers,
      totalCommitments,
      currentMonthIncome,
      currentMonthExpenses,
      totalExpectedIncome,
      totalPaidIncome
    ] = await Promise.all([
      prisma.family.count({ where: { isActive: true } }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.fraternalCommitment.count({ where: { status: 'ACTIVO' } }),
      
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: new Date(`${currentYear}-${currentMonth}-01`),
            lt: new Date(`${currentYear}-${currentMonth + 1}-01`)
          }
        },
        _sum: { amount: true }
      }),
      
      prisma.expense.aggregate({
        where: {
          expenseDate: {
            gte: new Date(`${currentYear}-${currentMonth}-01`),
            lt: new Date(`${currentYear}-${currentMonth + 1}-01`)
          }
        },
        _sum: { amount: true }
      }),
      
      prisma.fraternalCommitment.aggregate({
        where: { status: 'ACTIVO' },
        _sum: { agreedAmount: true }
      }),
      
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`)
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Obtener pagos recientes
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      include: {
        family: true,
        student: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    // Obtener gastos recientes
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      include: {
        approver: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { expenseDate: 'desc' }
    });

    res.json({
      message: 'Dashboard financiero obtenido exitosamente',
      data: {
        metrics: {
          totalFamilies,
          totalStudents,
          totalTeachers,
          totalCommitments,
          currentMonthIncome: currentMonthIncome._sum.amount || 0,
          currentMonthExpenses: currentMonthExpenses._sum.amount || 0,
          totalExpectedIncome: totalExpectedIncome._sum.agreedAmount || 0,
          totalPaidIncome: totalPaidIncome._sum.amount || 0,
          pendingIncome: (totalExpectedIncome._sum.agreedAmount || 0) - (totalPaidIncome._sum.amount || 0)
        },
        recentPayments,
        recentExpenses
      }
    });
  } catch (error) {
    logger.error('Error obteniendo dashboard financiero:', error);
    throw error;
  }
}));

export default router;


