const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminProfile() {
  try {
    console.log('👤 Creando perfil para usuario administrador...');
    
    // Primero obtener el usuario admin
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@lacolmena.edu')
      .limit(1);
    
    if (userError) {
      console.error('❌ Error al buscar usuario:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ Usuario administrador no encontrado');
      return;
    }
    
    const adminUser = users[0];
    console.log('✅ Usuario encontrado:', adminUser.email);
    
    // Verificar si ya tiene perfil
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error al verificar perfil:', profileError.message);
      return;
    }
    
    if (existingProfile && existingProfile.length > 0) {
      console.log('✅ El usuario ya tiene un perfil');
      return;
    }
    
    // Crear perfil
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: adminUser.id,
        first_name: 'Administrador',
        last_name: 'La Colmena',
        phone: '+54 11 1234-5678',
        address: 'Escuela La Colmena'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error al crear perfil:', createError.message);
      return;
    }
    
    console.log('✅ Perfil creado exitosamente:', newProfile);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createAdminProfile();


