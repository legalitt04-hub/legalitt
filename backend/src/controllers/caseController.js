const Case = require('../models/Case');
const Advocate = require('../models/Advocate');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');

// POST /api/cases
exports.createCase = async (req, res, next) => {
  try {
    const { title, description, caseNumber, courtName, clientId, status } = req.body;

    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const client = await User.findById(clientId);
    if (!client) return next(new AppError('Client user not found.', 404));

    const newCase = await Case.create({
      title,
      description,
      caseNumber,
      courtName,
      client: clientId,
      advocate: advocate._id,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/cases
exports.getCases = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    // Find advocate or client ID
    let filter = {};
    if (req.user.role === 'advocate') {
      const advocate = await Advocate.findOne({ user: req.user._id });
      if (!advocate) return next(new AppError('Advocate profile not found.', 404));
      filter.advocate = advocate._id;
    } else {
      filter.client = req.user._id;
    }

    if (status) filter.status = status;

    const cases = await Case.find(filter)
      .populate('client', 'name email phone avatar')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email avatar' } })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: cases
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/cases/:id
exports.getCase = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id)
      .populate('client', 'name email phone avatar city state')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email phone avatar' } })
      .lean();

    if (!legalCase) return next(new AppError('Case not found.', 404));

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/cases/:id
exports.updateCase = async (req, res, next) => {
  try {
    const { title, description, caseNumber, courtName, status } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    if (title !== undefined) legalCase.title = title;
    if (description !== undefined) legalCase.description = description;
    if (caseNumber !== undefined) legalCase.caseNumber = caseNumber;
    if (courtName !== undefined) legalCase.courtName = courtName;
    if (status !== undefined) legalCase.status = status;

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/timeline
exports.addTimelineEvent = async (req, res, next) => {
  try {
    const { title, description, date, status } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.timeline.push({
      title,
      description,
      date: new Date(date),
      status: status || 'scheduled'
    });

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/notes
exports.addCaseNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.notes.push({ note });

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/documents
exports.addCaseDocument = async (req, res, next) => {
  try {
    const { name, url } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.documents.push({ name, url });

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};
