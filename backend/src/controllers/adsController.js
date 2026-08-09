// src/controllers/adsController.js
const Advertisement = require('../models/Advertisement');
const { AppError } = require('../middlewares/errorHandler');

// GET /api/v1/admin/ads
exports.getAds = async (req, res, next) => {
  try {
    const { status, placement, adType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (placement) filter.placement = placement;
    if (adType) filter.adType = adType;

    const skip = (Number(page) - 1) * Number(limit);
    const [ads, total] = await Promise.all([
      Advertisement.find(filter).populate('createdBy', 'name email').sort({ priority: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Advertisement.countDocuments(filter),
    ]);

    res.json({ success: true, data: ads, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// POST /api/v1/admin/ads
exports.createAd = async (req, res, next) => {
  try {
    const ad = await Advertisement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: ad });
  } catch (err) { next(err); }
};

// PATCH /api/v1/admin/ads/:id
exports.updateAd = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ad) return next(new AppError('Ad not found.', 404));
    res.json({ success: true, data: ad });
  } catch (err) { next(err); }
};

// DELETE /api/v1/admin/ads/:id
exports.deleteAd = async (req, res, next) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);
    if (!ad) return next(new AppError('Ad not found.', 404));
    res.json({ success: true, message: 'Ad deleted.' });
  } catch (err) { next(err); }
};

// PATCH /api/v1/admin/ads/:id/toggle — pause / resume
exports.toggleAdStatus = async (req, res, next) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return next(new AppError('Ad not found.', 404));
    ad.status = ad.status === 'active' ? 'paused' : 'active';
    await ad.save();
    res.json({ success: true, data: ad });
  } catch (err) { next(err); }
};

// POST /api/v1/admin/ads/:id/record — record impression/click (called from mobile app)
exports.recordEvent = async (req, res, next) => {
  try {
    const { event } = req.body; // 'impression' | 'click' | 'conversion'
    const update = {};
    if (event === 'impression') update.$inc = { impressions: 1 };
    else if (event === 'click') update.$inc = { clicks: 1 };
    else if (event === 'conversion') update.$inc = { conversions: 1 };
    else return next(new AppError('Invalid event type.', 400));

    await Advertisement.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /api/v1/ads/active — public endpoint for mobile app to fetch ads
exports.getActiveAds = async (req, res, next) => {
  try {
    const { placement } = req.query;
    const now = new Date();
    const filter = {
      status: 'active',
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    };
    if (placement && placement !== 'all') {
      filter.$or = [{ placement }, { placement: 'all' }];
      delete filter.$or; // reset
      filter.placement = { $in: [placement, 'all'] };
    }
    const ads = await Advertisement.find(filter).sort({ priority: -1 }).limit(10).select('-createdBy');
    res.json({ success: true, data: ads });
  } catch (err) { next(err); }
};
