import db, { run, get } from './src/db/mysql-db.ts';

async function test() {
  const uid = 'usr_test123';
  await run(`INSERT INTO users (uid, email, password) VALUES (?, ?, ?)`, [uid, 'test@test.com', 'pwd']);
  const user = await get(`SELECT * FROM users WHERE uid = ?`, [uid]);
  console.log('user:', user);
}
test();
