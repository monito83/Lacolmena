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
      const { search, is_active, page = '1', limit = '50' } = query;

      let queryBuilder = supabase
        .from('cash_boxes')
        .select('*')
        .order('name', { ascending: true });

      if (search) {
        queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (is_active !== undefined) {
        queryBuilder = queryBuilder.eq('is_active', is_active === 'true');
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return res.status(200).json(data || []);

    } else if (method === 'POST') {
      const { name, description, color, is_active = true } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nombre de caja requerido' });
      }

      const { data: newCashBox, error } = await supabase
        .from('cash_boxes')
        .insert({
          name,
          description,
          color,
          is_active
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Caja creada exitosamente',
        data: newCashBox
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de caja requerido' });
      }

      const { data: updatedCashBox, error } = await supabase
        .from('cash_boxes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedCashBox) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }

      return res.status(200).json({
        message: 'Caja actualizada exitosamente',
        data: updatedCashBox
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de caja requerido' });
      }

      const { error } = await supabase
        .from('cash_boxes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Caja eliminada exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API cash-boxes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
