const fs = require('fs');
const path = '/Users/krishsoni/Downloads/legalitt 2/backend/src/controllers/adminModuleController.js';
let content = fs.readFileSync(path, 'utf-8');

const newGetFIRDrafts = `exports.getFIRDrafts = async (req, res, next) => {
  try {
    const FIRDraft = require('../models/FIRDraft');
    const drafts = await FIRDraft.find()
      .populate('user', 'name email phone')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email avatar' } })
      .sort({ createdAt: -1 });
      
    // Map to Case-like interface
    const mapped = drafts.map(d => ({
      _id: d._id,
      caseNumber: \`FIR-\${d._id.toString().slice(-6).toUpperCase()}\`,
      title: d.type ? d.type.toUpperCase() + ' FIR' : 'General FIR',
      client: d.user || {},
      user: d.user, // for backward compat
      advocate: d.advocate,
      status: d.status || 'draft',
      serviceType: 'fir_draft',
      priority: 'medium',
      payment: null,
      description: d.incident?.description || d.additionalInfo || '',
      notes: d.additionalInfo || '',
      documents: d.evidence || [],
      adminDocuments: d.adminDocuments || [],
      advocateDocuments: d.advocateDocuments || [],
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      // Custom FIR fields
      firType: d.type,
      incidentLocation: d.incident?.location || '',
      complainantName: d.complainant?.name || '',
      incidentDate: d.incident?.date || ''
    }));

    res.json({ success: true, data: mapped });
  } catch (err) { next(err); }
};`;

content = content.replace(/exports\.getFIRDrafts = async \(req, res, next\) => \{[\s\S]*?res\.json\(\{ success: true, data: drafts \}\);\n  \} catch \(err\) \{ next\(err\); \}\n\};/, newGetFIRDrafts);

fs.writeFileSync(path, content);
console.log('Fixed getFIRDrafts');
