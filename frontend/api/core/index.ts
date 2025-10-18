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
    
    if (url.includes('/families')) {
      return await handleFamilies(req, res, supabase);
    } else if (url.includes('/students')) {
      return await handleStudents(req, res, supabase);
    } else if (url.includes('/teachers')) {
      return await handleTeachers(req, res, supabase);
    } else {
      return res.status(404).json({ error: 'Endpoint no encontrado' });
    }

  } catch (error: any) {
    console.error('Error en API core:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

// ============================================
// FAMILIES HANDLER
// ============================================
async function handleFamilies(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    // Obtener familias
    const { data: families, error } = await supabase
      .from('families')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          grade,
          is_active
        )
      `)
      .eq('is_active', true)
      .order('family_name', { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json(families || []);

  } else if (method === 'POST') {
    // Crear familia
    const {
      family_name,
      contact_email,
      contact_phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      notes
    } = req.body;

    if (!family_name) {
      return res.status(400).json({ error: 'Nombre de familia requerido' });
    }

    const { data: newFamily, error } = await supabase
      .from('families')
      .insert({
        family_name,
        contact_email,
        contact_phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        notes
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Familia creada exitosamente',
      data: newFamily
    });

  } else if (method === 'PUT') {
    // Actualizar familia
    const { id } = query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de familia requerido' });
    }

    if (!updateData.family_name) {
      return res.status(400).json({ error: 'Nombre de familia requerido' });
    }

    const { data: updatedFamily, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedFamily) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    return res.status(200).json({
      message: 'Familia actualizada exitosamente',
      data: updatedFamily
    });

  } else if (method === 'DELETE') {
    // Desactivar familia (soft delete)
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de familia requerido' });
    }

    const { data: deactivatedFamily, error } = await supabase
      .from('families')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!deactivatedFamily) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    return res.status(200).json({
      message: 'Familia desactivada exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// STUDENTS HANDLER
// ============================================
async function handleStudents(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    // Obtener estudiantes
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        families!inner(family_name, contact_email, contact_phone)
      `)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json(students || []);

  } else if (method === 'POST') {
    // Crear estudiante
    const {
      family_id,
      first_name,
      last_name,
      birth_date,
      gender,
      grade,
      enrollment_date,
      medical_notes,
      special_needs
    } = req.body;

    // Validación
    if (!first_name || !last_name || !family_id || !birth_date || !enrollment_date) {
      return res.status(400).json({ 
        error: 'Datos requeridos faltantes: nombre, apellido, familia, fecha de nacimiento y fecha de inscripción' 
      });
    }

    // Verificar que la familia existe
    const { data: family } = await supabase
      .from('families')
      .select('id, family_name')
      .eq('id', family_id)
      .eq('is_active', true)
      .single();

    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    // Limpiar campos vacíos antes de enviar
    const cleanData = {
      family_id,
      first_name,
      last_name,
      birth_date,
      gender: gender && gender.trim() !== '' ? gender : undefined,
      grade: grade && grade.trim() !== '' ? grade : undefined,
      enrollment_date,
      medical_notes: medical_notes && medical_notes.trim() !== '' ? medical_notes : undefined,
      special_needs: special_needs && special_needs.trim() !== '' ? special_needs : undefined
    };

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert(cleanData)
      .select(`
        *,
        families!inner(family_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    console.log(`Nuevo estudiante creado: ${newStudent.first_name} ${newStudent.last_name}`);

    return res.status(201).json({
      message: 'Estudiante creado exitosamente',
      data: newStudent
    });

  } else if (method === 'PUT') {
    // Actualizar estudiante
    const { id } = query;
    const {
      family_id,
      first_name,
      last_name,
      birth_date,
      gender,
      grade,
      enrollment_date,
      medical_notes,
      special_needs
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de estudiante requerido' });
    }

    // Validación
    if (!first_name || !last_name || !family_id || !birth_date || !enrollment_date) {
      return res.status(400).json({ 
        error: 'Datos requeridos faltantes: nombre, apellido, familia, fecha de nacimiento y fecha de inscripción' 
      });
    }

    // Verificar que la familia existe
    const { data: family } = await supabase
      .from('families')
      .select('id, family_name')
      .eq('id', family_id)
      .eq('is_active', true)
      .single();

    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    // Limpiar campos vacíos antes de enviar
    const cleanData = {
      family_id,
      first_name,
      last_name,
      birth_date,
      gender: gender && gender.trim() !== '' ? gender : undefined,
      grade: grade && grade.trim() !== '' ? grade : undefined,
      enrollment_date,
      medical_notes: medical_notes && medical_notes.trim() !== '' ? medical_notes : undefined,
      special_needs: special_needs && special_needs.trim() !== '' ? special_needs : undefined
    };

    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update(cleanData)
      .eq('id', id)
      .select(`
        *,
        families!inner(family_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    console.log(`Estudiante actualizado: ${updatedStudent.first_name} ${updatedStudent.last_name}`);

    return res.status(200).json({
      message: 'Estudiante actualizado exitosamente',
      data: updatedStudent
    });

  } else if (method === 'DELETE') {
    // Desactivar estudiante (soft delete)
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de estudiante requerido' });
    }

    const { data: deactivatedStudent, error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)
      .select(`
        *,
        families!inner(family_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!deactivatedStudent) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    console.log(`Estudiante desactivado: ${deactivatedStudent.first_name} ${deactivatedStudent.last_name}`);

    return res.status(200).json({
      message: 'Estudiante desactivado exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// ============================================
// TEACHERS HANDLER
// ============================================
async function handleTeachers(req: VercelRequest, res: VercelResponse, supabase: any) {
  const { method, query } = req;

  if (method === 'GET') {
    // Obtener maestros
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json(teachers || []);

  } else if (method === 'POST') {
    // Crear maestro
    const {
      first_name,
      last_name,
      phone,
      email,
      specializations,
      hire_date,
      address,
      assigned_grade,
      bio,
      photo_url
    } = req.body;

    // Validación
    if (!first_name || !last_name || !hire_date) {
      return res.status(400).json({ 
        error: 'Datos requeridos faltantes: nombre, apellido y fecha de contratación' 
      });
    }

    // Limpiar campos vacíos antes de enviar
    const cleanData = {
      first_name,
      last_name,
      phone: phone && phone.trim() !== '' ? phone : undefined,
      email: email && email.trim() !== '' ? email : undefined,
      specializations: Array.isArray(specializations) ? specializations : [],
      hire_date,
      address: address && address.trim() !== '' ? address : undefined,
      assigned_grade: assigned_grade && assigned_grade.trim() !== '' ? assigned_grade : undefined,
      bio: bio && bio.trim() !== '' ? bio : undefined,
      photo_url: photo_url && photo_url.trim() !== '' ? photo_url : undefined
    };

    const { data: newTeacher, error } = await supabase
      .from('teachers')
      .insert(cleanData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Nuevo maestro creado: ${newTeacher.first_name} ${newTeacher.last_name}`);

    return res.status(201).json({
      message: 'Maestro creado exitosamente',
      data: newTeacher
    });

  } else if (method === 'PUT') {
    // Actualizar maestro
    const { id } = query;
    const {
      first_name,
      last_name,
      phone,
      email,
      specializations,
      hire_date,
      address,
      assigned_grade,
      bio,
      photo_url
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de maestro requerido' });
    }

    // Validación
    if (!first_name || !last_name || !hire_date) {
      return res.status(400).json({ 
        error: 'Datos requeridos faltantes: nombre, apellido y fecha de contratación' 
      });
    }

    // Limpiar campos vacíos antes de enviar
    const cleanData = {
      first_name,
      last_name,
      phone: phone && phone.trim() !== '' ? phone : undefined,
      email: email && email.trim() !== '' ? email : undefined,
      specializations: Array.isArray(specializations) ? specializations : [],
      hire_date,
      address: address && address.trim() !== '' ? address : undefined,
      assigned_grade: assigned_grade && assigned_grade.trim() !== '' ? assigned_grade : undefined,
      bio: bio && bio.trim() !== '' ? bio : undefined,
      photo_url: photo_url && photo_url.trim() !== '' ? photo_url : undefined
    };

    const { data: updatedTeacher, error } = await supabase
      .from('teachers')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Maestro no encontrado' });
    }

    console.log(`Maestro actualizado: ${updatedTeacher.first_name} ${updatedTeacher.last_name}`);

    return res.status(200).json({
      message: 'Maestro actualizado exitosamente',
      data: updatedTeacher
    });

  } else if (method === 'DELETE') {
    // Desactivar maestro (soft delete)
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'ID de maestro requerido' });
    }

    const { data: deactivatedTeacher, error } = await supabase
      .from('teachers')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!deactivatedTeacher) {
      return res.status(404).json({ error: 'Maestro no encontrado' });
    }

    console.log(`Maestro desactivado: ${deactivatedTeacher.first_name} ${deactivatedTeacher.last_name}`);

    return res.status(200).json({
      message: 'Maestro desactivado exitosamente'
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}
