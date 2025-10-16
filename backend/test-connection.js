const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Probando conexión con Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key (primeros 20 chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'No encontrada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Probando consulta a la base de datos...');
    
    // Probar una consulta simple
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error en la consulta:', error.message);
      return;
    }
    
    console.log('✅ Conexión exitosa!');
    console.log('📋 Datos recibidos:', data);
    
    // Probar otra consulta para verificar las tablas
    console.log('\n📊 Verificando tablas...');
    const { data: tables, error: tablesError } = await supabase
      .from('academic_years')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Error al verificar academic_years:', tablesError.message);
    } else {
      console.log('✅ Tabla academic_years accesible');
      console.log('📋 Año académico actual:', tables);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testConnection();


