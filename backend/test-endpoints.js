
const fetch = require('node-fetch');

async function testEndpoints() {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // I need a real token.
    // Wait, I can use the login flow first to get a token.

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@lacolmena.edu', password: 'admin123' })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Test Teachers
        console.log('\nTesting /api/teachers...');
        const teachersRes = await fetch('http://localhost:3001/api/teachers?is_active=true', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`Teachers Status: ${teachersRes.status}`);
        const teachersText = await teachersRes.text();
        try {
            console.log('Teachers Response:', JSON.parse(teachersText));
        } catch (e) {
            console.log('Teachers Response (Raw):', teachersText);
        }

        // 3. Test Families
        console.log('\nTesting /api/families...');
        const familiesRes = await fetch('http://localhost:3001/api/families', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`Families Status: ${familiesRes.status}`);
        const familiesText = await familiesRes.text();
        try {
            console.log('Families Response:', JSON.parse(familiesText));
        } catch (e) {
            console.log('Families Response (Raw):', familiesText);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEndpoints();
