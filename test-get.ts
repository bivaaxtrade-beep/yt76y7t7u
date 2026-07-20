import { get } from './src/db/mysql-db.ts';

async function test() {
  const user = await get(`SELECT * FROM users WHERE uid = ?`, ['non-existent']);
  console.log('user:', user);
  console.log('isNull:', user === null);
  console.log('isUndefined:', user === undefined);
}
test();
