const fs = require('fs');
const path = './app.config.js';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(/ZEGO_APP_SIGN:\s*process.env.ZEGO_APP_SIGN\s*\|\|\s*'',\s*\}/, `ZEGO_APP_SIGN: process.env.ZEGO_APP_SIGN || '',
      eas: {
        projectId: 'c7cbf65c-ddc9-4089-afc6-30f135b6d5e8'
      }
    }`);

fs.writeFileSync(path, content);
console.log('Fixed app.config.js again');
