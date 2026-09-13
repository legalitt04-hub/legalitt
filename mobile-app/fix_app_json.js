const fs = require('fs');
const path = './app.json';
let data = JSON.parse(fs.readFileSync(path, 'utf-8'));

if (data.expo && data.expo.extra && data.expo.extra.eas && data.expo.extra.eas.projectId) {
  delete data.expo.extra.eas.projectId;
  
  if (Object.keys(data.expo.extra.eas).length === 0) {
    delete data.expo.extra.eas;
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Removed old projectId');
