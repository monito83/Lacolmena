import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${method} no permitido` });
    }
  } catch (error: any) {
    console.error('Error en API payments:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { 
    search, 
    family_id, 
    student_id, 
    commitment_id,
    year,
    month,
    payment_method,
    page = '1',
    limit = '50'
  } = query;

  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        families!inner(family_name, contact_email),
        students!inner(first_name, last_name, grade),
        fraternal_commitments!inner(academic_year)
      `)
      .order('payment_date', { ascending: false });

    // Filtros
    if (search) {
      query = query.or(`families.family_name.ilike.%${search}%,students.first_name.ilike.%${search}%,students.last_name.ilike.%${search}%`);
    }

    if (family_id) {
      query = query.eq('family_id', family_id);
    }

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    if (commitment_id) {
      query = query.eq('commitment_id', commitment_id);
    }

    if (year) {
      query = query.eq('year', year);
    }

    if (month) {
      query = query.eq('month', month);
    }

    if (payment_method) {
      query = query.eq('payment_method', payment_method);
    }

    // Paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

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

  } catch (error: any) {
    console.error('Error al obtener pagos:', error);
    return res.status(500).json({ 
      error: 'Error al obtener pagos',
      details: error.message 
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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

  try {
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
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Actualizar el estado mensual correspondiente
    if (month_paid) {
      const [year, month] = month_paid.split('-');
      await updateMonthlyPaymentStatus(family_id, student_id, commitment_id, parseInt(year), parseInt(month), parseFloat(amount));
    }

    console.log(`Nuevo pago registrado para familia ${family.family_name}`);

    return res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: newPayment
    });

  } catch (error: any) {
    console.error('Error al registrar pago:', error);
    return res.status(500).json({ 
      error: 'Error al registrar pago',
      details: error.message 
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;
  const {
    amount,
    payment_date,
    payment_method,
    reference_number,
    month_paid,
    notes
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID de pago requerido' });
  }

  try {
    const updateData: any = {};

    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (payment_date !== undefined) updateData.payment_date = payment_date;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (reference_number !== undefined) updateData.reference_number = reference_number;
    if (month_paid !== undefined) updateData.month_paid = month_paid;
    if (notes !== undefined) updateData.notes = notes;

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

    console.log(`Pago actualizado para familia ${updatedPayment.families.family_name}`);

    return res.status(200).json({
      message: 'Pago actualizado exitosamente',
      data: updatedPayment
    });

  } catch (error: any) {
    console.error('Error al actualizar pago:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar pago',
      details: error.message 
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'ID de pago requerido' });
  }

  try {
    // Obtener información del pago antes de eliminarlo
    const { data: payment } = await supabase
      .from('payments')
      .select('family_id, student_id, commitment_id, month_paid, amount')
      .eq('id', id)
      .single();

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Eliminar el pago
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Actualizar el estado mensual correspondiente
    if (payment.month_paid) {
      const [year, month] = payment.month_paid.split('-');
      await updateMonthlyPaymentStatus(
        payment.family_id, 
        payment.student_id, 
        payment.commitment_id, 
        parseInt(year), 
        parseInt(month), 
        -payment.amount // Restar el monto eliminado
      );
    }

    console.log(`Pago eliminado`);

    return res.status(200).json({
      message: 'Pago eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar pago:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar pago',
      details: error.message 
    });
  }
}

// Función auxiliar para actualizar el estado mensual de pagos
async function updateMonthlyPaymentStatus(
  familyId: string, 
  studentId: string, 
  commitmentId: string, 
  year: number, 
  month: number, 
  amountChange: number
) {
  try {
    // Buscar o crear el registro mensual
    const { data: existingStatus } = await supabase
      .from('monthly_payment_status')
      .select('*')
      .eq('family_id', familyId)
      .eq('student_id', studentId)
      .eq('commitment_id', commitmentId)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingStatus) {
      // Actualizar el monto pagado
      const newPaidAmount = Math.max(0, existingStatus.paid_amount + amountChange);
      let newStatus = 'pendiente';
      
      if (newPaidAmount >= existingStatus.expected_amount) {
        newStatus = newPaidAmount > existingStatus.expected_amount ? 'excedido' : 'completo';
      } else if (newPaidAmount > 0) {
        newStatus = 'parcial';
      }

      await supabase
        .from('monthly_payment_status')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', existingStatus.id);
    }
  } catch (error) {
    console.error('Error al actualizar estado mensual:', error);
  }
}
