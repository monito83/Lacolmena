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
        .from('payments')
        .select(`
          *,
          families!inner(family_name, contact_email),
          students!inner(first_name, last_name, grade),
          fraternal_commitments!inner(academic_year, agreed_amount)
        `)
        .order('payment_date', { ascending: false });

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
        amount,
        payment_date,
        payment_method,
        reference_number,
        month_paid,
        notes
      } = req.body;

      // Validación
      if (!family_id || !student_id || !amount || !payment_date) {
        return res.status(400).json({ 
          error: 'Datos requeridos faltantes: familia, estudiante, monto y fecha de pago' 
        });
      }

      // Verificar que la familia y estudiante existen
      const { data: family } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('id', family_id)
        .eq('is_active', true)
        .single();

      if (!family) {
        return res.status(404).json({ error: 'Familia no encontrada' });
      }

      const { data: student } = await supabase
        .from('students')
        .select('id, first_name, last_name, family_id')
        .eq('id', student_id)
        .eq('is_active', true)
        .single();

      if (!student) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Verificar que el estudiante pertenece a la familia
      if (student.family_id !== family_id) {
        return res.status(400).json({ error: 'El estudiante no pertenece a esa familia' });
      }

      // Crear el pago
      const { data: newPayment, error } = await supabase
        .from('payments')
        .insert({
          family_id,
          student_id,
          commitment_id,
          amount: parseFloat(amount),
          payment_date,
          payment_method,
          reference_number,
          month_paid,
          notes
        })
        .select(`
          *,
          families!inner(family_name),
          students!inner(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Actualizar el estado mensual de pago si se especifica
      if (month_paid && commitment_id) {
        const [year, month] = month_paid.split('-');
        await updateMonthlyPaymentStatus(supabase, family_id, student_id, commitment_id, parseInt(year), parseInt(month));
      }

      return res.status(201).json({
        message: 'Pago registrado exitosamente',
        data: newPayment
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de pago requerido' });
      }

      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }

      const { data: updatedPayment, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          families!inner(family_name),
          students!inner(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (!updatedPayment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      return res.status(200).json({
        message: 'Pago actualizado exitosamente',
        data: updatedPayment
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de pago requerido' });
      }

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Pago eliminado exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API payments:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

// Función auxiliar para actualizar el estado mensual de pago
async function updateMonthlyPaymentStatus(
  supabase: any, 
  familyId: string, 
  studentId: string, 
  commitmentId: string, 
  year: number, 
  month: number
) {
  try {
    // Calcular el monto total pagado para este mes
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('family_id', familyId)
      .eq('student_id', studentId)
      .eq('commitment_id', commitmentId)
      .eq('month_paid', `${year}-${month.toString().padStart(2, '0')}`);

    const paidAmount = payments?.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0) || 0;

    // Obtener el monto esperado del compromiso
    const { data: commitment } = await supabase
      .from('fraternal_commitments')
      .select('agreed_amount')
      .eq('id', commitmentId)
      .single();

    const expectedAmount = parseFloat(commitment?.agreed_amount || 0);

    // Determinar el estado
    let status = 'pendiente';
    if (paidAmount >= expectedAmount) {
      status = paidAmount > expectedAmount ? 'excedido' : 'completo';
    } else if (paidAmount > 0) {
      status = 'parcial';
    }

    // Actualizar o crear el registro de estado mensual
    await supabase
      .from('monthly_payment_status')
      .upsert({
        family_id: familyId,
        student_id: studentId,
        commitment_id: commitmentId,
        year,
        month,
        expected_amount: expectedAmount,
        paid_amount: paidAmount,
        status
      });

  } catch (error) {
    console.error('Error actualizando estado mensual:', error);
  }
}
