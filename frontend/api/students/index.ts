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
    if (req.method === 'GET') {
      // Obtener estudiantes
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          families (
            id,
            family_name,
            contact_email,
            contact_phone
          )
        `)
        .order('first_name', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(students);

    } else if (req.method === 'POST') {
      // Crear estudiante
      const studentData = req.body;

      // Validación básica
      if (!studentData.first_name || !studentData.last_name || !studentData.family_id) {
        return res.status(400).json({ error: 'Datos requeridos faltantes' });
      }

      const { data: student, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(student);

    } else if (req.method === 'PUT') {
      // Actualizar estudiante
      const { id } = req.query;
      const studentData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de estudiante requerido' });
      }

      if (!studentData.first_name || !studentData.last_name || !studentData.family_id) {
        return res.status(400).json({ error: 'Datos requeridos faltantes' });
      }

      const { data: student, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(student);

    } else if (req.method === 'DELETE') {
      // Desactivar estudiante (soft delete)
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID de estudiante requerido' });
      }

      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ message: 'Estudiante desactivado exitosamente' });

    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en students:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
