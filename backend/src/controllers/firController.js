const FIRDraft = require('../models/FIRDraft');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// Generate FIR Draft using AI
exports.generateFIR = async (req, res, next) => {
  try {
    // Support BOTH old structured format AND new simple format from mobile app
    const {
      // Old format (FIRFormScreen)
      type, incident, complainant, accused, witnesses, additionalInfo,
      // New simple format (FIRDraftScreen / FIRTypeSelector)
      incidentType, description, location, date, clientName,
    } = req.body;

    // Build a unified prompt regardless of format
    const resolvedType = type || incidentType || 'General Incident';
    const resolvedDesc = (incident?.description) || description || 'Not provided';
    const resolvedLocation = (incident?.location) || location || 'Not provided';
    const resolvedDate = (incident?.date) || date || new Date().toISOString().split('T')[0];
    const resolvedName = complainant?.name || clientName || 'Complainant';

    const prompt = `
As a legal expert in Indian Law, draft a formal First Information Report (FIR) based on these details:

TYPE OF INCIDENT: ${resolvedType}

INCIDENT DETAILS:
Date: ${resolvedDate}
Location: ${resolvedLocation}
Description: ${resolvedDesc}

COMPLAINANT: ${resolvedName}
${complainant?.age ? 'Age: ' + complainant.age : ''}
${complainant?.address ? 'Address: ' + complainant.address : ''}

${accused?.length ? 'ACCUSED:\n' + accused.map(a => `- ${a.name || 'Unknown'}, ${a.address || ''}`).join('\n') : ''}
${witnesses?.length ? 'WITNESSES:\n' + witnesses.map(w => `- ${w.name || 'Unknown'}, ${w.contact || ''}`).join('\n') : ''}
${additionalInfo ? 'ADDITIONAL INFO: ' + additionalInfo : ''}

INSTRUCTIONS:
1. Use formal legal language (IPC/BNS sections if applicable).
2. Structure it like an official FIR format used in Indian Police Stations.
3. Keep it detailed but concise.
4. Include all provided names and locations accurately.
    `.trim();

    const { callAI } = require('../services/aiService');
    const aiDraft = await callAI([{ role: 'user', content: prompt }]);

    // Save as draft
    const draft = await FIRDraft.create({
      user: req.user.id,
      type: resolvedType,
      incident: incident || { date: resolvedDate, location: resolvedLocation, description: resolvedDesc },
      complainant: complainant || { name: resolvedName },
      accused: accused || [],
      witnesses: witnesses || [],
      additionalInfo: additionalInfo || '',
      aiDraft,
    });

    res.status(201).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};


// Get User's Drafts
exports.getMyDrafts = async (req, res, next) => {
  try {
    const drafts = await FIRDraft.find({ user: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: drafts });
  } catch (err) {
    next(err);
  }
};

// Get Specific Draft
exports.getDraft = async (req, res, next) => {
  try {
    const draft = await FIRDraft.findOne({ _id: req.params.id, user: req.user.id });
    if (!draft) return next(new AppError('Draft not found', 404));
    res.json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

// Update Draft
exports.updateDraft = async (req, res, next) => {
  try {
    const draft = await FIRDraft.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!draft) return next(new AppError('Draft not found', 404));
    res.json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

// Delete Draft
exports.deleteDraft = async (req, res, next) => {
  try {
    const draft = await FIRDraft.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!draft) return next(new AppError('Draft not found', 404));
    res.json({ success: true, message: 'Draft deleted successfully' });
  } catch (err) {
    next(err);
  }
};
