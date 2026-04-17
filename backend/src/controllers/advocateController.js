const Advocate = require('../models/Advocate');
const User = require('../models/User');
const Review = require('../models/Review');
const { AppError } = require('../middlewares/errorHandler');

// GET /api/advocates - list with filters + pagination
exports.getAdvocates = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, specialization, city,
      minFee, maxFee, minRating, sortBy = 'rating',
    } = req.query;

    const filter = { isVerified: true, verificationStatus: 'approved' };
    if (specialization) filter.specializations = specialization;
    if (city) filter['location.address.city'] = new RegExp(city, 'i');
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }
    if (minRating) filter['rating.average'] = { $gte: Number(minRating) };

    const sortMap = {
      rating: { 'rating.average': -1 },
      fee_asc: { consultationFee: 1 },
      fee_desc: { consultationFee: -1 },
      experience: { experience: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.rating;

    const skip = (Number(page) - 1) * Number(limit);
    const [advocates, total] = await Promise.all([
      Advocate.find(filter)
        .populate('user', 'name avatar isActive')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Advocate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: advocates,
      pagination: {
        total, page: Number(page),
        pages: Math.ceil(total / Number(limit)), limit: Number(limit),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/advocates/nearby
exports.getNearby = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 20000, specialization } = req.query;
    if (!lng || !lat) return next(new AppError('lng and lat are required.', 400));

    const filter = {
      isVerified: true, verificationStatus: 'approved',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
    };
    if (specialization) filter.specializations = specialization;

    const advocates = await Advocate.find(filter)
      .populate('user', 'name avatar')
      .limit(20).lean();

    res.json({ success: true, data: advocates });
  } catch (err) { next(err); }
};

// GET /api/advocates/:id
exports.getAdvocate = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name avatar lastSeen');
    if (!advocate) return next(new AppError('Advocate not found.', 404));

    const reviews = await Review.find({ advocate: advocate._id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 }).limit(5).lean();

    res.json({ success: true, data: { ...advocate.toObject(), reviews } });
  } catch (err) { next(err); }
};

// GET /api/advocates/specializations
exports.getSpecializations = async (req, res) => {
  const specs = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
    'Labour Law', 'Constitutional Law', 'Tax Law', 'Consumer Law', 'Cyber Law',
    'Intellectual Property', 'Banking Law', 'Environmental Law', 'Human Rights',
  ];
  res.json({ success: true, data: specs });
};

// GET /api/advocates/cities
exports.getCities = async (req, res, next) => {
  try {
    const cities = await Advocate.distinct('location.address.city', {
      isVerified: true, verificationStatus: 'approved',
    });
    res.json({ success: true, data: cities.sort() });
  } catch (err) { next(err); }
};

// POST /api/advocates/profile (advocate creates/updates profile)
exports.upsertProfile = async (req, res, next) => {
  try {
    const allowed = [
      'barCouncilNumber', 'specializations', 'experience', 'consultationFee',
      'followUpFee', 'location', 'about', 'education', 'languages', 'availability',
    ];
    const data = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    const advocate = await Advocate.findOneAndUpdate(
      { user: req.user._id },
      { ...data, verificationStatus: 'pending' },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name avatar');

    // Update user role if creating advocate profile
    await User.findByIdAndUpdate(req.user._id, { role: 'advocate' });

    res.json({ success: true, data: advocate });
  } catch (err) { next(err); }
};

// GET /api/advocates/me (advocate's own profile)
exports.getMyProfile = async (req, res, next) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id })
      .populate('user', 'name avatar email phone');
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));
    res.json({ success: true, data: advocate });
  } catch (err) { next(err); }
};
