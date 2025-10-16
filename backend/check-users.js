const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log('👥 Verificando usuarios en la base de datos...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*)
      `)
      .limit(10);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Usuarios encontrados:', users.length);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuario:`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Rol: ${user.role}`);
      console.log(`   - Activo: ${user.is_active}`);
      console.log(`   - Nombre: ${user.user_profiles?.[0]?.first_name || 'N/A'} ${user.user_profiles?.[0]?.last_name || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkUsers();


