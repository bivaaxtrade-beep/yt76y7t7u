const fs = require('fs');
const content = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf-8');
const lines = content.split('\n');
let insideRenderTrading = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const renderTradingEnvironment')) insideRenderTrading = true;
  if (!insideRenderTrading) continue;
  
  if (lines[i].includes('.map(')) {
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
        for(let k=1; k<=3; k++) {
            if(lines[i+j+k] && lines[i+j+k].includes('key=')) {
                foundKey = true;
            }
        }
        break;
      }
    }
    if (foundJSX && !foundKey) {
      console.log(`Possible missing key at line ${jsxLine + 1} for map at line ${i + 1}`);
    }
  }
}
