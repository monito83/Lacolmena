import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res, supabase);
        break;
      case 'POST':
        await handlePost(req, res, supabase);
        break;
      case 'PUT':
        await handlePut(req, res, supabase);
        break;
      case 'DELETE':
        await handleDelete(req, res, supabase);
        break;
      default:
        res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API transaction_categories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { search, is_active } = req.query;

  let query = supabase
    .from('transaction_categories')
    .select('*')
    .order('name', { ascending: true });

  if (search && typeof search === 'string') {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  const { data: categories, error } = await query;

  if (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
    return;
  }

  res.status(200).json(categories || []);
}

async function handlePost(req: VercelRequest, res: VercelResponse, supabase: any) {
  const categoryData = req.body;

  // Validación de campos requeridos
  if (!categoryData.name) {
    res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    return;
  }

  const { data: category, error } = await supabase
    .from('transaction_categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      error: 'Error al crear categoría',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(201).json(category);
}

async function handlePut(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;
  const categoryData = req.body;

  if (!id) {
    res.status(400).json({ error: 'ID de categoría requerido' });
    return;
  }

  // Validación de campos requeridos
  if (!categoryData.name) {
    res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    return;
  }

  const { data: category, error } = await supabase
    .from('transaction_categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ 
      error: 'Error al actualizar categoría',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json(category);
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'ID de categoría requerido' });
    return;
  }

  // En lugar de eliminar, marcamos como inactivo
  const { error } = await supabase
    .from('transaction_categories')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error al desactivar categoría:', error);
    res.status(500).json({ 
      error: 'Error al desactivar categoría',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json({ message: 'Categoría desactivada exitosamente' });
}
