const fs = require('fs');
const path = './app.config.js';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(/owner:\s*"legalittgrowths-organization",\n?/g, '');
content = content.replace(/\/\/ EAS Project linking\s*eas:\s*\{\s*projectId:\s*'[^']+'\s*\}\n?/g, '');
content = content.replace(/eas:\s*\{\s*projectId:\s*'[^']+'\s*\}\n?/g, '');

fs.writeFileSync(path, content);
console.log('Fixed app.config.js');
