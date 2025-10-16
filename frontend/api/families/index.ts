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
      // Obtener familias
      const { data: families, error } = await supabase
        .from('families')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            grade,
            is_active
          )
        `)
        .order('family_name', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(families);

    } else if (req.method === 'POST') {
      // Crear familia
      const familyData = req.body;

      // Validación básica
      if (!familyData.family_name) {
        return res.status(400).json({ error: 'Nombre de familia requerido' });
      }

      const { data: family, error } = await supabase
        .from('families')
        .insert([familyData])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(family);

    } else if (req.method === 'PUT') {
      // Actualizar familia
      const { id } = req.query;
      const familyData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de familia requerido' });
      }

      if (!familyData.family_name) {
        return res.status(400).json({ error: 'Nombre de familia requerido' });
      }

      const { data: family, error } = await supabase
        .from('families')
        .update(familyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(family);

    } else if (req.method === 'DELETE') {
      // Desactivar familia (soft delete)
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID de familia requerido' });
      }

      const { error } = await supabase
        .from('families')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ message: 'Familia desactivada exitosamente' });

    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en families:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
