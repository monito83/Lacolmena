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
    console.error('Error en API transactions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { search, transaction_type, cash_box, category, currency, start_date, end_date } = req.query;

  let query = supabase
    .from('transactions')
    .select(`
      *,
      cash_boxes!left(name, box_type, payment_method, currency)
    `)
    .order('transaction_date', { ascending: false });

  // Filtros
  if (search && typeof search === 'string') {
    query = query.or(`concept.ilike.%${search}%,description.ilike.%${search}%,reference_number.ilike.%${search}%`);
  }

  if (transaction_type && typeof transaction_type === 'string') {
    query = query.eq('transaction_type', transaction_type);
  }

  if (cash_box && typeof cash_box === 'string') {
    query = query.eq('cash_box', cash_box);
  }

  if (category && typeof category === 'string') {
    query = query.eq('category', category);
  }

  if (currency && typeof currency === 'string') {
    query = query.eq('currency', currency);
  }

  if (start_date && typeof start_date === 'string') {
    query = query.gte('transaction_date', start_date);
  }

  if (end_date && typeof end_date === 'string') {
    query = query.lte('transaction_date', end_date);
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
    return;
  }

  res.status(200).json(transactions || []);
}

async function handlePost(req: VercelRequest, res: VercelResponse, supabase: any) {
  const transactionData = req.body;

  // Validación de campos requeridos
  if (!transactionData.concept || !transactionData.amount || !transactionData.transaction_type || !transactionData.transaction_date) {
    res.status(400).json({ error: 'Datos requeridos faltantes: concepto, monto, tipo y fecha' });
    return;
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ 
      error: 'Error al crear transacción',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(201).json(transaction);
}

async function handlePut(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;
  const transactionData = req.body;

  if (!id) {
    res.status(400).json({ error: 'ID de transacción requerido' });
    return;
  }

  // Validación de campos requeridos
  if (!transactionData.concept || !transactionData.amount || !transactionData.transaction_type || !transactionData.transaction_date) {
    res.status(400).json({ error: 'Datos requeridos faltantes: concepto, monto, tipo y fecha' });
    return;
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(transactionData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(500).json({ 
      error: 'Error al actualizar transacción',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json(transaction);
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'ID de transacción requerido' });
    return;
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ 
      error: 'Error al eliminar transacción',
      details: error.message,
      code: error.code
    });
    return;
  }

  res.status(200).json({ message: 'Transacción eliminada exitosamente' });
}