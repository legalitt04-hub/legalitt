const Advocate = require('../models/Advocate');

// Haversine formula fallback
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @GET /api/advocates
exports.getAdvocates = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, specialization, sort = '-rating',
      search, city, minRating, available
    } = req.query;

    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (available === 'true') filter.available = true;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [advocates, total] = await Promise.all([
      Advocate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reviews'),
      Advocate.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: advocates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/advocates/nearby
exports.getNearbyAdvocates = async (req, res) => {
  try {
    const { lat, lng, radius = 20, specialization, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required.' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusMeters = parseFloat(radius) * 1000;

    const filter = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: radiusMeters
        }
      }
    };
    if (specialization) filter.specialization = specialization;

    const advocates = await Advocate.find(filter)
      .limit(parseInt(limit))
      .select('-reviews');

    // Add distance to each advocate
    const advocatesWithDistance = advocates.map(adv => {
      const [advLng, advLat] = adv.location.coordinates;
      const dist = haversineDistance(userLat, userLng, advLat, advLng);
      return {
        ...adv.toJSON(),
        distance: Math.round(dist * 10) / 10
      };
    });

    // Sort by distance
    advocatesWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: advocatesWithDistance,
      meta: { lat: userLat, lng: userLng, radius: parseFloat(radius), count: advocatesWithDistance.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/advocates/:id
exports.getAdvocate = async (req, res) => {
  try {
    const advocate = await Advocate.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found.' });
    res.json({ success: true, data: advocate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/advocates/specializations
exports.getSpecializations = async (req, res) => {
  try {
    const specs = await Advocate.distinct('specialization');
    res.json({ success: true, data: specs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/advocates/cities
exports.getCities = async (req, res) => {
  try {
    const cities = await Advocate.distinct('location.city');
    res.json({ success: true, data: cities.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
