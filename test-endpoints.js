async function test() {
  try {
    const loginRes = await fetch('https://legalitt-growth.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@legalitt.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed', await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in successfully');

    const headers = { Authorization: `Bearer ${token}` };

    const endpoints = [
      '/api/v1/admin/stats',
      '/api/v1/admin/advocates',
      '/api/v1/admin/users',
      '/api/v1/admin/earnings'
    ];

    for (const ep of endpoints) {
      const res = await fetch(`https://legalitt-growth.onrender.com${ep}`, { headers });
      if (!res.ok) {
        console.error(`[ERROR] ${ep} - Status: ${res.status} - ${await res.text()}`);
      } else {
        console.log(`[SUCCESS] ${ep} - Status: ${res.status}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
