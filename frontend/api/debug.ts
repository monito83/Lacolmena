import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Verificar variables de entorno (sin mostrar valores completos por seguridad)
    const envCheck = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlLength: process.env.SUPABASE_URL?.length || 0,
      supabaseKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      supabaseUrlStart: process.env.SUPABASE_URL?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
    };

    res.status(200).json({
      status: 'Debug info',
      envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
