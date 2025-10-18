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
    console.error('Error en API fraternal-commitments:', error);
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
    academic_year, 
    status,
    page = '1',
    limit = '50'
  } = query;

  try {
    let query = supabase
      .from('fraternal_commitments')
      .select(`
        *,
        families!inner(family_name, contact_email, contact_phone),
        students!inner(first_name, last_name, grade)
      `)
      .order('created_at', { ascending: false });

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

    if (academic_year) {
      query = query.eq('academic_year', academic_year);
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
    console.error('Error al obtener compromisos fraternos:', error);
    return res.status(500).json({ 
      error: 'Error al obtener compromisos fraternos',
      details: error.message 
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    family_id,
    student_id,
    academic_year,
    agreed_amount,
    suggested_amount,
    payment_frequency,
    commitment_date,
    review_date,
    notes
  } = req.body;

  // Validación
  if (!family_id || !student_id || !academic_year || !agreed_amount || !commitment_date) {
    return res.status(400).json({ 
      error: 'Datos requeridos faltantes: familia, estudiante, año académico, monto acordado y fecha de compromiso' 
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

    // Crear el compromiso fraterno
    const { data: newCommitment, error } = await supabase
      .from('fraternal_commitments')
      .insert({
        family_id,
        student_id,
        academic_year,
        agreed_amount: parseFloat(agreed_amount),
        suggested_amount: suggested_amount ? parseFloat(suggested_amount) : null,
        payment_frequency: payment_frequency || 'mensual',
        commitment_date,
        review_date,
        notes
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Nuevo compromiso fraterno creado para familia ${family.family_name}`);

    return res.status(201).json({
      message: 'Compromiso fraterno creado exitosamente',
      data: newCommitment
    });

  } catch (error: any) {
    console.error('Error al crear compromiso fraterno:', error);
    return res.status(500).json({ 
      error: 'Error al crear compromiso fraterno',
      details: error.message 
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;
  const {
    academic_year,
    agreed_amount,
    suggested_amount,
    payment_frequency,
    status,
    review_date,
    notes
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID de compromiso requerido' });
  }

  try {
    const updateData: any = {};

    if (academic_year !== undefined) updateData.academic_year = academic_year;
    if (agreed_amount !== undefined) updateData.agreed_amount = parseFloat(agreed_amount);
    if (suggested_amount !== undefined) updateData.suggested_amount = suggested_amount ? parseFloat(suggested_amount) : null;
    if (payment_frequency !== undefined) updateData.payment_frequency = payment_frequency;
    if (status !== undefined) updateData.status = status;
    if (review_date !== undefined) updateData.review_date = review_date;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedCommitment, error } = await supabase
      .from('fraternal_commitments')
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

    if (!updatedCommitment) {
      return res.status(404).json({ error: 'Compromiso fraterno no encontrado' });
    }

    console.log(`Compromiso fraterno actualizado: ${updatedCommitment.families.family_name}`);

    return res.status(200).json({
      message: 'Compromiso fraterno actualizado exitosamente',
      data: updatedCommitment
    });

  } catch (error: any) {
    console.error('Error al actualizar compromiso fraterno:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar compromiso fraterno',
      details: error.message 
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'ID de compromiso requerido' });
  }

  try {
    // Soft delete - cambiar status a 'finalizado'
    const { data: deactivatedCommitment, error } = await supabase
      .from('fraternal_commitments')
      .update({ status: 'finalizado' })
      .eq('id', id)
      .select(`
        *,
        families!inner(family_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!deactivatedCommitment) {
      return res.status(404).json({ error: 'Compromiso fraterno no encontrado' });
    }

    console.log(`Compromiso fraterno finalizado: ${deactivatedCommitment.families.family_name}`);

    return res.status(200).json({
      message: 'Compromiso fraterno finalizado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al finalizar compromiso fraterno:', error);
    return res.status(500).json({ 
      error: 'Error al finalizar compromiso fraterno',
      details: error.message 
    });
  }
}
