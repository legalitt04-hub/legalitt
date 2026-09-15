const fs = require('fs');
const path = require('path');
const dir = '/Users/krishsoni/Downloads/legalitt 2/backend/src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

let updatedFiles = 0;

files.forEach(f => {
  const filePath = path.join(dir, f);
  let code = fs.readFileSync(filePath, 'utf8');
  let newCode = code;
  
  let i = 0;
  while (true) {
    i = newCode.indexOf('.find(', i);
    if (i === -1) break;
    
    // Find the matching closing parenthesis
    let openParens = 0;
    let j = i + 5; // index of '('
    let found = false;
    
    while (j < newCode.length) {
      if (newCode[j] === '(') openParens++;
      else if (newCode[j] === ')') {
        openParens--;
        if (openParens === 0) {
          found = true;
          break;
        }
      }
      j++;
    }
    
    if (found) {
      // Check if it already has .lean() immediately after or anywhere in the chain before a semicolon or newline
      // To be safe, just check the next 15 chars for .lean()
      const afterFind = newCode.substring(j + 1, j + 15);
      if (afterFind.startsWith('.lean()')) {
        i = j + 8;
        continue;
      }
      
      // Look ahead to make sure it doesn't have .lean() elsewhere in the chain
      // Just check the rest of the line
      const restOfLine = newCode.substring(j + 1).split('\n')[0];
      if (restOfLine.includes('.lean()')) {
        i = j + 1;
        continue;
      }

      // Insert .lean() after the closing parenthesis
      newCode = newCode.substring(0, j + 1) + '.lean()' + newCode.substring(j + 1);
      i = j + 8; // skip past .lean()
    } else {
      i += 6;
    }
  }
  
  if (code !== newCode) {
    fs.writeFileSync(filePath, newCode);
    console.log('✅ Added .lean() to ' + f);
    updatedFiles++;
  }
});

console.log(`\nDone! Updated ${updatedFiles} files.`);
