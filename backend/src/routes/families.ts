import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Esquemas de validación
const createFamilySchema = z.object({
  family_name: z.string().min(1, 'Nombre de familia requerido'),
  contact_email: z.string().email('Email inválido').optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true)
});

const updateFamilySchema = createFamilySchema.partial();

// GET /api/families - Obtener todas las familias
router.get('/', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', is_active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('families')
      .select('*')
      .order('family_name', { ascending: true });

    // Filtros
    if (search) {
      query = query.or(`family_name.ilike.%${search}%,contact_email.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Paginación
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: families, error } = await query;

    if (error) {
      logger.error('Error al obtener familias:', error);
      throw createError('Error al obtener familias', 500);
    }

    res.status(200).json({
      success: true,
      data: families || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: families?.length || 0,
        pages: Math.ceil((families?.length || 0) / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error en GET /families:', error);
    throw error;
  }
}));

// GET /api/families/:id - Obtener familia específica
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: family, error } = await supabase
      .from('families')
      .select(`
        *,
        student_enrollments(
          id,
          student_id,
          students(
            id,
            first_name,
            last_name,
            birth_date,
            is_active
          )
        ),
        fraternal_commitments(
          id,
          monthly_amount,
          status,
          start_date,
          end_date,
          notes,
          payments(
            id,
            amount,
            payment_date,
            status,
            notes
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error al obtener familia:', error);
      throw createError('Familia no encontrada', 404);
    }

    res.status(200).json({
      success: true,
      data: family
    });
  } catch (error) {
    logger.error('Error en GET /families/:id:', error);
    throw error;
  }
}));

// POST /api/families - Crear nueva familia
router.post('/', asyncHandler(async (req, res) => {
  try {
    const familyData = createFamilySchema.parse(req.body);

    const { data: newFamily, error } = await supabase
      .from('families')
      .insert(familyData)
      .select(`
        *,
        student_enrollments(
          id,
          student_id,
          students(
            id,
            first_name,
            last_name,
            birth_date,
            is_active
          )
        ),
        fraternal_commitments(
          id,
          monthly_amount,
          status,
          start_date,
          end_date,
          notes
        )
      `)
      .single();

    if (error) {
      logger.error('Error al crear familia:', error);
      throw createError('Error al crear familia', 500);
    }

    logger.info(`Nueva familia creada: ${newFamily.family_name} (ID: ${newFamily.id})`);
    res.status(201).json({
      success: true,
      data: newFamily,
      message: 'Familia creada exitosamente'
    });
  } catch (error) {
    logger.error('Error en POST /families:', error);
    throw error;
  }
}));

// PUT /api/families/:id - Actualizar familia
router.put('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateFamilySchema.parse(req.body);

    const { data: updatedFamily, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        student_enrollments(
          id,
          student_id,
          students(
            id,
            first_name,
            last_name,
            birth_date,
            is_active
          )
        ),
        fraternal_commitments(
          id,
          monthly_amount,
          status,
          start_date,
          end_date,
          notes
        )
      `)
      .single();

    if (error) {
      logger.error('Error al actualizar familia:', error);
      throw createError('Error al actualizar familia', 500);
    }

    logger.info(`Familia actualizada: ${updatedFamily.family_name} (ID: ${updatedFamily.id})`);
    res.status(200).json({
      success: true,
      data: updatedFamily,
      message: 'Familia actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error en PUT /families/:id:', error);
    throw error;
  }
}));

// DELETE /api/families/:id - Desactivar familia (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Por ahora, desactivar directamente sin verificar dependencias
    // TODO: Implementar verificación de estudiantes cuando tengamos la tabla students
    const { data: deactivatedFamily, error } = await supabase
      .from('families')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, family_name')
      .single();

    if (error) {
      logger.error('Error al desactivar familia:', error);
      throw createError('Error al desactivar familia', 500);
    }

    logger.info(`Familia desactivada: ${deactivatedFamily.family_name} (ID: ${deactivatedFamily.id})`);
    res.status(200).json({
      success: true,
      data: deactivatedFamily,
      message: 'Familia desactivada exitosamente'
    });
  } catch (error) {
    logger.error('Error en DELETE /families/:id:', error);
    throw error;
  }
}));

// GET /api/families/:id/commitments - Obtener compromisos fraternos de una familia
router.get('/:id/commitments', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: commitments, error } = await supabase
      .from('fraternal_commitments')
      .select(`
        *,
        payments(
          id,
          amount,
          payment_date,
          status,
          notes
        )
      `)
      .eq('family_id', id)
      .order('start_date', { ascending: false });

    if (error) {
      logger.error('Error al obtener compromisos fraternos:', error);
      throw createError('Error al obtener compromisos fraternos', 500);
    }

    res.status(200).json({
      success: true,
      data: commitments
    });
  } catch (error) {
    logger.error('Error en GET /families/:id/commitments:', error);
    throw error;
  }
}));

// GET /api/families/:id/financial-status - Obtener estado financiero de una familia
router.get('/:id/financial-status', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Obtener compromisos activos
    const { data: commitments, error: commitmentsError } = await supabase
      .from('fraternal_commitments')
      .select(`
        *,
        students(
          id,
          first_name,
          last_name
        )
      `)
      .eq('family_id', id)
      .eq('status', 'active')
      .or(`start_date.lte.${year}-12-31,end_date.gte.${year}-01-01`);

    if (commitmentsError) {
      logger.error('Error al obtener compromisos:', commitmentsError);
      throw createError('Error al obtener compromisos fraternos', 500);
    }

    // Obtener pagos del año
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('family_id', id)
      .gte('payment_date', `${year}-01-01`)
      .lte('payment_date', `${year}-12-31`)
      .order('payment_date', { ascending: false });

    if (paymentsError) {
      logger.error('Error al obtener pagos:', paymentsError);
      throw createError('Error al obtener pagos', 500);
    }

    // Calcular totales
    const totalExpected = commitments?.reduce((sum, c) => sum + (c.monthly_amount || 0), 0) || 0;
    const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const pendingAmount = totalExpected - totalPaid;

    res.status(200).json({
      success: true,
      data: {
        totalExpected,
        totalPaid,
        pendingAmount,
        commitments,
        recentPayments: payments?.slice(0, 10) || []
      }
    });
  } catch (error) {
    logger.error('Error en GET /families/:id/financial-status:', error);
    throw error;
  }
}));

export default router;