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
        .eq('is_active', true)
        .order('family_name', { ascending: true });

      if (error) {
        throw error;
      }

      return res.status(200).json(families || []);

    } else if (method === 'POST') {
      // Crear familia
      const {
        family_name,
        contact_email,
        contact_phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        notes
      } = req.body;

      if (!family_name) {
        return res.status(400).json({ error: 'Nombre de familia requerido' });
      }

      const { data: newFamily, error } = await supabase
        .from('families')
        .insert({
          family_name,
          contact_email,
          contact_phone,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          notes
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Familia creada exitosamente',
        data: newFamily
      });

    } else if (method === 'PUT') {
      // Actualizar familia
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de familia requerido' });
      }

      if (!updateData.family_name) {
        return res.status(400).json({ error: 'Nombre de familia requerido' });
      }

      const { data: updatedFamily, error } = await supabase
        .from('families')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedFamily) {
        return res.status(404).json({ error: 'Familia no encontrada' });
      }

      return res.status(200).json({
        message: 'Familia actualizada exitosamente',
        data: updatedFamily
      });

    } else if (method === 'DELETE') {
      // Desactivar familia (soft delete)
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de familia requerido' });
      }

      const { data: deactivatedFamily, error } = await supabase
        .from('families')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!deactivatedFamily) {
        return res.status(404).json({ error: 'Familia no encontrada' });
      }

      return res.status(200).json({
        message: 'Familia desactivada exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API families:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
