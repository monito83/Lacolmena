import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { method, query } = req;

    if (method === 'GET') {
      // Obtener estudiantes
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          families!inner(family_name, contact_email, contact_phone)
        `)
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (error) {
        throw error;
      }

      return res.status(200).json(students || []);

    } else if (method === 'POST') {
      // Crear estudiante
      const {
        family_id,
        first_name,
        last_name,
        birth_date,
        gender,
        grade,
        enrollment_date,
        medical_notes,
        special_needs
      } = req.body;

      // Validación
      if (!first_name || !last_name || !family_id || !birth_date || !enrollment_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: nombre, apellido, familia, fecha de nacimiento y fecha de inscripción' 
        });
      }

      // Verificar que la familia existe
      const { data: family } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('id', family_id)
        .eq('is_active', true)
        .single();

      if (!family) {
        return res.status(404).json({ error: 'Familia no encontrada' });
      }

      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        family_id,
        first_name,
        last_name,
        birth_date,
        gender: gender && gender.trim() !== '' ? gender : undefined,
        grade: grade && grade.trim() !== '' ? grade : undefined,
        enrollment_date,
        medical_notes: medical_notes && medical_notes.trim() !== '' ? medical_notes : undefined,
        special_needs: special_needs && special_needs.trim() !== '' ? special_needs : undefined
      };

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert(cleanData)
        .select(`
          *,
          families!inner(family_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Estudiante creado exitosamente',
        data: newStudent
      });

    } else if (method === 'PUT') {
      // Actualizar estudiante
      const { id } = query;
      const {
        family_id,
        first_name,
        last_name,
        birth_date,
        gender,
        grade,
        enrollment_date,
        medical_notes,
        special_needs
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de estudiante requerido' });
      }

      // Validación
      if (!first_name || !last_name || !family_id || !birth_date || !enrollment_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: nombre, apellido, familia, fecha de nacimiento y fecha de inscripción' 
        });
      }

      // Verificar que la familia existe
      const { data: family } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('id', family_id)
        .eq('is_active', true)
        .single();

      if (!family) {
        return res.status(404).json({ error: 'Familia no encontrada' });
      }

      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        family_id,
        first_name,
        last_name,
        birth_date,
        gender: gender && gender.trim() !== '' ? gender : undefined,
        grade: grade && grade.trim() !== '' ? grade : undefined,
        enrollment_date,
        medical_notes: medical_notes && medical_notes.trim() !== '' ? medical_notes : undefined,
        special_needs: special_needs && special_needs.trim() !== '' ? special_needs : undefined
      };

      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(cleanData)
        .eq('id', id)
        .select(`
          *,
          families!inner(family_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (!updatedStudent) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      return res.status(200).json({
        message: 'Estudiante actualizado exitosamente',
        data: updatedStudent
      });

    } else if (method === 'DELETE') {
      // Desactivar estudiante (soft delete)
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de estudiante requerido' });
      }

      const { data: deactivatedStudent, error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!deactivatedStudent) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      return res.status(200).json({
        message: 'Estudiante desactivado exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API students:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
