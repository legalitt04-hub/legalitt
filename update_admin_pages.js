const fs = require('fs');

function transformFile(sourcePath, destPath, config) {
  let content = fs.readFileSync(sourcePath, 'utf-8');

  // Replace interface name
  content = content.replace(/interface Case \{/g, `interface ${config.modelName} {`);
  content = content.replace(/Case\[\]/g, `${config.modelName}[]`);
  content = content.replace(/Case \| null/g, `${config.modelName} | null`);
  content = content.replace(/Case \{/g, `${config.modelName} {`);
  
  // Replace API endpoints
  content = content.replace(/\/admin\/cases/g, `/admin/${config.endpoint}`);
  
  // Replace export default function Cases()
  content = content.replace(/export default function Cases\(\) \{/g, `export default function ${config.componentName}() {`);
  
  // Replace Cases title
  content = content.replace(/<h1 className="text-2xl font-bold text-slate-900">Cases \& Legal Notices<\/h1>/g, `<h1 className="text-2xl font-bold text-slate-900">${config.title}</h1>`);
  
  // Custom interface fields
  if (config.customFields) {
    content = content.replace(/status: string;/g, `status: string;\n${config.customFields}`);
  }

  // Handle differences in fields (e.g. FIRDraft uses user instead of client)
  if (config.userMapping) {
    content = content.replace(/c\.client\?/g, `(c.client || c.user)?`);
    content = content.replace(/c\.client\./g, `(c.client || c.user).`);
  }

  // Handle custom mapping for FIRDraft status
  if (config.modelName === 'FIRDraft') {
    // FIR draft status logic: draft, submitted, reviewed, completed
    content = content.replace(/status: c.status === 'open' \? 'pending_assignment' : c.status/, `status: c.status`);
    
    // Amount field removal
    content = content.replace(/<div className="text-right">[\s\S]*?c\.payment\?\.amount \+ c\.payment\?\.amount \* 0\.05[\s\S]*?<\/div>/g, '');
    content = content.replace(/Amount<\/th>/g, '');
    content = content.replace(/<td className="px-6 py-4 whitespace-nowrap text-right">[\s\S]*?c\.payment\?\.amount \+ c\.payment\?\.amount \* 0\.05[\s\S]*?<\/td>/g, '');
  }

  fs.writeFileSync(destPath, content);
  console.log(`Generated ${destPath}`);
}

const casesPath = '/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/Cases.tsx';

// 1. FIR Drafts
transformFile(
  casesPath,
  '/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/FIRDrafts.tsx',
  {
    modelName: 'FIRDraft',
    endpoint: 'fir-drafts',
    componentName: 'FIRDrafts',
    title: 'FIR Drafts',
    customFields: '  firType?: string;\n  incidentLocation?: string;\n  complainantName?: string;\n  user?: any;',
    userMapping: true
  }
);

// 2. Property Research
transformFile(
  casesPath,
  '/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/PropertyResearch.tsx',
  {
    modelName: 'PropertyResearch',
    endpoint: 'property-research',
    componentName: 'PropertyResearch',
    title: 'Property Research',
    customFields: '  propertyAddress?: string;\n  surveyNumber?: string;\n  user?: any;',
    userMapping: true
  }
);

// 3. Document Forensic
transformFile(
  casesPath,
  '/Users/krishsoni/Downloads/legalitt 2/admin-panel/src/pages/DocumentForensic.tsx',
  {
    modelName: 'DocumentForensic',
    endpoint: 'document-forensics', // Wait, the endpoint is getDocumentForensic? No, we didn't specify the route name earlier, let me double check the route!
    componentName: 'DocumentForensic',
    title: 'Document Forensic',
    customFields: '  user?: any;',
    userMapping: true
  }
);

