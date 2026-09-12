const ServicePricing = require('../models/ServicePricing');
const { AppError } = require('../middlewares/errorHandler');

// Default services to seed if database is empty
const defaultServices = [
  { serviceId: 'chat_consultation', name: 'Legal Advice (Chat Consultation)', basePrice: 499 },
  { serviceId: 'voice_consultation', name: 'Legal Advice (Voice Consultation)', basePrice: 799 },
  { serviceId: 'video_consultation', name: 'Legal Advice (Video Consultation)', basePrice: 1199 },
  { serviceId: 'legal_notice', name: 'Legal Notice', basePrice: 1199 },
  { serviceId: 'property_research', name: 'Property Research', basePrice: 2999 },
  { serviceId: 'document_forensic', name: 'Document Forensic Analysis', basePrice: 2999 },
  { serviceId: 'fir_draft', name: 'FIR Draft & Filing', basePrice: 499 },
];

/**
 * Initialize default prices if they don't exist
 */
const initPrices = async () => {
  try {
    const count = await ServicePricing.countDocuments();
    if (count === 0) {
      await ServicePricing.insertMany(defaultServices);
      console.log('Seeded default service prices.');
    }
  } catch (err) {
    console.error('Error seeding service prices:', err);
  }
};

/**
 * @desc    Get all active service prices
 * @route   GET /api/v1/pricing
 * @access  Public
 */
exports.getAllPrices = async (req, res, next) => {
  try {
    // Ensure defaults are created if missing
    await initPrices();

    const query = req.user?.role === 'admin' ? {} : { isActive: true };
    const prices = await ServicePricing.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a service price
 * @route   PUT /api/v1/admin/pricing/:id
 * @access  Private/Admin
 */
exports.updatePrice = async (req, res, next) => {
  try {
    const { basePrice, isActive, name } = req.body;
    
    const pricing = await ServicePricing.findById(req.params.id);
    if (!pricing) {
      return next(new AppError('Service pricing not found', 404));
    }

    if (basePrice !== undefined) pricing.basePrice = basePrice;
    if (isActive !== undefined) pricing.isActive = isActive;
    if (name !== undefined) pricing.name = name;

    await pricing.save();

    res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (err) {
    next(err);
  }
};
