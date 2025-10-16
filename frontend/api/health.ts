import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Sistema de Gestión La Colmena - Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: 'Supabase'
    });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
