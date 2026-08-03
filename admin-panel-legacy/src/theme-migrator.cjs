const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'pages');

const replacements = [
  { search: /bg-slate-900/g, replace: 'bg-white' },
  { search: /bg-slate-800/g, replace: 'bg-slate-50' },
  { search: /bg-slate-950/g, replace: 'bg-slate-50' },
  { search: /border-slate-800/g, replace: 'border-slate-200' },
  { search: /border-slate-700/g, replace: 'border-slate-200' },
  { search: /text-slate-400/g, replace: 'text-slate-500' },
  { search: /text-slate-300/g, replace: 'text-slate-600' },
  { search: /text-white/g, replace: 'text-slate-900' },
  { search: /hover:bg-slate-800/g, replace: 'hover:bg-slate-100' },
  { search: /hover:bg-slate-700/g, replace: 'hover:bg-slate-100' },
  // Fix specific buttons that should remain text-white
  { search: /text-slate-900 bg-teal-500/g, replace: 'text-white bg-teal-500' },
  { search: /text-slate-900 bg-amber-500/g, replace: 'text-white bg-amber-500' }
];

function processDirectory(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') && file !== 'Login.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
      });
      
      // Some buttons might have lost white text, restore it for bg-primary variants
      content = content.replace(/from-amber-500 to-amber-600(.*?)text-slate-900/g, 'from-amber-500 to-amber-600$1text-white');
      
      fs.writeFileSync(fullPath, content);
      console.log('Migrated', file);
    }
  });
}

processDirectory(directoryPath);
