fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test_api@test.com', password: 'password123' })
}).then(r => r.text()).then(console.log).catch(console.error);
