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
      const { 
        search, 
        transaction_type, 
        cash_box, 
        category, 
        currency,
        start_date,
        end_date,
        page = '1',
        limit = '50'
      } = query;

      let queryBuilder = supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      // Filtros
      if (search) {
        queryBuilder = queryBuilder.or(`concept.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (transaction_type) {
        queryBuilder = queryBuilder.eq('transaction_type', transaction_type);
      }

      if (cash_box) {
        queryBuilder = queryBuilder.eq('cash_box', cash_box);
      }

      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (currency) {
        queryBuilder = queryBuilder.eq('currency', currency);
      }

      if (start_date) {
        queryBuilder = queryBuilder.gte('transaction_date', start_date);
      }

      if (end_date) {
        queryBuilder = queryBuilder.lte('transaction_date', end_date);
      }

      // Paginación
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        data: data || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          pages: Math.ceil((count || 0) / limitNum)
        }
      });

    } else if (method === 'POST') {
      const {
        concept,
        amount,
        currency,
        transaction_type,
        cash_box,
        category,
        description,
        transaction_date,
        reference_number
      } = req.body;

      // Validación
      if (!concept || !amount || !currency || !transaction_type || !transaction_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: concepto, monto, moneda, tipo de transacción y fecha' 
        });
      }

      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert({
          concept,
          amount: parseFloat(amount),
          currency,
          transaction_type,
          cash_box,
          category,
          description,
          transaction_date,
          reference_number
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Transacción creada exitosamente',
        data: newTransaction
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de transacción requerido' });
      }

      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }

      const { data: updatedTransaction, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      return res.status(200).json({
        message: 'Transacción actualizada exitosamente',
        data: updatedTransaction
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de transacción requerido' });
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Transacción eliminada exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API transactions:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
