const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogin() {
  try {
    console.log('🔐 Probando login con usuario administrador...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@lacolmena.edu',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('📋 Usuario:', data.user.email);
      console.log('👤 Rol:', data.user.role);
      console.log('🔑 Token (primeros 20 chars):', data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Error en login:', data.message || data.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testLogin();
