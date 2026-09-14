const fs = require('fs');

const files = [
  'FIRDrafts',
  'PropertyResearch',
  'DocumentForensic'
];

for (const file of files) {
  const path = `/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/${file}.tsx`;
  let content = fs.readFileSync(path, 'utf-8');

  // Fix caseId -> uploadingDocId that I broke
  content = content.replace(/\$\{uploadingDocId\}/g, '${uploadModalCase._id}');
  
  // Fix CaseCard prop type 
  const modelName = file === 'FIRDrafts' ? 'FIRDraft' : file;
  content = content.replace(/c: Case/g, `c: ${modelName}`);
  
  fs.writeFileSync(path, content);
}
console.log('Fixed TS errors 2');
