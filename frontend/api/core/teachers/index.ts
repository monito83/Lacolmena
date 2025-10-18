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
      // Obtener maestros
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (error) {
        throw error;
      }

      return res.status(200).json(teachers || []);

    } else if (method === 'POST') {
      // Crear maestro
      const {
        first_name,
        last_name,
        phone,
        email,
        specializations,
        hire_date,
        address,
        assigned_grade,
        bio,
        photo_url
      } = req.body;

      // Validación
      if (!first_name || !last_name || !hire_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: nombre, apellido y fecha de contratación' 
        });
      }

      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        first_name,
        last_name,
        phone: phone && phone.trim() !== '' ? phone : undefined,
        email: email && email.trim() !== '' ? email : undefined,
        specializations: Array.isArray(specializations) ? specializations : [],
        hire_date,
        address: address && address.trim() !== '' ? address : undefined,
        assigned_grade: assigned_grade && assigned_grade.trim() !== '' ? assigned_grade : undefined,
        bio: bio && bio.trim() !== '' ? bio : undefined,
        photo_url: photo_url && photo_url.trim() !== '' ? photo_url : undefined
      };

      const { data: newTeacher, error } = await supabase
        .from('teachers')
        .insert(cleanData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Maestro creado exitosamente',
        data: newTeacher
      });

    } else if (method === 'PUT') {
      // Actualizar maestro
      const { id } = query;
      const {
        first_name,
        last_name,
        phone,
        email,
        specializations,
        hire_date,
        address,
        assigned_grade,
        bio,
        photo_url
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de maestro requerido' });
      }

      // Validación
      if (!first_name || !last_name || !hire_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: nombre, apellido y fecha de contratación' 
        });
      }

      // Limpiar campos vacíos antes de enviar
      const cleanData = {
        first_name,
        last_name,
        phone: phone && phone.trim() !== '' ? phone : undefined,
        email: email && email.trim() !== '' ? email : undefined,
        specializations: Array.isArray(specializations) ? specializations : [],
        hire_date,
        address: address && address.trim() !== '' ? address : undefined,
        assigned_grade: assigned_grade && assigned_grade.trim() !== '' ? assigned_grade : undefined,
        bio: bio && bio.trim() !== '' ? bio : undefined,
        photo_url: photo_url && photo_url.trim() !== '' ? photo_url : undefined
      };

      const { data: updatedTeacher, error } = await supabase
        .from('teachers')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedTeacher) {
        return res.status(404).json({ error: 'Maestro no encontrado' });
      }

      return res.status(200).json({
        message: 'Maestro actualizado exitosamente',
        data: updatedTeacher
      });

    } else if (method === 'DELETE') {
      // Desactivar maestro (soft delete)
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de maestro requerido' });
      }

      const { data: deactivatedTeacher, error } = await supabase
        .from('teachers')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!deactivatedTeacher) {
        return res.status(404).json({ error: 'Maestro no encontrado' });
      }

      return res.status(200).json({
        message: 'Maestro desactivado exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API teachers:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
