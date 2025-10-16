import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Esquemas de validación
const createStudentSchema = z.object({
  first_name: z.string().min(1, 'Nombre requerido'),
  last_name: z.string().min(1, 'Apellido requerido'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de nacimiento debe ser YYYY-MM-DD'),
  gender: z.enum(['masculino', 'femenino', 'otro']).optional(),
  family_id: z.string().uuid('ID de familia inválido'),
  grade: z.string().optional(),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de inscripción debe ser YYYY-MM-DD'),
  medical_notes: z.string().optional(),
  special_needs: z.string().optional(),
  photo_url: z.string().url().optional(),
  is_active: z.boolean().default(true)
});

const updateStudentSchema = createStudentSchema.partial();

// GET /api/students - Obtener todos los estudiantes
router.get('/', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', family_id, is_active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('students')
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone
        )
      `)
      .order('last_name', { ascending: true });

    // Filtros
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (family_id) {
      query = query.eq('family_id', family_id);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Paginación
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: students, error } = await query;

    if (error) {
      logger.error('Error al obtener estudiantes:', error);
      throw createError('Error al obtener estudiantes', 500);
    }

    res.status(200).json({
      success: true,
      data: students || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: students?.length || 0,
        pages: Math.ceil((students?.length || 0) / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error en GET /students:', error);
    throw error;
  }
}));

// GET /api/students/:id - Obtener estudiante específico
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone,
          address
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error al obtener estudiante:', error);
      throw createError('Estudiante no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    logger.error('Error en GET /students/:id:', error);
    throw error;
  }
}));

// POST /api/students - Crear nuevo estudiante
router.post('/', asyncHandler(async (req, res) => {
  try {
    const studentData = createStudentSchema.parse(req.body);

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert(studentData)
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone
        )
      `)
      .single();

    if (error) {
      logger.error('Error al crear estudiante:', error);
      throw createError('Error al crear estudiante', 500);
    }

    logger.info(`Nuevo estudiante creado: ${newStudent.first_name} ${newStudent.last_name} (ID: ${newStudent.id})`);
    res.status(201).json({
      success: true,
      data: newStudent,
      message: 'Estudiante creado exitosamente'
    });
  } catch (error) {
    logger.error('Error en POST /students:', error);
    throw error;
  }
}));

// PUT /api/students/:id - Actualizar estudiante
router.put('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateStudentSchema.parse(req.body);

    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone
        )
      `)
      .single();

    if (error) {
      logger.error('Error al actualizar estudiante:', error);
      throw createError('Error al actualizar estudiante', 500);
    }

    logger.info(`Estudiante actualizado: ${updatedStudent.first_name} ${updatedStudent.last_name} (ID: ${updatedStudent.id})`);
    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Estudiante actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error en PUT /students/:id:', error);
    throw error;
  }
}));

// DELETE /api/students/:id - Desactivar estudiante (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Desactivar el estudiante
    const { data: deactivatedStudent, error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, first_name, last_name')
      .single();

    if (error) {
      logger.error('Error al desactivar estudiante:', error);
      throw createError('Error al desactivar estudiante', 500);
    }

    logger.info(`Estudiante desactivado: ${deactivatedStudent.first_name} ${deactivatedStudent.last_name} (ID: ${deactivatedStudent.id})`);
    res.status(200).json({
      success: true,
      data: deactivatedStudent,
      message: 'Estudiante desactivado exitosamente'
    });
  } catch (error) {
    logger.error('Error en DELETE /students/:id:', error);
    throw error;
  }
}));

// GET /api/students/family/:familyId - Obtener estudiantes de una familia
router.get('/family/:familyId', asyncHandler(async (req, res) => {
  try {
    const { familyId } = req.params;

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone
        )
      `)
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      logger.error('Error al obtener estudiantes de familia:', error);
      throw createError('Error al obtener estudiantes de familia', 500);
    }

    res.status(200).json({
      success: true,
      data: students || []
    });
  } catch (error) {
    logger.error('Error en GET /students/family/:familyId:', error);
    throw error;
  }
}));

// GET /api/students/age/:age - Obtener estudiantes por edad
router.get('/age/:age', asyncHandler(async (req, res) => {
  try {
    const { age } = req.params;
    const targetYear = new Date().getFullYear() - Number(age);

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        families(
          id,
          family_name,
          contact_email,
          contact_phone
        )
      `)
      .gte('birth_date', `${targetYear}-01-01`)
      .lte('birth_date', `${targetYear}-12-31`)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      logger.error('Error al obtener estudiantes por edad:', error);
      throw createError('Error al obtener estudiantes por edad', 500);
    }

    res.status(200).json({
      success: true,
      data: students || []
    });
  } catch (error) {
    logger.error('Error en GET /students/age/:age:', error);
    throw error;
  }
}));

// GET /api/students/statistics - Obtener estadísticas de estudiantes
router.get('/statistics/overview', asyncHandler(async (req, res) => {
  try {
    // Total de estudiantes activos
    const { count: totalActive, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (totalError) {
      logger.error('Error al obtener total de estudiantes:', totalError);
      throw createError('Error al obtener estadísticas', 500);
    }

    // Estudiantes por género
    const { data: genderStats, error: genderError } = await supabase
      .from('students')
      .select('gender')
      .eq('is_active', true);

    if (genderError) {
      logger.error('Error al obtener estadísticas por género:', genderError);
      throw createError('Error al obtener estadísticas', 500);
    }

    // Agrupar por género
    const genderCount = genderStats?.reduce((acc: any, student: any) => {
      const gender = student.gender || 'no_especificado';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Estudiantes por rango de edad
    const { data: allStudents, error: ageError } = await supabase
      .from('students')
      .select('birth_date')
      .eq('is_active', true);

    if (ageError) {
      logger.error('Error al obtener fechas de nacimiento:', ageError);
      throw createError('Error al obtener estadísticas', 500);
    }

    const currentYear = new Date().getFullYear();
    const ageRanges = {
      '3-5': 0,   // Jardín de infantes
      '6-11': 0,  // Primaria
      '12-14': 0, // Secundaria básica
      '15-18': 0  // Secundaria superior
    };

    allStudents?.forEach(student => {
      if (student.birth_date) {
        const birthYear = new Date(student.birth_date).getFullYear();
        const age = currentYear - birthYear;
        
        if (age >= 3 && age <= 5) ageRanges['3-5']++;
        else if (age >= 6 && age <= 11) ageRanges['6-11']++;
        else if (age >= 12 && age <= 14) ageRanges['12-14']++;
        else if (age >= 15 && age <= 18) ageRanges['15-18']++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalActive: totalActive || 0,
        genderDistribution: genderCount || {},
        ageDistribution: ageRanges
      }
    });
  } catch (error) {
    logger.error('Error en GET /students/statistics/overview:', error);
    throw error;
  }
}));

export default router;