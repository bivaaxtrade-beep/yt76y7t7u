const fs = require('fs');
const content = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.map(')) {
    // Check next few lines for JSX tags without key
    let foundJSX = false;
    let foundKey = false;
    let jsxLine = -1;
    for (let j = 1; j <= 5; j++) {
      if (i + j >= lines.length) break;
      const line = lines[i + j];
      if (line.match(/<\w+/)) {
        foundJSX = true;
        jsxLine = i + j;
        if (line.includes('key=')) {
          foundKey = true;
        }
        // If the JSX spans multiple lines, check for key in next few lines too
        for(let k=1; k<=3; k++) {
            if(lines[i+j+k] && lines[i+j+k].includes('key=')) {
                foundKey = true;
            }
        }
        break; // found the first JSX tag
      }
    }
    if (foundJSX && !foundKey) {
      console.log(`Possible missing key at line ${jsxLine + 1} for map at line ${i + 1}`);
      for(let j=0; j<4; j++) {
          console.log(`  ${lines[i+j]}`);
      }
    }
  }
}
