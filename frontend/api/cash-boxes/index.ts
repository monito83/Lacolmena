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
    console.error('Error en API cash_boxes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { search, is_active } = req.query;

  let query = supabase
    .from('cash_boxes')
    .select('*')
    .order('name', { ascending: true });

  if (search && typeof search === 'string') {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  const { data: cashBoxes, error } = await query;

  if (error) {
    console.error('Error al obtener cajas:', error);
    res.status(500).json({ error: 'Error al obtener cajas' });
    return;
  }

  res.status(200).json(cashBoxes || []);
}

async function handlePost(req: VercelRequest, res: VercelResponse, supabase: any) {
  const cashBoxData = req.body;

  // Validación de campos requeridos
  if (!cashBoxData.name) {
    res.status(400).json({ error: 'El nombre de la caja es requerido' });
    return;
  }

  const { data: cashBox, error } = await supabase
    .from('cash_boxes')
    .insert([cashBoxData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear caja:', error);
    res.status(500).json({ 
      error: 'Error al crear caja',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(201).json(cashBox);
}

async function handlePut(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;
  const cashBoxData = req.body;

  if (!id) {
    res.status(400).json({ error: 'ID de caja requerido' });
    return;
  }

  // Validación de campos requeridos
  if (!cashBoxData.name) {
    res.status(400).json({ error: 'El nombre de la caja es requerido' });
    return;
  }

  const { data: cashBox, error } = await supabase
    .from('cash_boxes')
    .update(cashBoxData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar caja:', error);
    res.status(500).json({ 
      error: 'Error al actualizar caja',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json(cashBox);
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'ID de caja requerido' });
    return;
  }

  // En lugar de eliminar, marcamos como inactivo
  const { error } = await supabase
    .from('cash_boxes')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error al desactivar caja:', error);
    res.status(500).json({ 
      error: 'Error al desactivar caja',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json({ message: 'Caja desactivada exitosamente' });
}

