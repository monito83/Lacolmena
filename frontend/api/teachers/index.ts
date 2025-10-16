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
    console.error('Error en API teachers:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { search, is_active } = req.query;

  let query = supabase
    .from('teachers')
    .select('*')
    .order('first_name', { ascending: true });

  if (search && typeof search === 'string') {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  const { data: teachers, error } = await query;

  if (error) {
    console.error('Error al obtener maestros:', error);
    res.status(500).json({ error: 'Error al obtener maestros' });
    return;
  }

  res.status(200).json(teachers || []);
}

async function handlePost(req: VercelRequest, res: VercelResponse, supabase: any) {
  const teacherData = req.body;

  // Validación básica
  if (!teacherData.first_name || !teacherData.last_name || !teacherData.email) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  const { data: teacher, error } = await supabase
    .from('teachers')
    .insert([teacherData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear maestro:', error);
    res.status(500).json({ error: 'Error al crear maestro' });
    return;
  }

  res.status(201).json(teacher);
}

async function handlePut(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;
  const teacherData = req.body;

  if (!id) {
    res.status(400).json({ error: 'ID de maestro requerido' });
    return;
  }

  const { data: teacher, error } = await supabase
    .from('teachers')
    .update(teacherData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar maestro:', error);
    res.status(500).json({ error: 'Error al actualizar maestro' });
    return;
  }

  res.status(200).json(teacher);
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'ID de maestro requerido' });
    return;
  }

  // En lugar de eliminar, marcamos como inactivo
  const { error } = await supabase
    .from('teachers')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error al desactivar maestro:', error);
    res.status(500).json({ error: 'Error al desactivar maestro' });
    return;
  }

  res.status(200).json({ message: 'Maestro desactivado exitosamente' });
}
