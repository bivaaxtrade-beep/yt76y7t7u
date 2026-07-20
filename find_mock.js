const fs = require('fs');
const content = fs.readFileSync('src/db/mysql-db.ts', 'utf-8');
console.log(content.includes('noOpDb'));
