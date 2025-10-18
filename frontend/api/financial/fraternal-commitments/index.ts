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
          families!inner(family_name, contact_email),
          students!inner(first_name, last_name, grade)
        `)
        .order('commitment_date', { ascending: false });

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

      return res.status(201).json({
        message: 'Compromiso fraterno creado exitosamente',
        data: newCommitment
      });

    } else if (method === 'PUT') {
      const { id } = query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de compromiso requerido' });
      }

      if (updateData.agreed_amount) {
        updateData.agreed_amount = parseFloat(updateData.agreed_amount);
      }

      if (updateData.suggested_amount) {
        updateData.suggested_amount = parseFloat(updateData.suggested_amount);
      }

      const { data: updatedCommitment, error } = await supabase
        .from('fraternal_commitments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedCommitment) {
        return res.status(404).json({ error: 'Compromiso fraterno no encontrado' });
      }

      return res.status(200).json({
        message: 'Compromiso fraterno actualizado exitosamente',
        data: updatedCommitment
      });

    } else if (method === 'DELETE') {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: 'ID de compromiso requerido' });
      }

      const { error } = await supabase
        .from('fraternal_commitments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: 'Compromiso fraterno eliminado exitosamente'
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('Error en API fraternal-commitments:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
