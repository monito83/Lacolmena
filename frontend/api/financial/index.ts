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
    // Determinar el endpoint basado en la URL
    const url = req.url || '';
    
    if (url.includes('/transactions')) {
      return await handleTransactions(req, res, supabase);
    } else if (url.includes('/transaction-categories')) {
      return await handleTransactionCategories(req, res, supabase);
    } else if (url.includes('/cash-boxes')) {
      return await handleCashBoxes(req, res, supabase);
    } else if (url.includes('/fraternal-commitments')) {
      return await handleFraternalCommitments(req, res, supabase);
    } else if (url.includes('/payments')) {
      return await handlePayments(req, res, supabase);
    } else if (url.includes('/monthly-payment-status')) {
      return await handleMonthlyPaymentStatus(req, res, supabase);
    } else {
      return res.status(404).json({ error: 'Endpoint no encontrado' });
    }

  } catch (error: any) {
    console.error('Error en API financial:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

// ============================================
// TRANSACTIONS HANDLER
// ============================================
async function handleTransactions(req: VercelRequest, res: VercelResponse, supabase: any) {
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
      .select(`
        *,
        transaction_categories!inner(name, color),
        cash_boxes!inner(name, color)
      `)
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
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// TRANSACTION CATEGORIES HANDLER
// ============================================
async function handleTransactionCategories(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    const { search, is_active, page = '1', limit = '50' } = query;

    let queryBuilder = supabase
      .from('transaction_categories')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', is_active === 'true');
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    return res.status(200).json(data || []);

  } else if (method === 'POST') {
    const { name, description, color, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nombre de categoría requerido' });
    }

    const { data: newCategory, error } = await supabase
      .from('transaction_categories')
      .insert({
        name,
        description,
        color,
        is_active
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Categoría creada exitosamente',
      data: newCategory
    });

  } else if (method === 'PUT') {
    const { id } = query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de categoría requerido' });
    }

    const { data: updatedCategory, error } = await supabase
      .from('transaction_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    return res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory
    });

  } else if (method === 'DELETE') {
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de categoría requerido' });
    }

    const { error } = await supabase
      .from('transaction_categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: 'Categoría eliminada exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// CASH BOXES HANDLER
// ============================================
async function handleCashBoxes(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    const { search, is_active, page = '1', limit = '50' } = query;

    let queryBuilder = supabase
      .from('cash_boxes')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', is_active === 'true');
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    return res.status(200).json(data || []);

  } else if (method === 'POST') {
    const { name, description, color, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nombre de caja requerido' });
    }

    const { data: newCashBox, error } = await supabase
      .from('cash_boxes')
      .insert({
        name,
        description,
        color,
        is_active
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Caja creada exitosamente',
      data: newCashBox
    });

  } else if (method === 'PUT') {
    const { id } = query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de caja requerido' });
    }

    const { data: updatedCashBox, error } = await supabase
      .from('cash_boxes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedCashBox) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    return res.status(200).json({
      message: 'Caja actualizada exitosamente',
      data: updatedCashBox
    });

  } else if (method === 'DELETE') {
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de caja requerido' });
    }

    const { error } = await supabase
      .from('cash_boxes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: 'Caja eliminada exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// FRATERNAL COMMITMENTS HANDLER
// ============================================
async function handleFraternalCommitments(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    const { 
      search, 
      family_id, 
      student_id, 
      academic_year, 
      status,
      page = '1',
      limit = '50'
    } = query;

    let queryBuilder = supabase
      .from('fraternal_commitments')
      .select(`
        *,
        families!inner(family_name, contact_email, contact_phone),
        students!inner(first_name, last_name, grade)
      `)
      .order('created_at', { ascending: false });

    // Filtros
    if (search) {
      queryBuilder = queryBuilder.or(`families.family_name.ilike.%${search}%,students.first_name.ilike.%${search}%,students.last_name.ilike.%${search}%`);
    }

    if (family_id) {
      queryBuilder = queryBuilder.eq('family_id', family_id);
    }

    if (student_id) {
      queryBuilder = queryBuilder.eq('student_id', student_id);
    }

    if (academic_year) {
      queryBuilder = queryBuilder.eq('academic_year', academic_year);
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

  } else if (method === 'PUT') {
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

  } else if (method === 'DELETE') {
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de compromiso requerido' });
    }

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

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// PAYMENTS HANDLER
// ============================================
async function handlePayments(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
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

    let queryBuilder = supabase
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
      queryBuilder = queryBuilder.or(`families.family_name.ilike.%${search}%,students.first_name.ilike.%${search}%,students.last_name.ilike.%${search}%`);
    }

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

    if (payment_method) {
      queryBuilder = queryBuilder.eq('payment_method', payment_method);
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
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Actualizar el estado mensual correspondiente
    if (month_paid) {
      const [year, month] = month_paid.split('-');
      await updateMonthlyPaymentStatus(supabase, family_id, student_id, commitment_id, parseInt(year), parseInt(month), parseFloat(amount));
    }

    console.log(`Nuevo pago registrado para familia ${family.family_name}`);

    return res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: newPayment
    });

  } else if (method === 'PUT') {
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

  } else if (method === 'DELETE') {
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de pago requerido' });
    }

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
        supabase,
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

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// MONTHLY PAYMENT STATUS HANDLER
// ============================================
async function handleMonthlyPaymentStatus(req: VercelRequest, res: VercelResponse, supabase: any) {
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
      due_date,
      notes
    } = req.body;

    // Validación
    if (!family_id || !student_id || !commitment_id || !year || !month || !expected_amount) {
      return res.status(400).json({ 
        error: 'Datos requeridos faltantes: familia, estudiante, compromiso, año, mes y monto esperado' 
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

  } else if (method === 'PUT') {
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

    console.log(`Estado mensual eliminado`);

    return res.status(200).json({
      message: 'Estado mensual eliminado exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// Función auxiliar para actualizar el estado mensual de pagos
async function updateMonthlyPaymentStatus(
  supabase: any,
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
