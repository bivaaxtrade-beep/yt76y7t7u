import fs from 'fs';
let code = fs.readFileSync('src/api/routes.ts', 'utf8');
if (code.includes('INSERT OR IGNORE OR IGNORE')) {
  code = code.replace(/INSERT OR IGNORE OR IGNORE/g, 'INSERT OR IGNORE');
  fs.writeFileSync('src/api/routes.ts', code);
  console.log("Fixed double IGNORE");
} else {
  console.log("Checked, no double IGNORE");
}
