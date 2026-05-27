const FIRDraft = require('../models/FIRDraft');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// Generate FIR Draft using AI
exports.generateFIR = async (req, res, next) => {
  try {
    const { type, incident, complainant, accused, witnesses, additionalInfo } = req.body;

    // Construct prompt for AI
    const prompt = `
      As a legal expert in Indian Law, draft a formal First Information Report (FIR) based on these details:
      
      TYPE OF INCIDENT: ${type}
      
      INCIDENT DETAILS:
      Date: ${incident.date}
      Time: ${incident.time}
      Location: ${incident.location}
      Description: ${incident.description}
      
      COMPLAINANT:
      Name: ${complainant.name}, Age: ${complainant.age}
      Address: ${complainant.address}
      
      ACCUSED DETAILS:
      ${accused.map(a => `- Name: ${a.name}, Address: ${a.address}, Desc: ${a.description}`).join('\n')}
      
      WITNESSES:
      ${witnesses.map(w => `- Name: ${w.name}, Contact: ${w.contact}`).join('\n')}
      
      ADDITIONAL INFO: ${additionalInfo || 'None'}
      
      INSTRUCTIONS:
      1. Use formal legal language (IPC/BNS sections if applicable).
      2. Structure it like an official FIR format used in Indian Police Stations.
      3. Keep it detailed but concise.
      4. Ensure all names and locations provided are included accurately.
    `;

    // We reuse the callAI logic from our AI service
    const { callAI } = require('../services/aiService');
    const aiDraft = await callAI([{ role: 'user', content: prompt }]);

    // Save as draft
    const draft = await FIRDraft.create({
      user: req.user.id,
      type, incident, complainant, accused, witnesses, additionalInfo,
      aiDraft
    });

    res.status(201).json({
      success: true,
      data: draft
    });
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
