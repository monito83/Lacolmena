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

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test 1: Verificar conexión básica
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    // Test 2: Verificar si hay usuarios en auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    // Test 3: Verificar estructura de la tabla profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    res.status(200).json({
      status: 'Supabase connection test',
      tests: {
        connection: {
          success: !testError,
          error: testError?.message || null
        },
        users: {
          success: !usersError,
          count: users?.length || 0,
          error: usersError?.message || null,
          sampleUser: users?.[0]?.email || null
        },
        profiles: {
          success: !profilesError,
          error: profilesError?.message || null,
          hasData: profilesData && profilesData.length > 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en test-supabase:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

