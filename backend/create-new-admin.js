const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNewAdmin() {
  try {
    console.log('👤 Creando nuevo usuario administrador...');
    
    const email = 'admin@lacolmena.edu';
    const password = 'admin123';
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('🔐 Contraseña hasheada:', passwordHash.substring(0, 20) + '...');
    
    // Actualizar usuario existente
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash
      })
      .eq('email', email)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error al actualizar usuario:', updateError.message);
      return;
    }
    
    console.log('✅ Usuario actualizado:', updatedUser.email);
    
    // Probar login
    console.log('\n🔐 Probando login...');
    const testPassword = await bcrypt.compare(password, updatedUser.password_hash);
    console.log('✅ Contraseña válida:', testPassword);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createNewAdmin();


