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
        .from('transaction_categories')
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
        return res.status(400).json({ error: 'Nombre de categoría requerido' });
      }

      const { data: newCategory, error } = await supabase
        .from('transaction_categories')
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
        message: 'Categoría creada exitosamente',
        data: newCategory
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de categoría requerido' });
      }

      const { data: updatedCategory, error } = await supabase
        .from('transaction_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      return res.status(200).json({
        message: 'Categoría actualizada exitosamente',
        data: updatedCategory
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de categoría requerido' });
      }

      const { error } = await supabase
        .from('transaction_categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Categoría eliminada exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API transaction-categories:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
