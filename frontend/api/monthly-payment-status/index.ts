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
    console.error('Error en API monthly-payment-status:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
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

  try {
    let query = supabase
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

    if (status) {
      query = query.eq('status', status);
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
    console.error('Error al obtener estados de pago mensual:', error);
    return res.status(500).json({ 
      error: 'Error al obtener estados de pago mensual',
      details: error.message 
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    family_id,
    student_id,
    commitment_id,
    year,
    month,
    expected_amount,
    due_date,
    notes
  } = req.body;

  // Validación
  if (!family_id || !student_id || !commitment_id || !year || !month || !expected_amount) {
    return res.status(400).json({ 
      error: 'Datos requeridos faltantes: familia, estudiante, compromiso, año, mes y monto esperado' 
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

    // Verificar que no existe ya un registro para este mes
    const { data: existingStatus } = await supabase
      .from('monthly_payment_status')
      .select('id')
      .eq('family_id', family_id)
      .eq('student_id', student_id)
      .eq('commitment_id', commitment_id)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingStatus) {
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
        due_date,
        notes
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Nuevo estado mensual creado para familia ${family.family_name}`);

    return res.status(201).json({
      message: 'Estado mensual creado exitosamente',
      data: newStatus
    });

  } catch (error: any) {
    console.error('Error al crear estado mensual:', error);
    return res.status(500).json({ 
      error: 'Error al crear estado mensual',
      details: error.message 
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;
  const {
    expected_amount,
    paid_amount,
    status,
    due_date,
    notes
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID de estado mensual requerido' });
  }

  try {
    const updateData: any = {};

    if (expected_amount !== undefined) updateData.expected_amount = parseFloat(expected_amount);
    if (paid_amount !== undefined) updateData.paid_amount = parseFloat(paid_amount);
    if (status !== undefined) updateData.status = status;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedStatus, error } = await supabase
      .from('monthly_payment_status')
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

    if (!updatedStatus) {
      return res.status(404).json({ error: 'Estado mensual no encontrado' });
    }

    console.log(`Estado mensual actualizado para familia ${updatedStatus.families.family_name}`);

    return res.status(200).json({
      message: 'Estado mensual actualizado exitosamente',
      data: updatedStatus
    });

  } catch (error: any) {
    console.error('Error al actualizar estado mensual:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar estado mensual',
      details: error.message 
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'ID de estado mensual requerido' });
  }

  try {
    const { error } = await supabase
      .from('monthly_payment_status')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log(`Estado mensual eliminado`);

    return res.status(200).json({
      message: 'Estado mensual eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar estado mensual:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar estado mensual',
      details: error.message 
    });
  }
}
