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
        family_id, 
        student_id, 
        commitment_id,
        year,
        month,
        status,
        page = '1',
        limit = '50'
      } = query;

      let queryBuilder = supabase
        .from('monthly_payment_status')
        .select(`
          *,
          families!inner(family_name, contact_email),
          students!inner(first_name, last_name, grade),
          fraternal_commitments!inner(academic_year, agreed_amount)
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      // Filtros
      if (family_id) {
        queryBuilder = queryBuilder.eq('family_id', family_id);
      }

      if (student_id) {
        queryBuilder = queryBuilder.eq('student_id', student_id);
      }

      if (commitment_id) {
        queryBuilder = queryBuilder.eq('commitment_id', commitment_id);
      }

      if (year) {
        queryBuilder = queryBuilder.eq('year', year);
      }

      if (month) {
        queryBuilder = queryBuilder.eq('month', month);
      }

      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
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
        family_id,
        student_id,
        commitment_id,
        year,
        month,
        expected_amount,
        paid_amount = 0,
        status = 'pendiente',
        due_date,
        notes
      } = req.body;

      // Validación
      if (!family_id || !student_id || !commitment_id || !year || !month || !expected_amount) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: familia, estudiante, compromiso, año, mes y monto esperado' 
        });
      }

      // Verificar que no existe ya un registro para este mes
      const { data: existing } = await supabase
        .from('monthly_payment_status')
        .select('id')
        .eq('family_id', family_id)
        .eq('student_id', student_id)
        .eq('commitment_id', commitment_id)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Ya existe un registro para este mes' });
      }

      // Crear el estado mensual
      const { data: newStatus, error } = await supabase
        .from('monthly_payment_status')
        .insert({
          family_id,
          student_id,
          commitment_id,
          year: parseInt(year),
          month: parseInt(month),
          expected_amount: parseFloat(expected_amount),
          paid_amount: parseFloat(paid_amount),
          status,
          due_date,
          notes
        })
        .select(`
          *,
          families!inner(family_name),
          students!inner(first_name, last_name),
          fraternal_commitments!inner(academic_year)
        `)
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        message: 'Estado mensual creado exitosamente',
        data: newStatus
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de estado mensual requerido' });
      }

      if (updateData.expected_amount) {
        updateData.expected_amount = parseFloat(updateData.expected_amount);
      }

      if (updateData.paid_amount) {
        updateData.paid_amount = parseFloat(updateData.paid_amount);
      }

      if (updateData.year) {
        updateData.year = parseInt(updateData.year);
      }

      if (updateData.month) {
        updateData.month = parseInt(updateData.month);
      }

      const { data: updatedStatus, error } = await supabase
        .from('monthly_payment_status')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          families!inner(family_name),
          students!inner(first_name, last_name),
          fraternal_commitments!inner(academic_year)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (!updatedStatus) {
        return res.status(404).json({ error: 'Estado mensual no encontrado' });
      }

      return res.status(200).json({
        message: 'Estado mensual actualizado exitosamente',
        data: updatedStatus
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de estado mensual requerido' });
      }

      const { error } = await supabase
        .from('monthly_payment_status')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Estado mensual eliminado exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API monthly-payment-status:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
