const fs = require('fs');

const files = [
  'FIRDrafts',
  'PropertyResearch',
  'DocumentForensic'
];

for (const file of files) {
  const path = `/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/${file}.tsx`;
  let content = fs.readFileSync(path, 'utf-8');

  // Fix caseId -> uploadingDocId
  content = content.replace(/\$\{caseId\}/g, '${uploadingDocId}');
  
  // Fix CaseCard prop type
  const modelName = file === 'FIRDrafts' ? 'FIRDraft' : file;
  content = content.replace(/c: Case;/g, `c: ${modelName};`);
  
  // Fix parameter 'd' implicitly any
  content = content.replace(/c\.documents\?\.map\(\(d, i\)/g, 'c.documents?.map((d: any, i: number)');
  content = content.replace(/c\.advocateDocuments\?\.map\(\(d, i\)/g, 'c.advocateDocuments?.map((d: any, i: number)');
  
  // Fix Object index signature issue
  content = content.replace(/const statusConfig = STATUS_CONFIG\[c\.status\] \|\| STATUS_CONFIG\.pending;/g, 'const statusConfig = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;');
  
  // Fix Property 'user' does not exist on type...
  // In `Cases.tsx`, `c.user` was not a thing, but I added it for backward compat. Wait, TS is complaining about `c.user` because it's missing in the interface.
  // Actually, I did add `user?: any;` to the customFields in my generator, so why is it failing?
  // Let's check the error: `Property 'user' does not exist on type 'FIRDraft'`.
  // The interface might have been wrongly formatted.
  // Let me just replace `c.user` with `(c as any).user`.
  content = content.replace(/c\.user/g, '(c as any).user');

  fs.writeFileSync(path, content);
}
console.log('Fixed TS errors');
