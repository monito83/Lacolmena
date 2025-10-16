const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    console.log('🚀 Iniciando aplicación del esquema a Supabase...');
    
    // Leer el archivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Aplicando ${commands.length} comandos SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            console.error(`❌ Error en comando ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Comando ${i + 1} ejecutado correctamente`);
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Error en comando ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Resumen:');
    console.log(`✅ Comandos exitosos: ${successCount}`);
    console.log(`❌ Comandos con error: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 ¡Esquema aplicado correctamente a Supabase!');
    } else {
      console.log('\n⚠️  Algunos comandos tuvieron errores. Revisa los logs arriba.');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

applySchema();


